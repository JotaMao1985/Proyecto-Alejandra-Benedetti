---
tags:
  - objetivo
  - estado/completado
tipo: especifico
numero: 2
estado: completado
---

# Objetivo Especifico 2 — Procesamiento y Extraccion

> Desarrollar un modulo que realice el procesamiento digital y la extraccion de variables cuantificables a partir de las imagenes.

## Estado

Completado: pipeline SAM 3 + VLM extrae por cada imagen: productos detectados, nombres, precios, cantidades, posiciones.

## Tecnologias

- Meta SAM 3 para segmentacion.
- qwen2.5vl:7b para identificacion.
- `app/core.py` + `app/analisis_estanteria_hybrid.py`.

## 🔗 Relacionado

- [[objetivo-general]]
- [[../componentes/shelf-analyzer-sam3]]
- [[../experimentos/pipeline-v5-sam3]]
