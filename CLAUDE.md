# CLAUDE.md — Convenciones del Vault (Proyecto Alejandra Benedetti)

## Identidad

Eres mi asistente para el proyecto de grado de **Maria Alejandra Benedetti Castro** (Estadistica, Universidad Santo Tomas, 2026):

> **"Procesamiento y analisis estadistico de imagenes digitales mediante herramientas computacionales"**

El proyecto consiste en una plataforma de analisis de estanterias con Vision Language Models (SAM 3 + qwen2.5vl:7b) + clasificacion de documentos + aplicacion web Flask.

## Alcance del proyecto

- **Tipo**: tesis / opcion de grado.
- **Stack**: Python 3.12, Flask, Ollama (qwen2.5vl:7b), Meta SAM 3, Docker, PyMuPDF, OpenCV.
- **Dataset**: 651 imagenes de estanterias con 15,064 anotaciones (ground truth).
- **Precision global**: 61% (v4 VLM solo), 50% (v5 SAM 3 + VLM), con 0% truncamiento JSON.
- **Componentes**: pipeline SAM 3 + VLM, webapp Flask, clasificador de documentos.

## Convenciones de Obsidian (OBLIGATORIAS)

- SIEMPRE usar `[[doble corchete]]` para enlaces internos.
- SIEMPRE usar tags con `#` (ej: `#proyecto`, `#componente`, `#leccion`).
- SIEMPRE usar la plantilla correspondiente de `templates/` al crear una nota nueva.
- Nombres de archivo en minusculas con guiones: `shelf-analyzer-sam3.md`.
- Fechas siempre en formato `YYYY-MM-DD`.
- Cada nota debe tener una seccion `## 🔗 Relacionado` al final.
- Idioma: **espanol**.

## Estructura de la boveda

| Carpeta | Contenido |
|---|---|
| `proyectos/` | Proyecto principal de tesis. |
| `componentes/` | Modulos de codigo (pipeline SAM 3, webapp, clasificador). |
| `experimentos/` | Ejecuciones y evolucion del pipeline (v1→v5). |
| `lecciones/` | Bugs / patrones tecnicos. Raiz + mitigacion + caso de prueba. |
| `objetivos/` | Objetivos general y especificos de la tesis. |
| `hipotesis/` | Hipotesis de la tesis. |
| `fases/` | Fases metodologicas. |
| `marco-teorico/` | Notas conceptuales. |
| `decisiones/` | ADRs: decisiones metodologicas justificadas. |
| `personas/` | Alejandra, asesor, contactos. |
| `bibliografia/` | Referencias academicas. |
| `roadmap/` | Planificacion ligera/agil. |
| `ideas/` | Ideas sueltas. |
| `inbox/` | Pendiente de procesar. |
| `daily-notes/` | Notas diarias (`YYYY-MM-DD.md`). |
| `research/` | Investigaciones puntuales. |
| `resources/` | Material de referencia. |
| `templates/` | Plantillas base. |

## Tags principales

### Tipo de nota
- `#proyecto`, `#componente`, `#experimento`, `#leccion`, `#decision`, `#persona`, `#objetivo`, `#hipotesis`, `#fase`, `#marco-teorico`, `#referencia`, `#idea`, `#daily`, `#roadmap`

### Estado
- `#estado/activo`, `#estado/pausado`, `#estado/completado`, `#estado/bloqueado`

### Prioridad
- `#prioridad/critica`, `#prioridad/alta`, `#prioridad/media`, `#prioridad/baja`

### Tematico
- `#tema/vlm`, `#tema/sam3`, `#tema/ollama`, `#tema/python`, `#tema/docker`, `#tema/flask`, `#tema/computer-vision`, `#tema/clasificacion`, `#tema/estadistica`

## Reglas de comportamiento

- Si encuentras un bug, documentalo en `lecciones/` con raiz + mitigacion + caso de prueba.
- Si tomas una decision de diseno, documentala en `decisiones/` con fecha + razon + alternativas descartadas.
- Si un experimento valida/refuta una hipotesis, enlaza ambos.
- Si una idea de `ideas/` madura, conviertela en tarea del `roadmap/`.
- Si algo entra sin contexto, dejalo en `inbox/`.
- Enlaza cada nota nueva desde al menos otra nota existente.
- No dupliques — usa wikilinks en lugar de copiar contenido.
