---
tags:
  - proyecto
  - estado/activo
estado: activo
fecha_inicio: 2026-02-01
fecha_objetivo: 2026-07-31
progreso_general: 75%
investigadora: Maria Alejandra Benedetti Castro
programa: Estadistica
institucion: Universidad Santo Tomas
asesor: Javier Mauricio Sierra
---

# Tesis: Analisis de Estanterias con Vision Language Models

> **Titulo**: Procesamiento y analisis estadistico de imagenes digitales mediante herramientas computacionales
> **Repositorio**: [github.com/JotaMao1985/Proyecto-Alejandra-Benedetti](https://github.com/JotaMao1985/Proyecto-Alejandra-Benedetti)

## Descripcion

Plataforma de inventario visual automatizado que utiliza modelos de vision-lenguaje (VLM) locales via Ollama y Meta SAM 3 para analizar fotografias de estanterias de supermercado, extrayendo lista estructurada de productos con cantidades y precios.

Incluye aplicacion web Flask, pipeline CLI, clasificador de documentos, y 4 versiones iterativas del pipeline con mejora progresiva desde 0% hasta 61% de precision global.

## Componentes

| Componente | Estado | Progreso | Nota |
|---|---|---|---|
| [[../componentes/shelf-analyzer-sam3|Pipeline SAM 3 + VLM (v5)]] | Funcional | 90% | 0% truncamiento JSON |
| [[../componentes/webapp-flask|Webapp Flask]] | Funcional | 95% | Drag & drop + progreso en vivo |
| [[../componentes/clasificador-documentos|Clasificador de documentos]] | Funcional | 85% | 5 categorias, OCR + VLM |
| Pipeline v4 (VLM solo) | Completado | 100% | 61% precision global |

## Hitos cumplidos

| Fecha | Hito |
|---|---|
| Feb 2026 | Ante-proyecto aprobado |
| Abr 2026 | Pipeline v1-v4 iterados (0% → 61%) |
| May 2026 | Pipeline v5 SAM 3 + VLM (0% truncamiento) |
| May 2026 | Webapp Flask funcional |
| May 2026 | Clasificador de documentos funcional |
| May 2026 | Dataset: 651 imagenes, 15,064 anotaciones |

## Metricas clave del pipeline

| Metrica | v1 | v4 | v5 (SAM 3) |
|---|---|---|---|
| Precision global | 0% | 61% | 50% |
| Precision prom/imagen | 24% | 47% | 48% |
| Truncamiento JSON | - | 63% | **0%** |
| Sobre-conteo vs GT | +2,894 | +610 | +119 |
| Tiempo prom/imagen | 40s | 43s | 142s (MPS) |

## Stack tecnologico

| Capa | Tecnologia |
|---|---|
| Segmentacion | Meta SAM 3 (848M params) |
| Vision-Lenguaje | qwen2.5vl:7b via Ollama |
| Backend | Flask 3.1 + Python 3.12 |
| Frontend | HTML + Tailwind CSS + vanilla JS |
| Contenedores | Docker + docker-compose |
| OCR/Documentos | PyMuPDF + OpenCV |
| Datos | openpyxl, Polars, NumPy |

## Proximos pasos

- [ ] NMS (Non-Maximum Suppression) pre-VLM para reducir sobre-conteo.
- [ ] Optimizar parametros SAM 3 con ground truth completo.
- [ ] Migrar `api_key="ollama"` a variable de entorno → [[../lecciones/api-key-hardcoded]].
- [ ] Evaluar SAM 3.1 Object Multiplex (7x mas rapido).
- [ ] Redaccion del informe final de tesis.

## 🔗 Relacionado

- [[../Welcome|Welcome]]
- [[../componentes/shelf-analyzer-sam3]]
- [[../componentes/webapp-flask]]
- [[../componentes/clasificador-documentos]]
- [[../experimentos/pipeline-v1-v4]]
- [[../experimentos/pipeline-v5-sam3]]
- [[../roadmap/roadmap-2026]]
- [[../objetivos/objetivo-general]]
- [[../hipotesis/hipotesis-general]]
- [Henkel PDV Trainer (version Gemini)] `~/Downloads/Proyecto aleJandra/`
