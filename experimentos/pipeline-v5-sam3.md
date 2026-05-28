---
tags:
  - experimento
  - estado/completado
  - tema/sam3
  - tema/vlm
fecha: 2026-05-15
estado: completado
---

# Pipeline Hibrido SAM 3 + VLM (v5)

## Objetivo

Validar si separar deteccion (SAM 3) de identificacion (VLM) elimina el truncamiento de JSON y mejora la arquitectura del pipeline.

## Setup

- **Segmentacion**: Meta SAM 3 (848M params) via HuggingFace.
- **Identificacion**: qwen2.5vl:7b via Ollama.
- **Text prompt**: "product".
- **Threshold**: score >= 0.1, area >= 500px.
- **Muestra**: 5 imagenes del dataset.
- **Hardware**: CPU (Docker) + MPS (Apple Silicon M4 Pro).

## Resultados

| Imagen | GT | SAM 3 detectado | Precision |
|---|---|---|---|
| 0114.jpg | 47 | 43 | 91.5% |
| 0025.jpg | 17 | 47 | 36.2% |
| 0281.jpg | 27 | 55 | 49.1% |
| 0250.jpg | 15 | 54 | 27.8% |
| 0142.jpg | 13 | 39 | 33.3% |
| **TOTAL** | **119** | **238** | **50.0%** |

### Tiempos de ejecucion

| Plataforma | Tiempo/imagen |
|---|---|
| CPU Docker | ~197s |
| MPS nativo (Apple Silicon) | ~142s |
| GPU NVIDIA (estimado) | ~20-30s |

## Insights

1. **0% truncamiento JSON** — cada producto genera un JSON individual, eliminando el principal problema de v4.
2. **SAM 3 no fue disenado para CPU/MPS** — requiere 3 tipos de parches: device hardcodes, pin_memory, y Triton stubs.
3. **MPS funciona con parches** — `PYTORCH_ENABLE_MPS_FALLBACK=1` permite Apple Silicon con 1.4x speedup.
4. **Sobre-conteo se traslado al segmentador** — mascaras superpuestas del mismo producto (NMS pendiente).
5. **Text prompts cortos** dan mejores scores que descripciones largas.

## Limitaciones

- NMS (Non-Maximum Suppression) pendiente — atacaria causa raiz del sobre-conteo (+100%).
- Lento en CPU (197s) — GPU NVIDIA reduciria a ~25s.
- Modelo gated en HuggingFace — requiere token y aprobacion de Meta.

## 🔗 Relacionado

- [[../proyectos/tesis-analisis-estanterias|Tesis]]
- [[pipeline-v1-v4]]
- [[../componentes/shelf-analyzer-sam3]]
- [[../lecciones/sam3-cpu-mps-parches]]
