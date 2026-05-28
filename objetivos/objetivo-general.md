---
tags:
  - objetivo
  - estado/activo
tipo: general
estado: activo
---

# Objetivo General

> Desarrollar un sistema que permita el procesamiento y analisis estadistico de imagenes digitales, con el fin de transformar la informacion visual en datos cuantificables que faciliten la caracterizacion del universo de imagenes en el contexto empresarial.

## Descomposicion

1. [[objetivo-especifico-1|Seleccion y visualizacion]] — entrada del sistema.
2. [[objetivo-especifico-2|Procesamiento y extraccion]] — nucleo.
3. [[objetivo-especifico-3|Estadistica descriptiva]] — analisis.
4. [[objetivo-especifico-4|Sistematizacion]] — organizacion.
5. [[objetivo-especifico-5|Evaluacion de utilidad]] — validacion.

## Complementarios (asesor)

6. [[objetivo-complementario-1|Diseno muestral probabilistico]] (A1).
7. [[objetivo-complementario-2|PCA + clustering + bootstrap]] (A2+C2).
8. [[objetivo-complementario-4|DOE sobre el pipeline]] (B3).
9. [[objetivo-complementario-5|Estudio D1 de concordancia]] — foco de impacto.

## Criterio de logro

- Sistema operativo que toma imagenes y produce reporte de estadisticas descriptivas.
- Pipeline SAM 3 + VLM funcional con 0% truncamiento JSON.
- Webapp Flask desplegable via Docker.
- Resultados interpretados y documentados en informe final.

## 🔗 Relacionado

- [[../proyectos/tesis-analisis-estanterias|Tesis]]
- [[../hipotesis/hipotesis-general]]
- [[../decisiones/adr-005-pivote-impacto]]
