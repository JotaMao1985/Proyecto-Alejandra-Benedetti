---
tags:
  - roadmap
  - estado/activo
  - prioridad/alta
fecha: 2026-05-28
tipo: auditoria
estado: activo
---

# Auditoría del proyecto contra objetivos — 2026-05-28

> Revisión integral del estado real del proyecto contra los objetivos declarados en [[../objetivos/objetivo-general]]. Cinco objetivos específicos + foco de impacto OC5 (D1).

## Resumen ejecutivo

| Objetivo | Estado declarado | Estado real | Δ |
|---|---|---|---|
| [[../objetivos/objetivo-especifico-1\|OE1 — Selección y visualización]] | completado | **funcional con 3 fugas** | 🟡 |
| [[../objetivos/objetivo-especifico-2\|OE2 — Procesamiento y extracción]] | completado | **operativo, mejorable** | 🟡 |
| [[../objetivos/objetivo-especifico-3\|OE3 — Estadística descriptiva]] | pendiente | **0% código** | 🔴 |
| [[../objetivos/objetivo-especifico-4\|OE4 — Sistematización]] | parcial | **70–80% reproducible** | 🟡 |
| [[../objetivos/objetivo-especifico-5\|OE5 — Evaluación de utilidad]] | pendiente | **0% ejecutado** | 🔴 |
| [[../objetivos/objetivo-complementario-5\|OC5 — Estudio D1]] | pendiente | **0% protocolo** | 🔴 |

**Veredicto global:** la **plataforma técnica funciona** (SAM 3 + VLM + Flask end-to-end). El **núcleo estadístico y la evaluación de impacto — que son la tesis en sí — están sin ejecutar**. Riesgo principal: defender una tesis de Estadística cuyo componente estadístico es 0%.

---

## Hallazgos por objetivo

### OE1 — Selección y visualización 🟡

**Funcional:**
- 4 endpoints Flask vivos: `/`, `/analizar`, `/estado/<id>`, `/descargar/<id>`, `/thumbnail/<id>/<file>` ([app/webapp.py:55](app/webapp.py)).
- Drag & drop + preview en grilla con FileReader ([app/templates/index.html:142-171](app/templates/index.html)).
- Threading asincrónico por job, ETA y progreso parcial.

**Fugas:**
1. **🔴 Path traversal** en `/thumbnail/<job_id>/<filename>` — `UPLOAD_DIR / job_id / filename` sin `.resolve()` ni `startswith()` check. `filename=../../../etc/passwd` se sirve ([app/webapp.py:148](app/webapp.py)).
2. **🟡 Endpoint `/thumbnail` huérfano** — implementado pero `index.html` no lo invoca (usa data-URIs locales). O se integra o se elimina.
3. **🟡 Sin validación de MIME ni de tamaño** de uploads — riesgo de DoS o de archivos disfrazados ([app/webapp.py:76](app/webapp.py)).
4. **🟡 Race condition** sobre el dict global `jobs` (sin lock); aceptable en uso single-user pero indocumentado.

**No es una fuga (verificado):** `.env` SÍ está en `.gitignore:11`; HF_TOKEN NO leakeó al historial de git (`git log -S` vacío). El token sigue siendo válido en local y puede rotarse preventivamente.

### OE2 — Procesamiento y extracción 🟡

**Funcional:**
- SAM 3 cargado e invocado realmente ([app/core.py:73-97](app/core.py), [app/analisis_estanteria_hybrid.py:172-173](app/analisis_estanteria_hybrid.py)).
- qwen2.5vl:7b vía Ollama HTTP con cliente OpenAI-compatible, prompt JSON estricto, parser que limpia ```json fences.
- Variables extraídas coinciden con OE2: `name`, `price`, `quantity`, `confidence`, `bbox`, `mask_id` ([app/core.py:40-46](app/core.py)).
- 0% truncamiento JSON confirmado (1 crop → 1 JSON ≤150 tokens; el bug v4 era pedir el listado completo en una sola llamada).
- MPS funciona en Apple Silicon con parches en Dockerfile.sam y `PYTORCH_ENABLE_MPS_FALLBACK=1`.

**Mejoras necesarias:**
1. **🟡 Sin timeout HTTP** en cliente Ollama → un hang en el servidor cuelga todo el ThreadPoolExecutor ([app/core.py:315](app/core.py)). Añadir `timeout=30`.
2. **🟡 Sobre-conteo +100%** sin NMS (precisión global cae a 50% v5 vs 61% v4). Documentado en [[../experimentos/pipeline-v5-sam3]] pero sin implementación.
3. **🟡 Sin suite de tests** (`pytest`/`unittest` = 0 archivos).
4. **🟡 Manejo de errores genérico** (`except Exception`) en pool VLM — funciona, pero impide telemetría útil por tipo de fallo.

### OE3 — Estadística descriptiva 🔴

**Estado real: 0%.** No hay ningún script, notebook ni CSV de salida con análisis estadístico.

- ❌ Sin `describe()`, histogramas, boxplots, correlaciones del dataset (651 imágenes).
- ❌ Sin PCA / KMeans / clustering jerárquico.
- ❌ Sin bootstrap CI (a pesar de [[../decisiones/adr-002-bootstrap]] aceptada).
- ❌ Sin reportes en `reports/` ni `figures/` (no existen).
- ✅ Existe `core.py:export_to_excel` que genera el insumo crudo — está listo para alimentar el análisis.

**Este es el gap más grave** dado que es una tesis de Estadística.

### OE4 — Sistematización 🟡

**Funcional:**
- 3 variantes de compose coherentes (GPU, CPU, macOS-MPS).
- README documenta flujo end-to-end (instalar → ejecutar → Excel).
- Scripts `run_native_*.sh` funcionan en macOS.
- `.dockerignore` excluye binarios pesados (archive/, models/).

**Gaps de reproducibilidad:**
1. **🟡 Inconsistencia Python 3.11 vs 3.12** entre `Dockerfile` (webapp) y `Dockerfile.sam` (pipeline). Consolidar en 3.12.
2. **🟡 PyTorch instalado en Dockerfile.sam pero ausente de `requirements_sam.txt`** — un tercero que use solo el txt no obtiene el entorno funcional.
3. **🟡 `numpy` sin upper bound** en `requirements.txt` — riesgo de NumPy 2.x rompiendo todo.
4. **🟡 Sin instrucciones para Linux nativo** (solo Docker o macOS-MPS).
5. **🟡 Ollama asumido externamente** (no está en ningún compose) — podría añadirse como servicio opcional.

### OE5 / OC5 — Evaluación y D1 🔴

**Estado real: 0% ejecutado.** Solo existe la **intención documentada**:
- ✅ Decisión arquitectónica aceptada: [[../decisiones/adr-005-pivote-impacto]] (2026-05-20).
- ✅ Hipótesis formalizada: [[../hipotesis/hipotesis-complementaria-7]].
- ✅ Marco teórico mencionando kappa/ICC/Bland-Altman + bootstrap.
- ✅ Rol asignado en [[../personas/javier-sierra]].

**Faltantes para poder ejecutar el estudio:**
- ❌ Sin contactos de evaluadores (2-3 personas con disponibilidad).
- ❌ Sin protocolo: tamaño y selección de muestra, escala, orden, test-retest.
- ❌ Sin instrumento de evaluación (cuestionario / rúbrica).
- ❌ Sin script de análisis (funciones kappa / ICC / Bland-Altman + bootstrap).
- ❌ Sin datos recolectados.

---

## Decisiones arquitectónicas observadas

1. **Threading + dict global `jobs`** en webapp — aceptable para validación, no para producción multi-usuario.
2. **Llamada VLM por-crop en vez de por-imagen** — buena decisión: corrige el truncamiento histórico.
3. **MPS con `PYTORCH_ENABLE_MPS_FALLBACK=1`** — pragmático: prefiere lento-pero-funcional sobre roto.
4. **Excel como formato de entrega** — coherente con uso académico; mantener.

---

## Tareas — Ordenadas por dependencia y prioridad

### Fase A — Seguridad y endurecimiento mínimo (PRIORIDAD CRÍTICA, antes de cualquier demo o evaluación humana)

#### Tarea A1: Cerrar el path traversal en `/thumbnail` (XS)
**Descripción:** Validar que la ruta resuelta de `UPLOAD_DIR / job_id / filename` permanece dentro de `UPLOAD_DIR.resolve()` antes de servir.
**Criterios de aceptación:**
- [ ] Petición con `filename=../../etc/hosts` retorna 404 (o 400), no el archivo.
- [ ] Job y filename se validan con regex (UUID y `[A-Za-z0-9._-]+\.(jpg|jpeg|png)$`).
**Verificación:**
- [ ] `curl -i http://localhost:5050/thumbnail/abc/../../etc/passwd` → 404.
- [ ] Test manual con thumbnail legítimo sigue funcionando.
**Archivos:** [app/webapp.py:145-161](app/webapp.py)
**Dependencias:** ninguna. **Tamaño:** XS (1 archivo, ~10 líneas).

#### Tarea A2: Decidir destino del endpoint `/thumbnail` (XS)
**Descripción:** O integrarlo en `index.html` para previews persistentes post-upload, o eliminarlo.
**Criterios de aceptación:**
- [ ] Si se integra: `index.html` llama `/thumbnail/<id>/<f>` y muestra los resultados.
- [ ] Si se elimina: ruta removida y la lección documentada en [[../lecciones]].
**Dependencias:** A1. **Tamaño:** XS.

#### Tarea A3: Validar MIME y limitar tamaño de upload (XS)
**Descripción:** Usar `Pillow.Image.verify()` o `python-magic` para validar contenido; añadir `app.config['MAX_CONTENT_LENGTH']`.
**Criterios de aceptación:**
- [ ] Archivo `.png` con contenido `.exe` rechazado en `/analizar`.
- [ ] Archivo > 20 MB rechazado con 413.
**Archivos:** [app/webapp.py](app/webapp.py)
**Dependencias:** ninguna. **Tamaño:** XS.

#### Tarea A4: Rotar HF_TOKEN preventivamente (XS, manual)
**Descripción:** Aunque NO leakeó al repo (verificado con `git log -S`), rotarlo es buena higiene.
**Criterios de aceptación:**
- [ ] Token regenerado en HuggingFace.
- [ ] `.env` local actualizado.
- [ ] Funciona descarga de SAM 3 con token nuevo.
**Dependencias:** ninguna. **Tamaño:** XS (acción manual de Alejandra/asesor).

### Checkpoint A: Después de A1–A4
- [ ] Webapp pasa una prueba manual de path traversal.
- [ ] Token activo y rotado.
- [ ] README documenta `MAX_CONTENT_LENGTH`.

### Fase B — Consolidación de reproducibilidad (PRIORIDAD ALTA)

#### Tarea B1: Pinear dependencias críticas (XS)
**Descripción:** Añadir `numpy<2`, `pillow>=10,<12`, etc., en `requirements.txt`. Añadir `torch==X.Y.Z` en `requirements_sam.txt`.
**Criterios:**
- [ ] `pip install -r requirements.txt` instala versiones estables y conocidas.
- [ ] `requirements_sam.txt` declara explícitamente torch/torchvision.
**Tamaño:** XS.

#### Tarea B2: Unificar Python 3.12 en ambos Dockerfile (XS)
**Criterios:**
- [ ] `Dockerfile` y `Dockerfile.sam` con la misma base.
- [ ] Webapp construye sin error sobre 3.12.
**Tamaño:** XS.

#### Tarea B3: Añadir timeout a cliente OpenAI/Ollama (XS)
**Descripción:** `OpenAI(..., timeout=30)` o pasar `timeout` en `client.chat.completions.create`.
**Criterios:**
- [ ] Cuando Ollama no responde, la llamada falla en ≤30 s.
- [ ] El ThreadPoolExecutor no queda colgado.
**Archivos:** [app/core.py:315](app/core.py), [app/analisis_estanteria_hybrid.py:726](app/analisis_estanteria_hybrid.py)
**Tamaño:** XS.

### Checkpoint B: Después de B1–B3
- [ ] Construcción Docker limpia desde cero.
- [ ] Pipeline tolera caída de Ollama sin colgarse.

### Fase C — Componente estadístico (PRIORIDAD ALTA — núcleo de la tesis)

#### Tarea C1: Notebook de estadística descriptiva del dataset (S)
**Descripción:** `notebooks/01_descriptivos.ipynb`. Carga los Excel generados por el pipeline (651 imágenes), reporta:
- Conteo de productos por imagen (media, mediana, sd, percentiles, histograma).
- Distribución de precios extraídos (excluir nulos).
- Distribución de confianza VLM.
- Tiempo de procesamiento por imagen.
**Criterios:**
- [ ] Notebook ejecuta de punta a punta con `papermill` o `jupyter nbconvert --execute`.
- [ ] Exporta `reports/descriptivos.html` y `reports/figures/*.png`.
**Dependencias:** que el pipeline haya corrido sobre las 651 imágenes (verificar `data/resultados/`).
**Tamaño:** S (1 notebook, 2-3 funciones helper).

#### Tarea C2: Bootstrap CI para precisión y métricas (S)
**Descripción:** Función `bootstrap_ci(metric, data, n=10000)` aplicada a precisión global por imagen (frente a ground truth). Reportar IC95% por método (v4 VLM, v5 SAM 3+VLM).
**Criterios:**
- [ ] IC95% de la precisión global del pipeline reportado en `reports/precision_ci.md`.
- [ ] Comparación v4 vs v5 con IC.
**Dependencias:** C1.
**Tamaño:** S.

#### Tarea C3: PCA + clustering exploratorio (M)
**Descripción:** Variables por imagen: número de productos, precio medio, sd precios, área media, densidad de masks, tiempo. PCA + KMeans (k seleccionado por silhouette o elbow), estabilidad con bootstrap.
**Criterios:**
- [ ] Notebook `notebooks/02_pca_clustering.ipynb` con scree plot, biplot, asignación de clusters, silhouette.
- [ ] Reporte breve interpretando 2-3 clusters.
**Dependencias:** C1.
**Tamaño:** M.

### Checkpoint C: Después de C1–C3
- [ ] El componente estadístico existe físicamente — ya no es 0%.
- [ ] Hay artefactos defendibles ante el asesor.

### Fase D — Estudio D1 de concordancia (PRIORIDAD ALTA — foco de impacto)

#### Tarea D1: Diseñar el protocolo del estudio (M, sin código)
**Descripción:** Crear `decisiones/adr-006-protocolo-D1.md` con:
- Selección de la muestra (subconjunto de imágenes — sugerencia: 30-50 con muestreo estratificado por densidad de productos).
- 2-3 evaluadores: nombres y disponibilidad confirmados.
- Variables a comparar (n° de productos, precio total estimado).
- Diseño test-retest (2 sesiones separadas ≥7 días).
- Orden aleatorizado.
**Criterios:**
- [ ] ADR firmado y enlazado desde [[../objetivos/objetivo-complementario-5]].
**Dependencias:** ninguna. **Tamaño:** M.

#### Tarea D2: Construir el instrumento de evaluación (S)
**Descripción:** Formulario digital (Google Forms / LimeSurvey / formulario propio en la webapp) que muestra una imagen y pide: número de productos, precio total estimado, tiempo gastado.
**Criterios:**
- [ ] Instrumento testeado con 1 evaluador piloto.
- [ ] Exporta CSV listo para análisis.
**Dependencias:** D1. **Tamaño:** S.

#### Tarea D3: Implementar análisis kappa / ICC / Bland-Altman (M)
**Descripción:** Módulo `analisis/concordancia.py` con funciones puras + tests:
- `cohen_kappa`, `fleiss_kappa` para variables categóricas.
- `icc(2,1)` para conteos continuos.
- `bland_altman_plot` y límites de acuerdo con IC bootstrap.
**Criterios:**
- [ ] 1 test por función con fixture sintética.
- [ ] Notebook `notebooks/03_concordancia.ipynb` aplica las funciones a un CSV de ejemplo y produce reporte.
**Dependencias:** ninguna (puede paralelizarse con D1-D2). **Tamaño:** M.

#### Tarea D4: Ejecutar sesiones 1 y 2 y consolidar resultados (M, manual)
**Criterios:**
- [ ] Datos crudos en `data/d1/sesion1.csv`, `data/d1/sesion2.csv`.
- [ ] Reporte ejecutivo `reports/d1_resultados.md` con todas las métricas e IC.
- [ ] Conclusión vincula con [[../hipotesis/hipotesis-complementaria-7]].
**Dependencias:** D1, D2, D3. **Tamaño:** M.

### Checkpoint D: Después de D1–D4
- [ ] Hipótesis 7 contrastada con datos reales.
- [ ] OC5 marcado completado en su nota.

### Fase E — Mejoras opcionales (PRIORIDAD MEDIA)

#### Tarea E1: NMS pre-VLM para reducir el sobre-conteo (S)
**Descripción:** Aplicar IoU>0.5 sobre las máscaras SAM antes de mandarlas al VLM. Atacaría el +100% de sobre-conteo documentado en [[../experimentos/pipeline-v5-sam3]].
**Criterios:**
- [ ] Precisión global v5 sube de 50% hacia 60-70% sobre las 5 imágenes de validación.
**Tamaño:** S.

#### Tarea E2: Suite de tests mínima (S)
**Descripción:** `pytest` con 5-10 casos: carga modelo, parseo JSON, parsing precios, bootstrap, endpoints Flask con `test_client`.
**Criterios:**
- [ ] `pytest` corre en CI local sin fallos.
**Tamaño:** S.

---

## Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Defender una tesis de Estadística con 0% código estadístico | Alto | Fase C es bloqueante para sustentar; ejecutar en paralelo con D |
| No conseguir 2-3 evaluadores para D1 | Alto | D1 (protocolo) debe comenzar **YA** para no quedar sin tiempo |
| Sobre-conteo 100% sigue invalidando v5 vs v4 | Medio | E1 (NMS) es 1-2 días; vale la pena antes de D4 |
| HF_TOKEN comprometido (aunque no leak en git) | Bajo | Rotar (A4) — barato |
| Path traversal explotado durante demo o evaluación | Medio | A1 cierra el riesgo en minutos |

## Preguntas abiertas para Alejandra / asesor

- ¿Se respeta el alcance del pivote a D1 (adr-005), o queremos también el muestreo probabilístico A1 y el DOE B3?
- ¿La muestra para D1 es del dataset interno (651) o de imágenes nuevas tomadas en la empresa?
- ¿Cuál es la fecha objetivo para entrega de tesis? El roadmap actual no la tiene fijada.
- ¿La precisión actual (50% v5, 61% v4) se acepta como "límite del estado del arte" o exigimos llegar a 70%+?

## 🔗 Relacionado

- [[../objetivos/objetivo-general]]
- [[../decisiones/adr-005-pivote-impacto]]
- [[../experimentos/pipeline-v5-sam3]]
- [[roadmap-2026]]
