---
tags:
  - decision
  - estado/aceptada
fecha: 2026-05-20
estado: aceptada
area: foco metodologico
---

# ADR-002: Bootstrap como Metodo Inferencial por Defecto

## Contexto

El ante-proyecto original no especifica metodos inferenciales. Para los componentes estadisticos complementarios (A1, A2, B3, C2, D1) se necesita un metodo inferencial consistente.

## Decision

Usar **bootstrap no parametrico** como metodo inferencial por defecto para todos los estimadores del proyecto.

## Alternativas

| Alt | Pros | Contras | Dec |
|---|---|---|---|
| Bootstrap | No asume distribucion; versatil; funciona con muestras pequenas | Computacionalmente intensivo | ✅ |
| Metodos parametricos | Mas eficiente si supuestos se cumplen | Requiere verificar supuestos; no robusto | ❌ |
| Bayesiano | Incorpora conocimiento previo | Requiere especificar priors; mas complejo | ❌ |

## Razon

- El universo de imagenes no tiene distribucion conocida a priori.
- Bootstrap funciona con cualquier estadistico (medias, kappa, ICC, percentiles).
- Las metricas de concordancia (D1) no tienen formulas parametricas simples para sus intervalos de confianza.

## 🔗 Relacionado

- [[adr-005-pivote-impacto]]
- [[../objetivos/objetivo-complementario-5]]
- [[../hipotesis/hipotesis-complementaria-7]]
