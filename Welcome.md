---
tags:
  - indice
fecha_creacion: 2026-05-27
---

# Bienvenida — Proyecto de Grado de Alejandra Benedetti

> **"Procesamiento y analisis estadistico de imagenes digitales mediante herramientas computacionales"**
> — *Maria Alejandra Benedetti Castro, Estadistica, USTA, 2026.*

## Proyecto principal

- [[proyectos/tesis-analisis-estanterias|Tesis: Analisis de Estanterias]] — vista general, cronograma, estado actual.

## Componentes del sistema

| Componente | Estado | Nota |
|---|---|---|
| Pipeline SAM 3 + VLM (v5) | Funcional | [[componentes/shelf-analyzer-sam3]] |
| Webapp Flask | Funcional | [[componentes/webapp-flask]] |
| Clasificador de documentos | Funcional | [[componentes/clasificador-documentos]] |
| Henkel PDV Trainer (Gemini) | Version alternativa | en `~/Downloads/Proyecto aleJandra/` |

## Experimentos

- [[experimentos/pipeline-v1-v4|Evolucion v1→v4]] — de 0% a 61% precision global.
- [[experimentos/pipeline-v5-sam3|Pipeline v5 SAM 3 + VLM]] — 0% truncamiento JSON.

## Lecciones tecnicas

- [[lecciones/api-key-hardcoded]] — patron `api_key="ollama"` hardcoded en 6 archivos.
- [[lecciones/truncamiento-json-vlm]] — 63% de respuestas truncadas en v4.
- [[lecciones/sobre-conteo-vlm]] — VLM infla cantidades en estanterias densas.
- [[lecciones/sam3-cpu-mps-parches]] — SAM 3 requiere parches para CPU/MPS.

## Roadmap

- [[roadmap/roadmap-2026|Roadmap 2026]] — planificacion ligera/agil.

## Tesis

### Objetivos

- [[objetivos/objetivo-general|Objetivo general]]
- 5 objetivos especificos + 5 complementarios → ver [[objetivos/objetivo-general]].

### Hipotesis

- [[hipotesis/hipotesis-general|Hipotesis general]]
- 4 especificas + 7 complementarias → ver [[hipotesis/hipotesis-general]].

### Fases metodologicas

1. [[fases/fase-1-recoleccion|Recoleccion de imagenes]]
2. [[fases/fase-2-universo-muestra|Definicion universo y muestra]]
3. [[fases/fase-3-procesamiento|Procesamiento digital]]
4. [[fases/fase-4-extraccion|Extraccion de variables]]
5. [[fases/fase-5-analisis|Analisis estadistico]]
6. [[fases/fase-6-interpretacion|Interpretacion de resultados]]

### Marco teorico

- [[marco-teorico/procesamiento-digital|Procesamiento digital de imagenes]]
- [[marco-teorico/variables-cuantificables|Variables cuantificables]]
- [[marco-teorico/analisis-estadistico|Analisis estadistico aplicado]]
- [[marco-teorico/universo-y-muestra|Universo y muestra]]

### Decisiones (ADRs)

- [[decisiones/adr-001-ampliacion-alcance|ADR-001: Ampliacion alcance estadistico]]
- [[decisiones/adr-002-bootstrap|ADR-002: Bootstrap como default]]
- [[decisiones/adr-003-diseno-muestral|ADR-003: Diseno muestral estratificado]]
- [[decisiones/adr-004-b1-b2|ADR-004: Activacion condicional B1/B2]] *(superseded)*
- [[decisiones/adr-005-pivote-impacto|ADR-005: Pivote a evaluacion de impacto]]
- [[decisiones/adr-006-pivote-henkel|ADR-006: Pivote a Henkel PDV Trainer]]

### Bibliografia

9 referencias academicas → ver `bibliografia/`.

## Personas

- [[personas/alejandra-benedetti|Maria Alejandra Benedetti]] — investigadora.
- [[personas/javier-sierra|Javier Mauricio Sierra]] — asesor.

## Templates disponibles

- [[templates/proyecto|proyecto]] — proyecto multi-componente.
- [[templates/componente|componente]] — modulo del sistema.
- [[templates/experimento|experimento]] — ejecucion / corrida.
- [[templates/lesson-learned|lesson-learned]] — bug / leccion tecnica.
- [[templates/decision|decision]] — decision de diseno / ADR.
- [[templates/persona|persona]] — contacto.
- [[templates/daily-note|daily-note]] — nota diaria.

## Taxonomia de tags

| Tag | Uso |
|---|---|
| `#proyecto` | Proyectos y sub-proyectos |
| `#componente` | Modulos del sistema |
| `#experimento` | Ejecuciones concretas |
| `#leccion` | Bugs / patrones tecnicos |
| `#decision` | Decisiones de diseno (ADRs) |
| `#objetivo` | Objetivos de tesis |
| `#hipotesis` | Hipotesis |
| `#fase` | Fases metodologicas |
| `#marco-teorico` | Notas conceptuales |
| `#referencia` | Entradas bibliograficas |
| `#persona` | Contactos |
| `#estado/...` | activo / pendiente / completado / bloqueado |
| `#prioridad/...` | critica / alta / media / baja |
| `#tema/...` | vlm / sam3 / ollama / docker / flask / estadistica |

## 🔗 Relacionado

- [[CLAUDE]]
- [[proyectos/tesis-analisis-estanterias]]
- [[roadmap/roadmap-2026]]

#indice
