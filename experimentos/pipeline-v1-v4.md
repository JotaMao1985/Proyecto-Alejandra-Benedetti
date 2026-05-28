---
tags:
  - experimento
  - estado/completado
fecha: 2026-04-01
estado: completado
---

# Evolucion del Pipeline v1 → v4 (VLM solo)

## Objetivo

Iterar el pipeline de analisis de estanterias usando solo el VLM (qwen2.5vl:7b) hasta lograr precision aceptable, documentando que tecnicas funcionan y cuales no.

## Setup

- **Modelo**: qwen2.5vl:7b via Ollama.
- **Dataset**: 65 imagenes (10% del dataset completo, seed=42).
- **Ground truth**: 15,064 anotaciones en `archive/annotations.csv`.

## Resultados

| Metrica | v1 | v2 | v3 | **v4** |
|---|---|---|---|---|
| Precision global | 0.0% | 28.5% | 13.3% | **61.0%** |
| Precision prom/imagen | 23.6% | 39.6% | 31.1% | **46.8%** |
| Imagenes >= 70% | 11 (17%) | 18 (28%) | 13 (20%) | **21 (32%)** |
| Sobre-conteo vs GT | +2,894 | +1,120 | +1,358 | **+610** |
| Tiempo prom/imagen | 40.4s | 40.6s | 52.8s | 43.3s |

### Top 10 v4

| Imagen | GT | Modelo | Precision |
|---|---|---|---|
| 0464.jpg | 11 | 11 | 100.0% |
| 0470.jpg | 20 | 20 | 100.0% |
| 0081.jpg | 21 | 20 | 95.2% |
| 0650.jpg | 15 | 14 | 93.3% |
| 0284.jpg | 41 | 37 | 90.2% |

## Descripcion de versiones

- **v1**: Baseline — prompt directo + 2 pasos. Sobre-conteo masivo (0% precision).
- **v2**: Single-pass + few-shot example + cap a 8. Mejora significativa (28.5%).
- **v3**: Split por zonas (descartado). Inconsistencia inter-llamadas empeoro resultados (13.3%).
- **v4**: Prompt refinado con "error comun" explicito + postprocess dinamico + temperatura 0.1. **61% precision.**

## Insights

1. **Few-shot prompting** es la mejora mas efectiva — mas que cualquier post-procesamiento.
2. **Indicar errores comunes explicitos** ayuda: "ERROR COMUN: listar 50+ productos es INCORRECTO".
3. **Multi-pass no funciona** con modelos de 7B — la inconsistencia genera mas duplicados.
4. **Temperatura baja (0.1)** mejora consistencia del JSON.
5. **Post-procesamiento es safety net**, no solucion — solo 4/65 imagenes lo necesitaron en v4.

## Limitaciones

- **Truncamiento de JSON**: 63% de respuestas truncadas en v4 (resuelto en v5 SAM 3).
- **Sobre-conteo sistematico**: el modelo sigue inflando cantidades en estanterias densas.
- **Modelo de 7B tiene techo** para conteo preciso.

## 🔗 Relacionado

- [[../proyectos/tesis-analisis-estanterias|Tesis]]
- [[pipeline-v5-sam3]]
- [[../lecciones/truncamiento-json-vlm]]
- [[../lecciones/sobre-conteo-vlm]]
