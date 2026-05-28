---
tags:
  - componente
  - estado/activo
  - tema/clasificacion
  - tema/ocr
  - tema/python
estado: activo
progreso: 85%
tecnologia:
  - Python 3.12
  - PyMuPDF
  - OpenCV
  - qwen2.5vl:7b (Ollama)
  - openpyxl
archivos_clave:
  - app/main_clasificacion.py
  - app/main_clasificacion_1.py
  - app/main_clasificacion_Text.py
  - app/generacion_archivos.py
  - app/prueba_conexion.py
---

# Clasificador de Documentos con VLM

## Descripcion

Pipeline de clasificacion automatica de documentos administrativos usando Qwen2.5-VL via Ollama. Clasifica PDFs en 5 categorias con OCR + deskewing + VLM multimodal.

## Proposito

Automatizar la clasificacion de documentos empresariales (quejas, contratos, resoluciones, informes, comunicaciones) usando vision-lenguaje para leer PDFs como imagenes.

## Arquitectura

- **Entrada**: PDF (puede ser escaneado).
- **Preprocesamiento**: PyMuPDF → render pagina → OpenCV deskew.
- **Clasificacion**: Qwen2.5-VL analiza la imagen y asigna categoria.
- **Salida**: Excel con clasificacion por documento.

## Categorias

| Codigo | Categoria |
|---|---|
| QR | Queja y Reclamo |
| CT | Contrato |
| RA | Resolucion Administrativa |
| IT | Informe Tecnico |
| CI | Comunicacion Interna |

## Estado actual

| Aspecto | Estado |
|---|---|
| Clasificacion VLM | Funcional |
| OCR + deskewing | Funcional |
| Generacion de datos sinteticos | Funcional |
| Exportacion Excel | Funcional |
| Validacion | Pendiente |

## Funcionalidades

- [x] Clasificacion multimodal con Qwen2.5-VL.
- [x] Deskewing automatico de paginas torcidas.
- [x] Generador de documentos sinteticos (Faker + ReportLab).
- [x] Exportacion a Excel.
- [ ] Metricas de precision por categoria.
- [ ] Soporte para multiples paginas por documento.

## 🔗 Relacionado

- [[../proyectos/tesis-analisis-estanterias|Tesis]]
- [[shelf-analyzer-sam3]]
- [[../lecciones/api-key-hardcoded]]
