---
tags:
  - marco-teorico
  - tema/estadistica
---

# Analisis Estadistico Aplicado a Imagenes

## Conceptos clave

- **Estadistica descriptiva**: media, mediana, desviacion estandar, valores extremos de las variables extraidas.
- **Bootstrap**: metodo de remuestreo no parametrico para construir intervalos de confianza sin asumir distribucion. Adoptado como default (ADR-002).
- **Concordancia inter-evaluador**: metricas como kappa de Cohen, ICC, Bland-Altman para medir acuerdo entre evaluadores humanos y herramienta IA.

## Relevancia para el proyecto

- Las metricas de precision del pipeline (precision global, precision por imagen) son estadisticas descriptivas.
- Bootstrap CI se usara para todos los estimadores de concordancia en D1.
- PCA + clustering (A2) caracterizaran el espacio de features del dataset.

## 🔗 Relacionado

- [[../objetivos/objetivo-especifico-3]]
- [[../hipotesis/hipotesis-complementaria-7]]
- [[../decisiones/adr-002-bootstrap]]
- [[../bibliografia/referencia-statistical-learning-2026]]
