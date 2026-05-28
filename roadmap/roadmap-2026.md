---
tags:
  - roadmap
  - estado/activo
fecha_actualizacion: 2026-05-27
progreso_general: 75%
---

# Roadmap 2026

## Ahora (mayo-junio)

- [ ] **NMS pre-VLM** — filtrar mascaras superpuestas (IoU > 50%). Ataca causa raiz del sobre-conteo (+100%) y reduce llamadas VLM de ~100 a ~20-40 por imagen. `#prioridad/alta`
- [ ] **Migrar `api_key="ollama"`** a variable de entorno en 6 archivos → [[../lecciones/api-key-hardcoded]]. `#prioridad/baja`
- [ ] **Optimizar parametros SAM 3** — ajustar `--confidence` y `--max-masks` con ground truth completo (15,064 anotaciones). `#prioridad/media`

## Despues (junio-julio)

- [ ] **Evaluar SAM 3.1 Object Multiplex** — 7x mas rapido para multi-objeto. `#prioridad/media`
- [ ] **Deduplicacion fuzzy mejorada** — difflib/Levenshtein en lugar de substring exacto. `#prioridad/baja`
- [ ] **Redaccion del informe final** de tesis. `#prioridad/alta`

## Algún día

- [ ] Fine-tuning de SAM 3 con las 15,064 anotaciones.
- [ ] Ensemble de text prompts ("product" + "bottle" + "item on shelf").
- [ ] GPU NVIDIA para bajar de 142s a ~25s por imagen.
- [ ] Modelo VLM mas grande (13B+) para mejor OCR de precios.

## Hitos cumplidos

- [x] Pipeline v1-v4 iterados (0% → 61% precision).
- [x] Pipeline v5 SAM 3 + VLM (0% truncamiento JSON).
- [x] Webapp Flask funcional con drag & drop.
- [x] Clasificador de documentos (5 categorias).
- [x] Dataset: 651 imagenes, 15,064 anotaciones.

## 🔗 Relacionado

- [[../proyectos/tesis-analisis-estanterias|Tesis]]
- [[../Welcome|Welcome]]
- [[../lecciones/api-key-hardcoded]]
- [[../componentes/shelf-analyzer-sam3]]
