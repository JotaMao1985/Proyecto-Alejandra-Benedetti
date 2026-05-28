---
tags:
  - componente
  - estado/activo
  - tema/vlm
  - tema/sam3
  - tema/ollama
  - tema/python
estado: activo
progreso: 90%
tecnologia:
  - Python 3.12
  - Meta SAM 3 (848M params)
  - qwen2.5vl:7b (Ollama)
  - PyTorch
  - Pillow
  - OpenCV
  - openpyxl
archivos_clave:
  - app/core.py
  - app/analisis_estanteria_hybrid.py
---

# Pipeline SAM 3 + VLM (v5)

## Descripcion

Pipeline hibrido que combina **Meta SAM 3** (Segment Anything Model 3) para deteccion de productos mediante text prompts y **qwen2.5vl:7b** para identificar nombre y precio de cada producto individualmente.

## Proposito

Separar deteccion de identificacion: SAM 3 segmenta productos visualmente, VLM identifica cada segmento. Esto elimina el truncamiento de JSON (63% en v4 → 0% en v5) y el sobre-conteo sistematico.

## Arquitectura

```
Imagen (RGB)
    → SAM 3 + text prompt: "product"
    → mascaras (score >= 0.1, area >= 500px)
    → crop por mascara → PIL Image
    → VLM (qwen2.5vl:7b) por crop → {"name": "...", "price": ...}
    → deduplicacion → Excel
```

## Estado actual

| Aspecto | Estado |
|---|---|
| Segmentacion SAM 3 | Funcional (CPU/MPS) |
| Identificacion VLM | Funcional |
| Exportacion Excel | Funcional |
| Integracion webapp | Funcional |
| NMS (sobre-conteo) | Pendiente |

## Resultados (5 imagenes, CPU)

| Imagen | GT | SAM 3 | Precision |
|---|---|---|---|
| 0114.jpg | 47 | 43 | 91.5% |
| 0025.jpg | 17 | 47 | 36.2% |
| 0281.jpg | 27 | 55 | 49.1% |
| 0250.jpg | 15 | 54 | 27.8% |
| 0142.jpg | 13 | 39 | 33.3% |
| **TOTAL** | **119** | **238** | **50.0%** |

## Comparativa v4 vs v5

| Metrica | v4 | v5 (SAM 3) |
|---|---|---|
| Precision global | 61.0% | 50.0% |
| Precision prom/imagen | 46.8% | 47.6% |
| Truncamiento JSON | 63% | **0%** |
| Sobre-conteo | +610 (39%) | +119 (100%) |
| Tiempo prom/imagen | 43.3s | 142s (MPS) |

## Funcionalidades

- [x] Segmentacion con SAM 3 + text prompts.
- [x] Identificacion individual por producto con VLM.
- [x] Procesamiento paralelo con ThreadPoolExecutor.
- [x] Deduplicacion de productos.
- [x] Exportacion Excel (3 hojas: resumen, detalle, estadisticas).
- [x] Soporte CPU (Docker) y MPS (Apple Silicon nativo).
- [ ] NMS pre-VLM para reducir mascaras superpuestas.
- [ ] Fine-tuning con las 15,064 anotaciones del dataset.

## Problemas conocidos

- [[../lecciones/sam3-cpu-mps-parches|SAM 3 requiere parches para CPU/MPS]] — parches aplicados pero fragiles.
- [[../lecciones/api-key-hardcoded|api_key="ollama" hardcoded]] — baja severidad pero mala practica.
- Sobre-conteo de SAM 3: mascaras superpuestas del mismo producto → NMS pendiente.
- Lento en CPU: 197s/imagen Docker, 142s MPS nativo.

## 🔗 Relacionado

- [[../proyectos/tesis-analisis-estanterias|Tesis]]
- [[webapp-flask]]
- [[../experimentos/pipeline-v1-v4|Evolucion v1→v4]]
- [[../experimentos/pipeline-v5-sam3|Experimentos SAM 3]]
- [[../lecciones/sam3-cpu-mps-parches]]
- [[../lecciones/api-key-hardcoded]]
