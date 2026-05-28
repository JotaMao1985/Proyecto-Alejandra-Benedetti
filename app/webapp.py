"""
webapp.py — Aplicación web Flask para análisis de estanterías con SAM 3 + VLM.

Permite subir imágenes de estanterías, analizar con el pipeline híbrido
SAM 3 + VLM, y descargar un informe Excel con los resultados.
"""

import io
import os
import re
import uuid
import time
import threading
from pathlib import Path

from flask import Flask, request, jsonify, render_template, send_file, abort
from werkzeug.utils import secure_filename
from PIL import Image, UnidentifiedImageError
from openai import OpenAI

from core import (
    load_sam3_model, analyze_shelf, deduplicate_products,
    export_to_excel, SAM3_TEXT_PROMPT, OLLAMA_URL, VLM_MODEL,
)

app = Flask(__name__)

# Configuración
APP_DATA_DIR = Path(os.environ.get("APP_DATA_DIR", "/data"))
UPLOAD_DIR = APP_DATA_DIR / "uploads"
RESULTS_DIR = APP_DATA_DIR / "resultados" / "webapp"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
RESULTS_DIR.mkdir(parents=True, exist_ok=True)
UPLOAD_DIR_RESOLVED = UPLOAD_DIR.resolve()

# Límite de tamaño del request completo (suma de archivos en /analizar).
# 50 MB permite ~25 imágenes de 2 MB; el servidor responde 413 si se excede.
app.config["MAX_CONTENT_LENGTH"] = int(os.environ.get("MAX_UPLOAD_MB", "50")) * 1024 * 1024

ALLOWED_EXTS = (".jpg", ".jpeg", ".png")
JOB_ID_RE = re.compile(r"^[0-9a-f]{8}$")

# Estado global de jobs
jobs = {}

# Modelo SAM 3 (se carga una vez al iniciar)
sam_processor = None
vlm_client = None


def init_models():
    """Carga SAM 3 y configura el cliente VLM."""
    global sam_processor, vlm_client

    device = os.environ.get("SAM_DEVICE", None)
    print("[INFO] Inicializando modelos...")
    sam_processor = load_sam3_model(device=device, confidence_threshold=0.1)
    vlm_client = OpenAI(base_url=OLLAMA_URL, api_key=os.getenv("VLM_API_KEY", "ollama"))
    print("[OK] Modelos listos")


# =============================================================================
# Rutas
# =============================================================================

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/analizar", methods=["POST"])
def analizar():
    """Sube imágenes e inicia análisis en background."""
    if "images" not in request.files:
        return jsonify({"error": "No se enviaron imágenes"}), 400

    files = request.files.getlist("images")
    if not files or files[0].filename == "":
        return jsonify({"error": "No se seleccionaron archivos"}), 400

    job_id = str(uuid.uuid4())[:8]
    job_dir = UPLOAD_DIR / job_id
    job_dir.mkdir(parents=True, exist_ok=True)

    image_paths = []
    for f in files:
        if not f.filename:
            continue
        safe_name = secure_filename(f.filename)
        if not safe_name or not safe_name.lower().endswith(ALLOWED_EXTS):
            continue
        path = job_dir / safe_name
        f.save(str(path))
        try:
            with Image.open(str(path)) as img:
                img.verify()
        except (UnidentifiedImageError, OSError, Image.DecompressionBombError):
            path.unlink(missing_ok=True)
            continue
        image_paths.append(str(path))

    if not image_paths:
        return jsonify({"error": "No se enviaron imágenes válidas (jpg/png)"}), 400

    jobs[job_id] = {
        "estado": "iniciando",
        "total": len(image_paths),
        "procesadas": 0,
        "imagen_actual": "",
        "resultados": [],
        "excel_path": None,
        "inicio": time.time(),
    }

    thread = threading.Thread(
        target=_run_analysis,
        args=(job_id, image_paths),
        daemon=True,
    )
    thread.start()

    return jsonify({"job_id": job_id, "total": len(image_paths)})


@app.route("/estado/<job_id>")
def estado(job_id):
    """Retorna el estado actual del job."""
    job = jobs.get(job_id)
    if not job:
        return jsonify({"error": "Job no encontrado"}), 404

    elapsed = time.time() - job["inicio"]
    procesadas = job["procesadas"]
    total = job["total"]

    eta = None
    if procesadas > 0 and procesadas < total:
        eta = int((elapsed / procesadas) * (total - procesadas))

    return jsonify({
        "estado": job["estado"],
        "total": total,
        "procesadas": procesadas,
        "imagen_actual": job["imagen_actual"],
        "elapsed": int(elapsed),
        "eta": eta,
        "resultados": job["resultados"],
        "excel_listo": job["excel_path"] is not None,
    })


@app.route("/descargar/<job_id>")
def descargar(job_id):
    """Descarga el Excel generado."""
    job = jobs.get(job_id)
    if not job or not job["excel_path"]:
        return jsonify({"error": "Excel no disponible"}), 404

    return send_file(
        job["excel_path"],
        as_attachment=True,
        download_name=f"analisis_estanterias_{job_id}.xlsx",
    )


@app.route("/thumbnail/<job_id>/<filename>")
def thumbnail(job_id, filename):
    """Devuelve una miniatura JPEG de una imagen del job.

    Defensa contra path traversal: job_id se valida por regex,
    filename se sanitiza con secure_filename, y la ruta resuelta
    se compara contra UPLOAD_DIR_RESOLVED para descartar enlaces
    o componentes `..` que escapen del directorio de uploads.
    """
    if not JOB_ID_RE.match(job_id):
        abort(404)

    safe_name = secure_filename(filename)
    if not safe_name or not safe_name.lower().endswith(ALLOWED_EXTS):
        abort(404)

    try:
        path = (UPLOAD_DIR / job_id / safe_name).resolve(strict=True)
    except (FileNotFoundError, OSError):
        abort(404)

    try:
        path.relative_to(UPLOAD_DIR_RESOLVED)
    except ValueError:
        abort(404)

    try:
        with Image.open(str(path)) as img:
            img.thumbnail((200, 200))
            buf = io.BytesIO()
            img.convert("RGB").save(buf, format="JPEG", quality=70)
    except (UnidentifiedImageError, OSError, Image.DecompressionBombError):
        abort(404)

    buf.seek(0)
    return send_file(buf, mimetype="image/jpeg")


@app.errorhandler(413)
def too_large(_e):
    limit_mb = app.config["MAX_CONTENT_LENGTH"] // (1024 * 1024)
    return jsonify({"error": f"Petición demasiado grande (límite {limit_mb} MB)"}), 413


# =============================================================================
# Background Job
# =============================================================================

def _run_analysis(job_id, image_paths):
    """Ejecuta el análisis en background."""
    job = jobs[job_id]
    job["estado"] = "procesando"
    results = []

    for i, img_path in enumerate(image_paths):
        filename = Path(img_path).name
        job["imagen_actual"] = filename

        def progress_cb(procesadas_vlm, total_vlm):
            pass  # Progreso VLM interno, no lo exponemos

        result = analyze_shelf(
            img_path,
            sam_processor,
            vlm_client,
            text_prompt=SAM3_TEXT_PROMPT,
            max_workers=1,
            min_mask_area=500,
            vlm_model=VLM_MODEL,
            progress_callback=progress_cb,
        )
        result.products = deduplicate_products(result.products)
        result.total_unique_products = len(result.products)
        results.append(result)

        job["procesadas"] = i + 1
        job["resultados"].append({
            "imagen": result.image_name,
            "productos": result.total_unique_products,
            "masks": result.sam_masks_generated,
            "tiempo": round(result.processing_time, 1),
            "detalle": [
                {"name": p.name, "price": p.price, "confidence": round(p.confidence, 2)}
                for p in result.products
                if p.name not in ("error_parse", "desconocido")
            ],
        })

    # Generar Excel
    excel_path = str(RESULTS_DIR / f"analisis_{job_id}.xlsx")
    export_to_excel(results, excel_path)
    job["excel_path"] = excel_path
    job["estado"] = "completado"
    job["imagen_actual"] = ""


# =============================================================================
# Main
# =============================================================================
if __name__ == "__main__":
    init_models()
    port = int(os.environ.get("FLASK_PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
