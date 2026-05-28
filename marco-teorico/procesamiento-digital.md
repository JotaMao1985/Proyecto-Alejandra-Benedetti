---
tags:
  - marco-teorico
  - tema/computer-vision
---

# Procesamiento Digital de Imagenes

## Conceptos clave

- **Pixel**: unidad minima de una imagen digital. Representado por valores de intensidad en cada canal (R, G, B).
- **Segmentacion**: proceso de particionar una imagen en regiones significativas. SAM 3 usa Vision Transformers para segmentacion zero-shot con text prompts.
- **Resolucion y compresion**: factores que afectan la calidad del analisis. WhatsApp comprime imagenes → perdida de detalle.

## Relevancia para el proyecto

- SAM 3 segmenta productos en estanterias usando el text prompt "product".
- OpenCV + PyMuPDF procesan documentos PDF como imagenes para OCR.
- Las mascaras de segmentacion se usan como entrada al VLM para identificacion individual.

## 🔗 Relacionado

- [[variables-cuantificables]]
- [[../componentes/shelf-analyzer-sam3]]
- [[../lecciones/sam3-cpu-mps-parches]]
- [[../bibliografia/referencia-sossa-2011]]
