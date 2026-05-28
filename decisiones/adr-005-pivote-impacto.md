---
tags:
  - decision
  - estado/aceptada
fecha: 2026-05-20
estado: aceptada
area: foco metodologico
supersedes:
  - adr-001-ampliacion-alcance
  - adr-004-b1-b2
---

# ADR-005: Pivote a Evaluacion de Impacto

## Contexto

ADR-001 amplio el alcance estadistico con 7 componentes. Al revisar el ante-proyecto, las hipotesis del PDF apuntan a **impacto** (objetividad, eficiencia, calidad de decisiones), pero ninguna estaba operacionalizada.

## Decision

Reorientar el foco estadistico a **medir el impacto de la herramienta** mediante estudio de concordancia D1, manteniendo A1, A2 reducido, B3 y C2. Descartar A3, B1, B2.

## Razon

- Honra las hipotesis del PDF (no se inventan hipotesis nuevas).
- Narrativa clara: "construi esto, lo probe y demostre que funciona".
- D1 solo requiere 2-3 evaluadores humanos por unas horas.
- Bootstrap transversal cobra mas relevancia (todos los estimadores D1 pueden tener bootstrap CI).

## 🔗 Relacionado

- [[adr-001-ampliacion-alcance]]
- [[adr-002-bootstrap]]
- [[../objetivos/objetivo-complementario-5]]
- [[../hipotesis/hipotesis-complementaria-7]]
