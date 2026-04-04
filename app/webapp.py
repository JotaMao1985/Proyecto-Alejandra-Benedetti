"""
webapp.py — Aplicación web Flask para análisis de estanterías con SAM 3 + VLM.

Permite subir imágenes de estanterías, analizar con el pipeline híbrido
SAM 3 + VLM, y descargar un informe Excel con los resultados.
"""

import os
import uuid
import time
import threading
from pathlib import Path
from dataclasses import asdict

from flask import Flask, request, jsonify, render_template, send_file
from openai import OpenAI

from core import (
    load_sam3_model, analyze_shelf, deduplicate_products,
    export_to_excel, SAM3_TEXT_PROMPT, OLLAMA_URL, VLM_MODEL,
)

app = Flask(__name__)

# Configuración
UPLOAD_DIR = Path("/data/uploads")
RESULTS_DIR = Path("/data/resultados/webapp")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
RESULTS_DIR.mkdir(parents=True, exist_ok=True)

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
    vlm_client = OpenAI(base_url=OLLAMA_URL, api_key="ollama")
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
        if f.filename and f.filename.lower().endswith((".jpg", ".jpeg", ".png")):
            path = job_dir / f.filename
            f.save(str(path))
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
    """Retorna un thumbnail base64 de una imagen del job."""
    path = UPLOAD_DIR / job_id / filename
    if not path.exists():
        return jsonify({"error": "Imagen no encontrada"}), 404

    from PIL import Image
    import base64, io

    img = Image.open(str(path))
    img.thumbnail((200, 200))
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=70)
    b64 = base64.b64encode(buf.getvalue()).decode()

    return jsonify({"thumbnail": f"data:image/jpeg;base64,{b64}"})


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
    app.run(host="0.0.0.0", port=5000, debug=False)
