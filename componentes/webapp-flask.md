---
tags:
  - componente
  - estado/activo
  - tema/flask
  - tema/docker
  - tema/frontend
estado: activo
progreso: 95%
tecnologia:
  - Flask 3.1
  - Docker
  - HTML + Tailwind CSS + vanilla JS
  - Threading
archivos_clave:
  - app/webapp.py
  - app/core.py
  - app/templates/index.html
  - Dockerfile
  - Dockerfile.sam
  - docker-compose.yml
  - docker-compose.sam.cpu.yml
---

# Webapp Flask — Analisis de Estanterias

## Descripcion

Aplicacion web Flask que permite subir imagenes de estanterias, analizarlas con el pipeline SAM 3 + VLM en tiempo real, y descargar un informe Excel.

## Proposito

Proveer una interfaz amigable (drag & drop) para que usuarios no tecnicos puedan usar el pipeline de analisis de estanterias sin linea de comandos.

## Arquitectura

- **Servidor**: Flask 3.1 dentro de Docker.
- **Jobs en background**: `threading.Thread` para no bloquear requests.
- **Progreso en tiempo real**: polling via `GET /estado/<job_id>`.
- **Modelo VLM**: Ollama corriendo en el host (`host.docker.internal:11434`).

## API Endpoints

| Metodo | Ruta | Descripcion |
|---|---|---|
| `GET` | `/` | UI principal |
| `POST` | `/analizar` | Sube imagenes e inicia analisis |
| `GET` | `/estado/<job_id>` | Estado y resultados parciales |
| `GET` | `/descargar/<job_id>` | Descarga Excel generado |
| `GET` | `/thumbnail/<job_id>/<file>` | Thumbnail de imagen |

## Estado actual

| Aspecto | Estado |
|---|---|
| Upload + analisis | Funcional |
| Progreso en vivo | Funcional |
| Exportacion Excel | Funcional |
| SAM 3 integrado | Funcional (CPU/MPS) |
| Manejo de errores | Basico |

## Funcionalidades

- [x] Drag & drop de imagenes.
- [x] Preview en grilla antes de analizar.
- [x] Progreso en tiempo real (barra + imagen actual + ETA).
- [x] Tabla de resultados en vivo.
- [x] Detalle expandible por imagen.
- [x] Descarga Excel con 3 hojas.
- [ ] Autenticacion de usuarios.
- [ ] Historial de analisis persistentes.

## Problemas conocidos

- [[../lecciones/api-key-hardcoded|api_key="ollama" hardcoded en linea 46]].
- Sin autenticacion — no apto para despliegue publico.
- Jobs en memoria volatil (se pierden al reiniciar contenedor).

## 🔗 Relacionado

- [[../proyectos/tesis-analisis-estanterias|Tesis]]
- [[shelf-analyzer-sam3]]
- [[../experimentos/pipeline-v5-sam3]]
- [[../lecciones/api-key-hardcoded]]
