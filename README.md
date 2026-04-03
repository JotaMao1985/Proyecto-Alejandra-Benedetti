# Analisis de Estanterias con Vision Language Models

Proyecto de inventario visual automatizado que utiliza modelos de vision-lenguaje (VLM) locales, ejecutados via Ollama, para analizar fotografias de estanterias de supermercado y extraer una lista estructurada de productos con cantidades y precios.

Incluye una **aplicacion web** (Flask) que permite subir imagenes, analizar en tiempo real y descargar un informe Excel.

Se itero a traves de 4 versiones del pipeline, logrando una mejora progresiva desde 0% de precision global (v1) hasta **61%** (v4), con una reduccion del **79%** en el sobre-conteo de productos.

Adicionalmente se implemento un **pipeline hibrido SAM 3 + VLM** que utiliza Meta SAM 3 (Segment Anything Model 3) para detectar productos mediante text prompts y el VLM para identificar nombre y precio de cada producto individualmente, eliminando el truncamiento de JSON (0% vs 63% en v4).

---

## Despliegue Rapido

### Prerrequisitos

| Requisito | Version minima |
|---|---|
| Docker | 20.0+ |
| Docker Compose | 2.0+ |
| Ollama | 0.1.0+ |
| Modelo VLM | `qwen2.5vl:7b` |
| Modelo SAM | SAM 3 (Meta) via HuggingFace |
| HuggingFace Token | Requerido para SAM 3 (modelo gated) |

### 1. Instalar Ollama y descargar el modelo

```bash
# Instalar Ollama (macOS)
brew install ollama

# O en Linux
curl -fsSL https://ollama.com/install.sh | sh

# Iniciar Ollama
ollama serve

# Descargar el modelo (en otra terminal)
ollama pull qwen2.5vl:7b
```

### 2. Clonar el repositorio

```bash
git clone https://github.com/JotaMao1985/Proyecto-Alejandra-Benedetti.git
cd Proyecto-Alejandra-Benedetti
```

### 3. Levantar la aplicacion

```bash
docker compose up -d --build
```

### 4. Abrir la aplicacion web

Abrir **http://localhost:5050** en el navegador.

### 5. Usar la app

1. **Arrastra** imagenes de estanterias al area de upload (o haz click para seleccionar)
2. **Click** en "Analizar Estanterias"
3. **Observa** el progreso en tiempo real
4. **Descarga** el informe Excel al finalizar

---

## Estructura del Proyecto

```
├── app/
│   ├── webapp.py                        <- App Flask (servidor web)
│   ├── core.py                          <- Funciones del pipeline v4 (reutilizables)
│   ├── analisis_estanteria.py           <- Pipeline v4 CLI (ejecucion por terminal)
│   ├── analisis_estanteria_hybrid.py    <- Pipeline hibrido SAM 3 + VLM (CLI)
│   ├── prueba_estanteria.py             <- Prueba de concepto inicial
│   └── templates/
│       └── index.html                   <- Frontend (drag & drop, progreso, resultados)
├── archive/
│   ├── images/                          <- Imagenes de estanterias (dataset, 651)
│   └── annotations.csv                  <- Ground truth (15,064 anotaciones)
├── data/
│   └── resultados/                      <- Excel y JSON generados
├── Dockerfile                           <- Dockerfile principal (webapp v4)
├── Dockerfile.sam                       <- Dockerfile para pipeline SAM 3
├── docker-compose.yml                   <- Compose principal (webapp)
├── docker-compose.sam.yml               <- Compose para SAM 3 (GPU/CPU)
├── docker-compose.sam.cpu.yml           <- Compose para SAM 3 (CPU only, macOS)
├── requirements.txt                     <- Dependencias del pipeline v4
├── requirements_sam.txt                 <- Dependencias del pipeline SAM 3
├── INTEGRACION_SAM.md                   <- Documentacion tecnica del pipeline SAM 3
└── informe_estanterias.html             <- Informe tecnico detallado (HTML interactivo)
```

---

## Arquitectura

```
Usuario (Browser)  -->  http://localhost:5050
      |
      v
+------------------------------------------+
|  Docker: entorno-llm-dev                 |
|  Flask App (:5000)                       |
|  |-- GET  /                  <- UI       |
|  |-- POST /analizar          <- Upload   |
|  |-- GET  /estado/<job_id>   <- Progreso |
|  |-- GET  /descargar/<job_id><- Excel    |
|  |                                       |
|  Core: analyze_shelf() -> export_excel() |
+------------------+-----------------------+
                   |
                   v
             Ollama (host:11434)
             qwen2.5vl:7b
```

---

## Stack Tecnologico

| Componente | Tecnologia |
|---|---|
| Contenedor | Docker (OrbStack / Docker Desktop) |
| Imagen base | `python:3.11-slim-bookworm` |
| Modelo VLM | `qwen2.5vl:7b` via Ollama |
| Backend | Flask 3.1 |
| Frontend | HTML + Tailwind CSS + JavaScript vanilla |
| Procesamiento | `threading` (background jobs) |
| Excel | openpyxl |
| Vision | Pillow, OpenCV |

---

## Aplicacion Web

### Funcionalidades

- **Drag & Drop**: Arrastra imagenes o haz click para seleccionar
- **Preview**: Grilla de thumbnails antes de analizar
- **Progreso en tiempo real**: Barra de progreso, imagen actual, ETA
- **Tabla de resultados en vivo**: Se actualiza conforme se procesan las imagenes
- **Detalle expandible**: Click en una fila para ver los productos detectados
- **Descarga Excel**: Informe con 3 hojas (Resumen, Detalle de Productos, Estadisticas)

### API Endpoints

| Metodo | Ruta | Descripcion |
|---|---|---|
| `GET` | `/` | Interfaz web principal |
| `POST` | `/analizar` | Sube imagenes e inicia analisis |
| `GET` | `/estado/<job_id>` | Estado y resultados parciales |
| `GET` | `/descargar/<job_id>` | Descarga Excel generado |
| `GET` | `/thumbnail/<job_id>/<file>` | Thumbnail de una imagen |

---

## Pipeline CLI

Ademas de la webapp, el pipeline se puede ejecutar por terminal:

```bash
# Ejecutar con 10% del dataset (default)
docker exec entorno-llm-dev python /app/analisis_estanteria.py

# Con otro porcentaje
docker exec entorno-llm-dev python /app/analisis_estanteria.py --sample 20
```

---

## Evolucion del Pipeline

| Metrica | v1 | v2 | v3 | **v4** |
|---|---|---|---|---|
| Precision global | 0.0% | 28.5% | 13.3% | **61.0%** |
| Precision prom/imagen | 23.6% | 39.6% | 31.1% | **46.8%** |
| Imagenes >= 70% prec. | 11 (17%) | 18 (28%) | 13 (20%) | **21 (32%)** |
| Imagenes >= 50% prec. | 17 (26%) | 28 (43%) | 22 (34%) | **32 (49%)** |
| Sobre-conteo vs GT | +2,894 | +1,120 | +1,358 | **+610** |
| Tiempo prom/imagen | 40.4s | 40.6s | 52.8s | 43.3s |

### Versiones

- **v1**: Baseline con prompt directo y 2 pasos. Sobre-conteo masivo.
- **v2**: Single-pass + few-shot example + cap a 8. Mejora significativa.
- **v3**: Split por zonas (descartado). La inconsistencia inter-llamadas empeoro resultados.
- **v4**: Prompt refinado con "error comun" explicito + postprocess dinamico + temperatura 0.1.
- **v5 (SAM 3 + VLM)**: Pipeline hibrido con Meta SAM 3 para deteccion + qwen2.5vl:7b para identificacion.

---

## Pipeline Hibrido SAM 3 + VLM (v5)

### Arquitectura

```
Imagen (RGB)
    |
    v
SAM 3 + text prompt: "product"
    |-- mask_1 (score: 0.92)
    |-- mask_2 (score: 0.88)
    |-- ...mask_N
    |
    v  (filtrar: score >= 0.1, area >= 500px)
crop_mask_region() -> PIL Image por mask
    |
    v  (ThreadPoolExecutor)
VLM (qwen2.5vl:7b) por cada crop:
    -> {"name": "Vodka Absolut", "price": 15.99}
    |
    v
deduplicate_products() -> lista final -> Excel
```

### Resultados Preliminares (5 imagenes, CPU)

| Imagen | GT | SAM 3 | Precision |
|---|---|---|---|
| 0114.jpg | 47 | 43 | **91.5%** |
| 0025.jpg | 17 | 47 | 36.2% |
| 0281.jpg | 27 | 55 | 49.1% |
| 0250.jpg | 15 | 54 | 27.8% |
| 0142.jpg | 13 | 39 | 33.3% |
| **TOTAL** | **119** | **238** | **50.0%** |

### Comparativa v4 vs SAM 3

| Metrica | v4 | SAM 3 |
|---|---|---|
| Precision global | 61.0% | 50.0% |
| Precision prom/imagen | 46.8% | 47.6% |
| Truncamiento JSON | 63% | **0%** |
| Sobre-conteo | +610 (39%) | +119 (100%) |
| Tiempo prom/imagen | 43.3s | 197s (CPU) |

### Ventajas del pipeline hibrido

- **0% truncamiento de JSON** (vs 63% en v4): cada producto genera un JSON individual
- **Conteo por segmentacion**: SAM cuenta por masks, no depende del VLM para contar
- **Text prompts**: SAM 3 detecta solo productos, no estantes ni fondo
- **Paralelizable**: llamadas VLM independientes por producto

### Ejecucion del pipeline SAM 3

```bash
# Prerrequisito: aceptar licencia en https://huggingface.co/facebook/sam3
export HF_TOKEN=hf_xxxxx

# Construir imagen Docker
docker compose -f docker-compose.sam.cpu.yml up -d --build

# Analizar una imagen
docker exec -e HF_TOKEN=$HF_TOKEN entorno-sam \
  python /app/app/analisis_estanteria_hybrid.py \
  --image /archive/images/0058.jpg --sam-device cpu

# Analizar muestra del dataset
docker exec -e HF_TOKEN=$HF_TOKEN entorno-sam \
  python /app/app/analisis_estanteria_hybrid.py \
  --sample 1 --max-workers 1 --text-prompt "product" --confidence 0.1
```

### Hallazgos tecnicos del pipeline SAM 3

1. **SAM 3 no soporta MPS (Apple Silicon)**: solo CUDA y CPU.
2. **SAM 3 tiene hardcodes de `device="cuda"`**: se requieren parches para CPU (incluidos en Dockerfile.sam).
3. **Threshold 0.1 necesario en CPU**: los scores son mas bajos que en GPU por la precision bfloat16.
4. **848M parametros en CPU**: ~60s solo para segmentacion por imagen. GPU NVIDIA recomendado.
5. **Modelo gated en HuggingFace**: requiere token y aprobacion de Meta.

---

## Hallazgos Tecnicos

1. **Bug de Thinking Mode en Qwen3-VL**: El modelo genera tokens `<think>` que Ollama filtra, dejando respuestas vacias. Se descarto en favor de `qwen2.5vl:7b`.

2. **Truncamiento de JSON**: El 63% de respuestas se truncan. Se mitigo con parser de cierre automatico y fallback regex.

3. **Sobre-conteo sistematico**: El modelo infla cantidades en estanterias densas. Se controla con cap por producto (8), few-shot example, y postprocesamiento dinamico.

4. **Inconsistencia inter-llamadas**: Al dividir imagen en zonas, el modelo nombra productos diferente en cada zona. Single-pass es superior con modelos de 7B.

---

## Resultados v4 (Version Final)

### Top 10

| Imagen | GT | Modelo | Precision |
|---|---|---|---|
| 0464.jpg | 11 | 11 | 100.0% |
| 0470.jpg | 20 | 20 | 100.0% |
| 0081.jpg | 21 | 20 | 95.2% |
| 0650.jpg | 15 | 14 | 93.3% |
| 0196.jpg | 37 | 34 | 91.9% |
| 0284.jpg | 41 | 37 | 90.2% |
| 0094.jpg | 20 | 18 | 90.0% |
| 0549.jpg | 30 | 27 | 90.0% |
| 0046.jpg | 28 | 31 | 89.3% |
| 0387.jpg | 37 | 33 | 89.2% |

### Distribucion de Precision

| Rango | Imagenes | Porcentaje |
|---|---|---|
| >= 90% | 8 | 12% |
| 70% - 89% | 13 | 20% |
| 50% - 69% | 11 | 17% |
| 30% - 49% | 12 | 18% |
| < 30% | 21 | 32% |

---

## Lecciones Aprendidas

1. **Los VLM de 7-8B tienen un techo para conteo preciso.** Identifican tipos y leen etiquetas, pero el conteo exacto en estanterias densas sigue siendo un desafio.
2. **El few-shot prompting es la mejora mas efectiva.** Mas impacto que cualquier tecnica de post-procesamiento.
3. **Indicar errores comunes explicitos ayuda.** "ERROR COMUN: listar 50+ productos es INCORRECTO" redujo el sobre-conteo.
4. **Multi-pass no funciona con modelos pequenos.** La inconsistencia genera mas duplicados de los que resuelve.
5. **Temperatura baja (0.1) mejora consistencia del JSON.**
6. **El post-procesamiento es un safety net, no una solucion.** Solo 4/65 imagenes lo necesitaron en v4.
7. **La API nativa de Ollama es mas confiable** que la capa OpenAI-compatible para modelos con thinking mode.

---

## Posibles Mejoras Futuras

- **Optimizar parametros SAM 3**: ajustar `--confidence` y `--max-masks` por tipo de estanteria con el ground truth completo
- **SAM 3.1 Object Multiplex**: 7x mas rapido para multi-objeto (released marzo 2026)
- **Fine-tuning de SAM 3**: entrenar con las 15,064 anotaciones del dataset
- **GPU NVIDIA**: SAM 3 en GPU reduciria el tiempo de ~200s a ~20-30s por imagen
- **Modelo VLM mas grande**: 13B+ parametros para mejor identificacion de productos
- **Ensemble de text prompts**: combinar resultados de multiples prompts ("product", "bottle", "item on shelf")

---

## Informe Tecnico Detallado

El archivo `informe_estanterias.html` contiene un informe interactivo completo con navegacion por secciones, tablas estilizadas y visualizaciones detalladas de todos los resultados.

---

## Dataset

El dataset en `archive/` contiene 651 imagenes de estanterias con 15,064 anotaciones de productos (bounding boxes + precios) en `annotations.csv`. Se uso el 10% (65 imagenes, seed=42) para evaluacion.
