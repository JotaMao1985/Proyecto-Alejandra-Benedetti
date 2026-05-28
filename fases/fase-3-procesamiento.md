---
tags:
  - fase
  - estado/completado
fase: 3
---

# Fase 3 — Procesamiento Digital

## Objetivo

Aplicar tecnicas de procesamiento digital a las imagenes recolectadas para prepararlas para la extraccion de variables.

## Estado

Completado: pipeline SAM 3 + VLM procesa imagenes con segmentacion y clasificacion automatica.

## Actividades

- [x] Pipeline v1-v4 (VLM solo) — de 0% a 61% precision.
- [x] Pipeline v5 (SAM 3 + VLM) — 0% truncamiento JSON.
- [x] Implementacion CPU y MPS (Apple Silicon).

## 🔗 Relacionado

- [[fase-1-recoleccion]]
- [[fase-4-extraccion]]
- [[../componentes/shelf-analyzer-sam3]]
- [[../experimentos/pipeline-v5-sam3]]
