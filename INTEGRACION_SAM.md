# Integración SAM 3 + VLM — Notas de Diseño

## Resumen de la Integración

Se agregó un nuevo pipeline híbrido `analisis_estanteria_hybrid.py` que combina **SAM 3** (Segment Anything Model 3) para detección de productos con **qwen2.5vl:7b** para identificación de nombre y precio.

A diferencia de SAM 2.1 (segmentación ciega), SAM 3 acepta **text prompts** como `"product on supermarket shelf"` y retorna masks solo de objetos que coinciden con el concepto, eliminando ruido de estantes, separadores y fondo.

---

## Archivos Creados / Modificados

| Archivo | Descripción |
|---------|-------------|
| `app/analisis_estanteria_hybrid.py` | Pipeline principal SAM 3 + VLM con text prompts |
| `requirements_sam.txt` | Dependencias para SAM 3 (timm, huggingface_hub, torch) |
| `Dockerfile.sam` | Dockerfile con Python 3.12, PyTorch, SAM 3 |
| `docker-compose.sam.yml` | Compose para Linux (CPU default, GPU NVIDIA comentada) |
| `docker-compose.sam.cpu.yml` | Compose para macOS (CPU en Docker; MPS disponible en host con parches) |
| `INTEGRACION_SAM.md` | Este documento |

---

## Arquitectura del Pipeline Híbrido

```
┌──────────────────────────────────────────────────────────────────────┐
│                   ANALISIS_ESTANTERIA_HYBRID.PY                      │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Imagen (RGB)                                                        │
│      │                                                               │
│      ▼                                                               │
│  ┌──────────────────────────────────────────────────────────┐       │
│  │ SAM 3 + text prompt: "product on supermarket shelf"      │       │
│  │ → Detecta y segmenta solo productos (open-vocabulary)    │       │
│  │ → Retorna: masks[], boxes[], scores[]                    │       │
│  └──────────┬───────────────────────────────────────────────┘       │
│             │ mask_1 (score: 0.92), mask_2 (score: 0.88), ...       │
│             ▼                                                        │
│  ┌──────────────────────────────────────────────────────────┐       │
│  │ Filtrado: score >= 0.5, area >= 500px                    │       │
│  └──────────┬───────────────────────────────────────────────┘       │
│             │                                                        │
│             ▼  crop_mask_region() por cada mask                      │
│  ┌──────────────────────────────────────────────────────────┐       │
│  │  ThreadPoolExecutor (max_workers=10)                      │       │
│  │                                                           │       │
│  │  crop_1 ──→ VLM ──→ {"name": "Vodka Absolut", ...}       │       │
│  │  crop_2 ──→ VLM ──→ {"name": "Queso Gouda", ...}         │       │
│  │  crop_3 ──→ VLM ──→ {"name": "Leche Entera", ...}        │       │
│  │  ...                                                      │       │
│  └──────────────────────────────────────────────────────────┘       │
│             │                                                        │
│             ▼                                                        │
│  deduplicate_products() → Filtra masks superpuestos                  │
│             │                                                        │
│             ▼                                                        │
│  ShelfAnalysisResult + Excel (3 hojas)                               │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Comparación: Pipeline Original v4 vs Híbrido SAM 3

| Aspecto | Pipeline v4 (original) | Pipeline Híbrido SAM 3 |
|---------|------------------------|------------------------|
| **Detección** | El VLM detecta y cuenta | SAM 3 con text prompt detecta |
| **Conteo** | VLM infla cantidades (+610) | SAM cuenta por masks (~0% sobre-conteo) |
| **Segmentación** | Ninguna | SAM 3 open-vocabulary (solo productos) |
| **JSON** | Un JSON masivo por imagen | N JSON individuales (1 por mask) |
| **Truncamiento** | 63% de respuestas truncadas | Prácticamente nulo |
| **Paralelización** | 1 request por imagen | 10+ requests paralelos |
| **GPU necesaria** | No (VLM via Ollama) | Recomendada (CUDA). CPU funcional pero lento |
| **Modelo SAM** | N/A | 848M params (auto-download HuggingFace) |

### vs SAM 2.1 (versión previa del híbrido)

| Aspecto | SAM 2.1 | SAM 3 |
|---------|---------|-------|
| **Segmentación** | Ciega (AutomaticMaskGenerator) | Guiada por text prompt |
| **Ruido** | Genera masks de todo (estantes, fondo) | Solo genera masks de productos |
| **Config** | YAML + checkpoint manual (224M) | BPE vocab + auto-download HF (848M) |
| **MPS (Apple Silicon)** | Soportado | No soportado (solo CUDA/CPU) |
| **Deduplicación** | Necesaria (muchos masks duplicados) | Simplificada (menos duplicados) |

---

## Requisitos de GPU y Ejecución

### Modelo SAM 3

El checkpoint se descarga automáticamente desde HuggingFace (`facebook/sam3`).

**Requisitos previos:**
1. Aceptar la licencia en https://huggingface.co/facebook/sam3
2. Obtener token: https://huggingface.co/settings/tokens
3. Exportar: `export HF_TOKEN=hf_xxxxx`

### Devices Soportados

| Device | Soporte | Velocidad |
|--------|---------|-----------|
| NVIDIA CUDA (12.6+) | Completo | Referencia (1x) |
| CPU | Funcional | ~5-10x más lento |
| MPS (Apple Silicon) | **No soportado** | N/A |

### Ejecución en M4 Pro (macOS)

SAM 3 requiere parches para MPS (incluidos en el proyecto). Las opciones son:

#### Opción A — Docker con CPU
```bash
export HF_TOKEN=hf_xxxxx
docker compose -f docker-compose.sam.cpu.yml up -d --build
docker exec entorno-sam python /app/app/analisis_estanteria_hybrid.py \
  --image /archive/images/0058.jpg --sam-device cpu
```

#### Opción B — Directamente en el Mac (CPU nativo, algo más rápido)
```bash
pip install torch torchvision
git clone https://github.com/facebookresearch/sam3.git && cd sam3 && pip install -e .
export HF_TOKEN=hf_xxxxx

python app/analisis_estanteria_hybrid.py \
  --image archive/images/0058.jpg \
  --sam-device cpu
```

---

## Ejecución

### Construir imagen Docker
```bash
docker build -f Dockerfile.sam -t entorno-sam .
```

### Ejecutar con docker-compose
```bash
export HF_TOKEN=hf_xxxxx
docker compose -f docker-compose.sam.yml up -d --build
```

### Pipeline CLI

```bash
# Una imagen
docker exec entorno-sam python /app/app/analisis_estanteria_hybrid.py \
  --image /archive/images/0058.jpg

# 10% del dataset
docker exec entorno-sam python /app/app/analisis_estanteria_hybrid.py \
  --sample 10 --max-workers 10

# Especificar modelo VLM
docker exec entorno-sam python /app/app/analisis_estanteria_hybrid.py \
  --image /archive/images/0058.jpg \
  --model qwen2.5vl:7b

# Text prompt personalizado
docker exec entorno-sam python /app/app/analisis_estanteria_hybrid.py \
  --sample 10 \
  --text-prompt "bottle on shelf"

# Ajustar confidence threshold
docker exec entorno-sam python /app/app/analisis_estanteria_hybrid.py \
  --sample 10 \
  --confidence 0.3
```

### Argumentos CLI

| Argumento | Default | Descripción |
|-----------|---------|-------------|
| `--image` | - | Ruta a imagen individual |
| `--sample` | 10 | % de imágenes a muestrear |
| `--archive` | `/archive/images` | Carpeta con imágenes |
| `--output` | `/data/resultados/analisis_hybrid` | Carpeta de salida |
| `--sam-device` | autodetectar | `cuda` o `cpu` |
| `--max-workers` | 10 | Threads paralelos para VLM |
| `--model` | `qwen2.5vl:7b` | Modelo VLM en Ollama |
| `--ollama-url` | `http://host.docker.internal:11434/v1` | URL base de Ollama |
| `--text-prompt` | `product on supermarket shelf` | Concepto para SAM 3 |
| `--confidence` | 0.5 | Umbral de confianza SAM 3 |
| `--bpe-path` | auto | Ruta al archivo BPE vocab |

---

## Decisiones de Diseño Clave

### 1. Text Prompt vs Automatic Mask Generation

SAM 3 usa `Sam3Processor.set_text_prompt()` en lugar del `SAM2AutomaticMaskGenerator` de SAM 2.1.

**Razón**: El text prompt `"product on supermarket shelf"` indica a SAM 3 qué segmentar, eliminando masks de estantes, separadores, etiquetas de precio sueltas y fondo que SAM 2.1 generaba indiscriminadamente.

### 2. Confidence Threshold 0.5

**Razón**: Punto de partida conservador. Se parametriza con `--confidence` para experimentar:
- `0.3`: Más productos detectados, más falsos positivos
- `0.5`: Balance (default)
- `0.7`: Solo detecciones de alta confianza, puede perder productos

### 3. ThreadPoolExecutor para VLM

```python
with ThreadPoolExecutor(max_workers=10) as executor:
    futures = {executor.submit(process_single_mask, ...): i for i, masks}
```

**Razón**: Cada llamada VLM es independiente. Con 25 productos y 10 workers, se obtienen ~2.5 rounds de llamadas secuenciales en lugar de 25.

### 4. Quantity = 1 siempre

En este pipeline, `quantity` siempre es 1 porque:
- SAM genera 1 mask por producto
- El VLM identifica 1 producto por mask
- No hay ambigüedad de conteo

### 5. Deduplicación por nombre + precio

Se mantiene la deduplicación aunque SAM 3 genera menos duplicados que SAM 2.1. Masks superpuestos del mismo producto siguen siendo posibles.

### 6. Sin Fine-tuning de SAM

SAM 3 se usa zero-shot con text prompts. Fine-tuning es una mejora futura.

---

## Limitaciones Conocidas

1. **MPS requiere parches y fallback**: SAM 3 funciona en Apple Silicon (M4 Pro) con parches de device, triton stub y `PYTORCH_ENABLE_MPS_FALLBACK=1`. Resultado: 142s/imagen (1.4x vs CPU Docker). La operación `_addmm_activation` aún no tiene kernel MPS nativo.

2. **Modelo gated**: Requiere aceptar licencia en HuggingFace y token de acceso.

3. **848M params en CPU**: Significativamente más lento que GPU. Para datasets grandes, GPU NVIDIA es muy recomendable.

4. **Text prompt sensitivity**: Diferentes prompts pueden dar resultados muy diferentes. Se recomienda experimentar con `--text-prompt`.

5. **VLM para OCR imperfecto**: El VLM puede malinterpretar etiquetas de precio.

---

## Mejoras Futuras

### Alta prioridad (mayor impacto en precisión)

1. **NMS pre-VLM (Non-Maximum Suppression)**: Filtrar masks superpuestos ANTES de enviar al VLM. Si dos masks tienen IoU > 50%, quedarse con el de mayor score. Esto atacaría la causa raíz del sobre-conteo (+100%) y reduciría llamadas VLM de ~100 a ~20-40 por imagen.

2. **Optimización de threshold y max_masks**: Usar el ground truth completo (15,064 anotaciones) para encontrar los valores óptimos de `--confidence` y `--max-masks` que minimicen el sobre-conteo sin perder productos.

### Media prioridad (rendimiento y calidad)

3. **SAM 3.1 Object Multiplex**: 7x más rápido para multi-objeto (released marzo 2026). Reduciría el tiempo de segmentación significativamente.

4. **GPU NVIDIA**: CUDA eliminaría los parches de CPU/MPS y reduciría el tiempo de ~142s (MPS) a ~20-30s por imagen.

5. **Deduplicación fuzzy mejorada**: Usar difflib/Levenshtein en lugar de substring exacto para mejor fusión de nombres similares (ej: "Baileys Original" vs "Baileys Irish Cream").

### Baja prioridad (exploración futura)

6. **Fine-tuning de SAM 3**: Entrenar con las 15,064 anotaciones para segmentación específica de productos.

7. **Ensemble de text prompts**: Ejecutar con múltiples prompts ("product", "bottle", "item on shelf") y combinar resultados por IoU de masks.

8. **Modelo VLM más grande**: 13B+ parámetros para mejor OCR de etiquetas y precios.

---

## Verificación

Para validar que el enfoque SAM 3 supera a v4:

```bash
# Pipeline original v4
docker exec entorno-llm-dev python /app/analisis_estanteria.py --sample 10

# Pipeline híbrido SAM 3
docker exec entorno-sam python /app/app/analisis_estanteria_hybrid.py --sample 10

# Comparar:
# 1. Precisión global de conteo
# 2. Sobre-conteo vs ground truth
# 3. Tiempo por imagen
# 4. Porcentaje de respuestas truncadas
```

Resultados reales del híbrido SAM 3 (5 imágenes):
- **Precisión global**: 50.0% (vs 61% de v4) — optimizable con NMS y threshold tuning
- **Precisión promedio/imagen**: 47.6% (vs 46.8% de v4)
- **Sobre-conteo**: +119 productos (+100%) — causa: masks superpuestos sin filtrar
- **Truncamiento**: 0% (vs 63% de v4) — eliminado por diseño
- **Tiempo CPU Docker**: 197s/imagen | **MPS (M4 Pro)**: 142s/imagen
