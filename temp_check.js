        // --- DATA STORE ---
        const courseData = {
            modules: [
                {
                    id: "m1",
                    title: "Módulo 1: El Protocolo HTTP Expandido",
                    shortTitle: "HTTP & APIs",
                    objective: "Dominar los verbos, códigos de estado y headers para interactuar robustamente con APIs.",
                    duration: "40 min",
                    content: {
                        concept: {
                            title: "La Anatomía de una Petición HTTP & Autenticación",
                            text: "HTTP es el lenguaje universal de la web. Para un Data Scientist, entenderlo es vital para extraer datos (<span class='tooltip'>Scraping<span class='tooltip-text'>Extracción automatizada de datos desde el HTML de webs.</span></span>/<span class='tooltip'>APIs<span class='tooltip-text'>Interfaz para que programas intercambien datos de forma estructurada.</span></span>) o desplegar modelos (<span class='tooltip'>Flask<span class='tooltip-text'>Framework web ligero (micro) de Python. Ideal para prototipos.</span></span>/<span class='tooltip'>FastAPI<span class='tooltip-text'>Framework moderno de alto rendimiento enfocado en APIs y tipado.</span></span>).<br><br><strong>1. Verbos (La Acción):</strong><br>• <strong>GET:</strong> Solicitar datos. <em>Ej: Descargar dataset.</em><br>• <strong>POST:</strong> Enviar datos. <em>Ej: Inferencia de modelo.</em><br><br><strong>2. Headers & Autenticación (El Pase VIP):</strong><br>La mayoría de APIs comerciales requieren identificarse. Los métodos más comunes son:<br>• <strong>Basic Auth:</strong> Usuario y contraseña en cada petición (Inseguro, 'vieja escuela').<br>• <strong>API Key:</strong> Un código único (token) que te identifica. Se envía en Headers (<code>X-API-Key: abc12345</code>).<br>• <strong>Bearer Token (OAuth2):</strong> El estándar moderno. Obtienes un token temporal (como una manilla de hotel) que expira.<br><br><strong>3. Status Codes (El Resultado):</strong><br><br><span class='font-bold text-indigo-700'>🟢 2xx (Éxito - Todo bien)</span><br>• <strong>200 OK:</strong> Petición exitosa estándar.<br>• <strong>201 Created:</strong> Recurso creado (ej: Usuario registrado).<br>• <strong>202 Accepted:</strong> Petición aceptada para proceso en <em>background</em> (ej: Entrenar un modelo pesado).<br><br><span class='font-bold text-orange-600'>🟠 4xx (Error Cliente - Culpa tuya)</span><br>• <strong>400 Bad Request:</strong> Enviaste datos mal formados (JSON roto).<br>• <strong>401 Unauthorized:</strong> No tienes credenciales (Token).<br>• <strong>403 Forbidden:</strong> Tienes token, pero no permisos para esto.<br>• <strong>404 Not Found:</strong> El endpoint o recurso no existe.<br>• <strong>422 Unprocessable Entity:</strong> Datos semánticamente erróneos (ej: Enviar texto donde va un número).<br>• <strong>429 Too Many Requests:</strong> Calma, estás saturando la API (Rate Limit).<br><br><span class='font-bold text-red-600'>🔴 5xx (Error Servidor - Culpa de ellos)</span><br>• <strong>500 Internal Server Error:</strong> El código del servidor falló.<br>• <strong>503 Service Unavailable:</strong> Servidor caído o en mantenimiento.",
                            analogy: "📨 <strong>Analogía Postal:</strong><br>• <strong>URL:</strong> La dirección de la casa.<br>• <strong>Verbo:</strong> Lo que quieres hacer (Entregar paquete, Recoger carta).<br>• <strong>Headers:</strong> Las estampillas y etiquetas ('Fragil', 'Prioritario').<br>• <strong>Auth (Token):</strong> Tu carnet de empleado postal que te deja entrar al edificio.<br>• <strong>Body:</strong> El contenido de la caja (solo en POST/PUT).<br>• <strong>Status Code:</strong> El acuse de recibo ('Entregado', 'Dirección no existe').",
                            warning: "⚠️ <strong>Seguridad:</strong> Nunca envíes contraseñas o tokens (API Keys) en la URL (Query Params), ya que quedan guardados en el historial del navegador/proxy. Úsalo siempre en los <strong>Headers</strong> o en el <strong>Body</strong> (POST)."
                        },
                        comparison: [
                            {
                                title: "GET (Leer) 🔍",
                                pros: ["Simple y rápido", "Cacheable por el navegador", "Se puede guardar en favoritos"],
                                cons: ["No seguro para datos sensibles", "Límite de longitud en URL", "Solo envía texto"],
                                bestFor: "Consultas de datos, Búsquedas, Filtros"
                            },
                            {
                                title: "POST (Escribir) 📝",
                                pros: ["Seguro (datos en el cuerpo)", "Sin límite de tamaño", "Soporta binarios (archivos, imágenes)"],
                                cons: ["No cacheable por defecto", "Más complejo de construir manualmente"],
                                bestFor: "Login, Subir archivos, Enviar formularios, Inferencia de modelos"
                            }
                        ],
                        code: {
                            title: "Cliente API Robusto (OOP + Session)",
                            language: "python",
                            snippet: `import requests
from typing import Optional, Dict, Any

class APIClient:
    """
    Cliente profesional para interactuar con APIs.
    Encapsula la configuración (URL, Claves) para no repetirla.
    """
    
    def __init__(self, base_url: str, api_key: str):
        """
        El CONSTRUCTOR: Se ejecuta automáticamente al crear la clase.
        Aquí configuramos lo que el robot necesita 'recordar': la URL y la Llave.
        """
        self.base_url = base_url
        
        # Session: Un 'Túnel Permanente' (Conexión TCP) con el servidor.
        # Mejora el rendimiento al no tener que reconectar en cada petición.
        self.session = requests.Session()
        
        # Headers Globales: Se enviarán en TODAS las peticiones de esta sesión.
        # Así no tenemos que escribir 'Authorization' en cada función.
        self.session.headers.update({
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "User-Agent": "MiAppDataScience/1.0"
        })

    def get_data(self, endpoint: str, params: Optional[Dict] = None) -> Dict:
        """
        Método para LEER datos (Verbo HTTP: GET).
        :param endpoint: La parte final de la URL (ej: 'usuarios/1')
        :param params: Filtros opcionales (ej: {'page': 2})
        """
        try:
            url = f"{self.base_url}/{endpoint}"
            # Usamos self.session.get en lugar de requests.get
            response = self.session.get(url, params=params, timeout=10)
            
            # ¡IMPORTANTE! Valida si el código es 200 OK.
            # Si es 4xx o 5xx, lanza una excepción (salta al 'except').
            response.raise_for_status() 
            
            return response.json() # Convierte el texto JSON a Diccionario Python
            
        except requests.exceptions.HTTPError as err:
            # Manejo de errores específicos según el código de estado
            if response.status_code == 401:
                print("⛔ Error: Credenciales inválidas (Token vencido o incorrecto).")
            elif response.status_code == 429:
                print("⏳ Error: Rate Limit. Estás haciendo muchas peticiones muy rápido.")
            else:
                print(f"❌ Error HTTP Genérico: {err}")
            return {}
            
        except Exception as e:
            print(f"🔥 Error crítico (Red, Timeout, etc): {e}")
            return {}

    def predict(self, features: Dict[str, Any]) -> float:
        """
        Método para ENVIAR datos y recibir predicción (Verbo HTTP: POST).
        :param features: Diccionario con los datos del modelo (ej: {'edad': 30})
        """
        try:
            url = f"{self.base_url}/predict"
            # 'json=features' convierte automáticamente el dict a JSON válido
            response = self.session.post(url, json=features, timeout=5)
            response.raise_for_status()
            
            # Asumimos que la API devuelve algo como: {"prediction": 4500.50}
            return response.json().get('prediction', 0.0)
            
        except Exception as e:
            print(f"❌ Error en predicción: {e}")
            return 0.0

# --- EJEMPLO DE USO ---

# 1. Instanciar la clase (Crear el objeto 'cliente')
# Aquí se ejecuta el __init__
cliente = APIClient(base_url="https://api.empresa.com/v1", api_key="sk_live_123")

# 2. Consultar estado (Usa el método GET)
print("📡 Consultando estado del sistema...")
status = cliente.get_data("system/status")
print(f"✅ Estado: {status.get('status', 'Desconocido')}")

# 3. Realizar predicción (Usa el método POST)
print("\\n🤖 Solicitando predicción...")
input_data = {"kms": 50000, "año": 2020, "marca": "Toyota"}
precio = cliente.predict(input_data)
print(f"💰 Precio estimado: \${precio:,.2f}")`,
                            output: "✅ Estado del sistema: ONLINE\n💰 Precio estimado: $45,200.00"
                        },
                        codeExplanation: {
                            title: "🔍 Desglosando el Código",
                            steps: [
                                {
                                    title: "1. Inicialización (__init__)",
                                    text: "Creamos una <strong>Session</strong>. Esto es como abrir un túnel permanente con el servidor. En lugar de abrir y cerrar conexión por cada petición (lento), la mantenemos abierta y reutilizamos los headers (Auth, Content-Type) para no repetirlos."
                                },
                                {
                                    title: "2. Método get_data()",
                                    text: "Encapsula la lógica de lectura. Usa <code>response.raise_for_status()</code> para que si la API falla (ej: 404, 500), el código se detenga y nos avise, en lugar de intentar procesar datos corruptos. También maneja errores específicos como <strong>401 (Auth)</strong> o <strong>429 (Rate Limit)</strong>."
                                },
                                {
                                    title: "3. Método predict()",
                                    text: "Envía datos con <strong>POST</strong>. La librería <code>requests</code> convierte automáticamente el diccionario de Python a JSON gracias al parámetro <code>json=features</code>."
                                }
                            ]
                        },
                        quizzes: [
                            {
                                question: "1. Estás diseñando una API para que usuarios suban sus Hoja de Vida (PDF). ¿Qué método HTTP usas?",
                                options: [
                                    "GET, porque es más rápido.",
                                    "POST, porque envías un archivo (body) al servidor.",
                                    "DELETE, para borrar el desempleo.",
                                    "PUT, para actualizar la base de datos."
                                ],
                                correct: 1,
                                feedback: "✅ Correcto. POST es el estándar para enviar datos complejos o archivos. GET no soporta cuerpo de mensaje."
                            },
                            {
                                question: "2. Si al consultar la API recibes un error 401 Unauthorized, ¿qué significa?",
                                options: [
                                    "La API está caída (Server Error).",
                                    "Hiciste demasiadas peticiones (Rate Limit).",
                                    "Te faltan las credenciales (API Key/Token) o son inválidas.",
                                    "Borraste un dato sin querer."
                                ],
                                correct: 2,
                                feedback: "✅ Correcto. 401 significa 'No te conozco'. Debes revisar tus Headers de autenticación."
                            },
                            {
                                question: "3. ¿Por qué usamos `requests.Session()` en lugar de `requests.get()` directo?",
                                options: [
                                    "Para hacer el código más corto.",
                                    "Para reutilizar la conexión TCP (Handshake) y mejorar el rendimiento.",
                                    "Porque `requests.get` está obsoleto.",
                                    "Para encriptar los datos."
                                ],
                                correct: 1,
                                feedback: "✅ ¡Exacto! Abrir una conexión nueva cuesta tiempo (Handshake SSL, TCP). 'Session' mantiene el túnel abierto."
                            }
                        ],
                        glossary: {
                            title: "🐍 Glosario Python: Clases y Métodos",
                            items: [
                                {
                                    term: "def",
                                    definition: "Palabra clave para definir una función (o método si está dentro de una clase)."
                                },
                                {
                                    term: "__init__",
                                    definition: "El <strong>Constructor</strong>. Es un método especial que se ejecuta <em>automáticamente</em> al crear una nueva instancia de la clase. Se usa para inicializar variables (como <code>self.api_key</code>) y configurar el objeto antes de usarlo."
                                },
                                {
                                    term: "class",
                                    definition: "La <strong>Plantilla</strong> (Blueprint). Define la estructura y el comportamiento de los objetos. Es como el plano de una casa; los objetos son las casas construidas a partir de ese plano."
                                },
                                {
                                    term: "Conexión TCP",
                                    definition: "El <strong>Túnel</strong> de comunicación. Es el canal estable por donde viajan los datos. Abrir este túnel es costoso (lento), por eso usamos <code>Session</code> para mantenerlo abierto y reutilizarlo."
                                }
                            ],
                            conceptualExample: {
                                title: "¿Por qué usar Clases? (Vs Código Espagueti)",
                                description: "Las clases nos permiten <strong>encapsular</strong> datos y lógica, evitando el desorden de variables globales.",
                                codeOld: `# ❌ SIN CLASES (Difícil de mantener)
url1 = "api.com"
key1 = "123"

def get_data(u, k):
    pass # lógica...

get_data(url1, key1) # Hay que pasar todo siempre`,
                                codeNew: `# ✅ CON CLASES (Limpio y Reusable)
cliente = APIClient("api.com", "123")
cliente.get_data() # ¡Ya sabe su URL y Key!`
                            }
                        }
                    }
                },
                {
                    id: "m2",
                    title: "Módulo 2: JSON vs Pickle",
                    shortTitle: "Formatos",
                    objective: "Elegir el formato de serialización adecuado según el caso de uso (interoperabilidad vs especificidad).",
                    duration: "30 min",
                    content: {
                        concept: {
                            title: "Serialización: Congelando Objetos",
                            text: "Para guardar un objeto de Python (un diccionario, un modelo entrenado) en un archivo o enviarlo por red, debemos <span class='tooltip'>Serializarlo<span class='tooltip-text'>Convertir un objeto en memoria a una secuencia de bytes o texto para guardarlo o transmitirlo.</span></span>. El proceso inverso es la <span class='tooltip'>Deserialización<span class='tooltip-text'>Reconstruir el objeto original en memoria a partir de los bytes o texto guardados.</span></span>.<br><br><strong>1. JSON (El Estándar Web):</strong><br>Es texto plano, legible por humanos y compatible con casi todos los lenguajes (Python, JS, Java).<br>❌ <em>Limitación:</em> Solo entiende tipos simples (texto, números, listas, booleanos). <strong>NO</strong> soporta fechas (`datetime`), tuplas o clases personalizadas directamente.<br><br><strong>2. Pickle (La Magia de Python):</strong><br>Es un formato binario (no legible por humanos) específico de Python.<br>✅ <em>Ventaja:</em> Puede guardar casi <strong>CUALQUIER</strong> objeto de Python: funciones, clases, modelos de Machine Learning (Scikit-Learn), DataFrames de Pandas, etc.<br>❌ <em>Peligro:</em> <strong>Nunca</strong> cargues un archivo `.pkl` de internet. Al deserializarlo, puede ejecutar código malicioso en tu PC.",
                            analogy: "📦 <strong>Analogía del Envío:</strong><br>• <strong>JSON:</strong> Es una carta escrita en inglés. Cualquiera puede leerla, pero no puedes enviar cosas físicas, solo descripciones.<br>• <strong>Pickle:</strong> Es un teletransportador de ciencia ficción. Desintegra el objeto (átomo por átomo) y lo reconstruye idéntico al otro lado. Pero si te envían una bomba teletransportada, explotará al reconstruirse.",
                            warning: "⚠️ <strong>Seguridad Crítica:</strong> `pickle.load()` es inseguro por diseño. Solo úsalo con archivos que TÚ mismo creaste o en los que confías plenamente."
                        },
                        comparison: [
                            {
                                title: "JSON 📄",
                                pros: ["Legible por humanos (Texto)", "Universal (Interoperable)", "Seguro (Solo datos)"],
                                cons: ["Pierde tipos complejos (Tuplas -> Listas, Fechas -> Strings)", "Más lento con grandes volúmenes numéricos"],
                                bestFor: "APIs REST, Configuración, Compartir datos entre lenguajes"
                            },
                            {
                                title: "Pickle 🥒",
                                pros: ["Guarda TODO (Funciones, Clases, Modelos)", "Mantiene tipos exactos", "Binario (Eficiente para objetos Python)"],
                                cons: ["Solo Python (No sirve para Java/JS)", "Inseguro (Ejecución de código arbitrario)", "Frágil entre versiones de librerías"],
                                bestFor: "Persistencia de Modelos ML, Pausar/Reanudar procesos, Caché local"
                            }
                        ],
                        code: {
                            title: "El Problema de las Fechas (Type Loss)",
                            language: "python",
                            snippet: `import json
import pickle
from datetime import datetime

# Datos con tipos complejos (Fecha)
data = {
    "evento": "Clase de Python",
    "fecha": datetime.now(), # <--- Objeto complejo
    "asistentes": ("Juan", "Maria") # <--- Tupla
}

print(f"🐍 Original: {type(data['fecha'])} - {type(data['asistentes'])}")

# --- INTENTO 1: JSON ---
try:
    # json.dumps(data) # ❌ Error: Object of type datetime is not JSON serializable
    
    # Solución: Convertir a String manualmente
    data_json = data.copy()
    data_json['fecha'] = str(data['fecha']) 
    
    texto_json = json.dumps(data_json)
    print(f"📄 JSON: {texto_json}")
    
    # Al recuperar... ¡perdimos los tipos!
    recuperado = json.loads(texto_json)
    print(f"💔 Recuperado: {type(recuperado['fecha'])} (Ahora es str) y {type(recuperado['asistentes'])} (Ahora es list)")
except Exception as e:
    print(e)

# --- INTENTO 2: PICKLE ---
# Pickle guarda el objeto TAL CUAL (Binario)
bytes_pickle = pickle.dumps(data)
print(f"🥒 Pickle (Bytes): {bytes_pickle[:20]}...")

recuperado_pkl = pickle.loads(bytes_pickle)
print(f"✨ Restaurado: {type(recuperado_pkl['fecha'])} y {type(recuperado_pkl['asistentes'])}")
print("¡Conservó la Fecha y la Tupla exactas!")`,
                            output: "🐍 Original: <class 'datetime.datetime'> - <class 'tuple'>\n📄 JSON: {\"evento\": \"Clase de Python\", \"fecha\": \"2023-10-27...\", \"asistentes\": [\"Juan\", \"Maria\"]}\n💔 Recuperado: <class 'str'> (Ahora es str) y <class 'list'> (Ahora es list)\n🥒 Pickle (Bytes): b'\\x80\\x04\\x95\\x8e\\x00\\x00\\x00\\x00\\x00\\x00\\x00}...' \n✨ Restaurado: <class 'datetime.datetime'> y <class 'tuple'>\n¡Conservó la Fecha y la Tupla exactas!"
                        },
                        codeExplanation: {
                            title: "🔍 Análisis del Código",
                            steps: [
                                {
                                    title: "1. Tipos Complejos",
                                    text: "En Python usamos `datetime` para fechas y `tuple` para listas inmutables. Estos son objetos ricos con métodos propios."
                                },
                                {
                                    title: "2. La Limitación de JSON",
                                    text: "JSON es un formato de texto simple. No sabe qué es una fecha. Para guardar, tuvimos que convertirla a texto (`str`). Al cargar, vuelve como texto, perdiendo su 'magia' (ya no puedes hacer `.year` o `.month` sin reconvertir)."
                                },
                                {
                                    title: "3. La Fidelidad de Pickle",
                                    text: "Pickle toma la memoria y la guarda en bytes. Al cargar, restaura el objeto con su tipo original. Es perfecto para guardar el estado exacto de una aplicación."
                                }
                            ]
                        },
                        quizzes: [
                            {
                                question: "1. Necesitas enviar datos desde tu backend Python a un frontend hecho en React (JavaScript). ¿Qué formato usas?",
                                options: [
                                    "Pickle, porque es más rápido.",
                                    "JSON, porque es el estándar web y JS lo entiende nativamente.",
                                    "CSV, para que lo abran en Excel.",
                                    "TXT, para que lo lean."
                                ],
                                correct: 1,
                                feedback: "✅ Correcto. JSON (JavaScript Object Notation) es nativo para JS y el estándar de facto para APIs REST."
                            },
                            {
                                question: "2. Has entrenado un modelo de IA (Scikit-Learn) que tardó 5 horas. Quieres guardarlo en disco para usarlo mañana. ¿Qué usas?",
                                options: [
                                    "JSON, guarda los coeficientes manualmente.",
                                    "Pickle (o Joblib), porque guarda la estructura completa del objeto Python.",
                                    "Hacer una captura de pantalla.",
                                    "No se puede guardar."
                                ],
                                correct: 1,
                                feedback: "✅ Correcto. Los modelos son objetos complejos. Pickle los serializa conservando toda su estructura interna."
                            },
                            {
                                question: "3. Encuentras un archivo 'juego_pirata.pkl' en un foro. ¿Deberías cargarlo?",
                                options: [
                                    "Sí, seguro tiene trucos gratis.",
                                    "No. Pickle puede ejecutar código malicioso al abrirse.",
                                    "Sí, si tengo antivirus.",
                                    "Solo si es pequeño."
                                ],
                                correct: 1,
                                feedback: "✅ ¡Exacto! NUNCA abras Pickles de fuentes desconocidas. Es una vulnerabilidad de seguridad crítica (RCE)."
                            }
                        ],
                        glossary: {
                            title: "🗂️ Glosario: Datos y Formatos",
                            items: [
                                {
                                    term: "Serialización",
                                    definition: "El proceso de convertir un objeto en memoria (RAM) a un formato de almacenamiento (Disco/Red)."
                                },
                                {
                                    term: "JSON",
                                    definition: "<strong>J</strong>ava<strong>S</strong>cript <strong>O</strong>bject <strong>N</strong>otation. Formato de texto ligero para intercambio de datos."
                                },
                                {
                                    term: "Pickle",
                                    definition: "Módulo de Python para serialización de objetos. Convierte jerarquías de objetos Python en un flujo de bytes."
                                },
                                {
                                    term: "Byte Stream",
                                    definition: "Secuencia de bytes (0s y 1s). Es cómo se ven los datos 'crudos' en la máquina. Pickle genera esto, no texto legible."
                                }
                            ]
                        }
                    }
                },
                {
                    id: "m3",
                    title: "Módulo 3: Validación con Pydantic",
                    shortTitle: "Pydantic",
                    objective: "Implementar validación estricta de tipos para asegurar la calidad de los datos de entrada.",
                    duration: "30 min",
                    content: {
                        concept: {
                            title: "El Cadenero de tus Datos",
                            text: "En programación defensiva antigua, llenábamos el código de `if type(x) != int: raise Error`. Eso es sucio y difícil de leer. Pydantic cambia esto por una <span class='tooltip'>Validación Declarativa<span class='tooltip-text'>Defines QUÉ quieres (el contrato), no CÓMO validarlo paso a paso.</span></span>.<br><br>Pydantic actúa como el <strong>Cadenero (Bouncer)</strong> de tu script. Tú le das las reglas del club (el <span class='tooltip'>Esquema<span class='tooltip-text'>La estructura y tipos esperados de los datos.</span></span>) y él se encarga de revisar a todos en la entrada. Si alguien llega con 'zapatos equivocados' (tipos incorrectos), Pydantic intenta arreglarlos (<span class='tooltip'>Coerción<span class='tooltip-text'>Transformación automática de datos, ej: recibir el texto '5' y convertirlo al número 5.</span></span>). Si no puede, los expulsa con un error detallado.",
                            analogy: "🛡️ <strong>Analogía:</strong><br>• <strong>Validación Manual:</strong> Es como un guardia que tiene que revisar cada bolsillo manualmente y preguntar '¿Eres mayor de edad?'. Lento y propenso a errores.<br>• <strong>Pydantic:</strong> Es un escáner biométrico de aeropuerto. Pasas (los datos), y automáticamente verifica identidad, pasaporte y equipaje en milisegundos. Si algo falla, te dice exactamente qué (ej: 'Pasaporte vencido').",
                            warning: "💡 <strong>Tip Moderno:</strong> Pydantic V2 está escrito en Rust, lo que lo hace extremadamente rápido. Úsalo para validar filas de DataFrames, respuestas de APIs o configuraciones complejas."
                        },
                        comparison: [
                            {
                                title: "Validación Manual 🚧",
                                pros: ["No requiere librerías extra"],
                                cons: ["Verbosidad extrema (muchos `if/else`)", "Difícil de leer y mantener", "Reinventa la rueda en cada función"],
                                bestFor: "Scripts diminutos sin dependencias"
                            },
                            {
                                title: "Pydantic 🛡️",
                                pros: ["Declarativo (Legible)", "Coerción automática (Str -> Int)", "Mensajes de error estandarizados"],
                                cons: ["Requiere instalar librería", "Curva de aprendizaje inicial"],
                                bestFor: "APIs (FastAPI), Pipelines de Datos, Configuración"
                            }
                        ],
                        code: {
                            title: "Definiendo un Contrato de Datos",
                            language: "python",
                            snippet: `from pydantic import BaseModel, Field, field_validator, ValidationError
from typing import Optional

# 1. Definir el Esquema (El Contrato)
class Producto(BaseModel):
    id: int
    nombre: str = Field(min_length=3)    # Mínimo 3 caracteres
    precio: float = Field(gt=0)          # Greater Than 0
    categoria: str

    # 2. Validador Personalizado (Lógica de Negocio)
    @field_validator('categoria')
    @classmethod
    def categoria_mayuscula(cls, v: str) -> str:
        if v.upper() not in ['TECH', 'HOGAR', 'MODA']:
            raise ValueError('Categoría inválida. Debe ser TECH, HOGAR o MODA')
        return v.upper() # Coerción forzada a mayúsculas

# Datos "Sucios" de entrada (Diccionario)
datos_entrada = {
    "id": "550",          # String -> Pydantic lo hará Int
    "nombre": "TV",       # ❌ Error: Muy corto (min 3)
    "precio": -100,       # ❌ Error: Negativo (gt 0)
    "categoria": "tech"   # Minúscula -> El validador lo hará "TECH"
}

try:
    # 3. Validar
    prod = Producto(**datos_entrada)
    print(f"✅ Producto creado: {prod}")
except ValidationError as e:
    print("❌ DATOS RECHAZADOS:")
    print(e.json(indent=2))`,
                            output: "❌ DATOS RECHAZADOS:\\n[\\n  {\\n    \"type\": \"string_too_short\",\\n    \"loc\": [\"nombre\"],\\n    \"msg\": \"String should have at least 3 characters\",\\n    \"input\": \"TV\",\\n    \"ctx\": {\"min_length\": 3}\\n  },\\n  {\\n    \"type\": \"greater_than\",\\n    \"loc\": [\"precio\"],\\n    \"msg\": \"Input should be greater than 0\",\\n    \"input\": -100,\\n    \"ctx\": {\"gt\": 0}\\n  }\\n]"
                        },
                        codeExplanation: {
                            title: "🔍 Análisis del Modelo",
                            steps: [
                                {
                                    title: "1. BaseModel",
                                    text: "Al heredar de `BaseModel`, nuestra clase `Producto` gana superpoderes de validación. Ya no es una clase normal, es un Esquema."
                                },
                                {
                                    title: "2. Constraints (Restricciones)",
                                    text: "Usamos `Field(gt=0)` para decir 'El precio debe ser mayor a 0'. Pydantic valida esto automáticamente sin escribir ni un solo `if`."
                                },
                                {
                                    title: "3. Validadores Custom (@field_validator)",
                                    text: "Para reglas complejas (como verificar una lista de categorías válidas), usamos decoradores. Aquí también transformamos 'tech' a 'TECH' automáticamente."
                                }
                            ]
                        },
                        quizzes: [
                            {
                                question: "1. Si envías el string '50' a un campo definido como `edad: int`, ¿Qué hace Pydantic por defecto?",
                                options: [
                                    "Lanza un error de tipo (TypeError).",
                                    "Lo convierte automáticamente al entero 50 (Coerción).",
                                    "Lo deja como string '50'.",
                                    "Borra el dato."
                                ],
                                correct: 1,
                                feedback: "✅ Correcto. Pydantic es inteligente e intenta 'coaccionar' los tipos si tiene sentido. Esto facilita manejar inputs de formularios web o JSONs."
                            },
                            {
                                question: "2. ¿Para qué sirve `Field(gt=0)` en la definición del modelo?",
                                options: [
                                    "Para definir un valor por defecto de 0.",
                                    "Para decir que el campo es opcional.",
                                    "Para imponer una restricción: el valor debe ser mayor a 0 (Greater Than).",
                                    "No hace nada, es comentario."
                                ],
                                correct: 2,
                                feedback: "✅ Exacto. `Field` nos permite añadir metadatos y validaciones numéricas o de longitud de forma declarativa."
                            },
                            {
                                question: "3. ¿Por qué preferimos Pydantic sobre escribir muchos `if/else`?",
                                options: [
                                    "Porque Pydantic es de Google.",
                                    "Porque hace el código más legible, seguro y estandariza los mensajes de error.",
                                    "Porque Python obliga a usarlo.",
                                    "Para hacer el código más lento."
                                ],
                                correct: 1,
                                feedback: "✅ Correcto. La legibilidad y la estandarización son claves. Además, Pydantic genera documentación automática (OpenAPI) en frameworks como FastAPI."
                            }
                        ],
                        glossary: {
                            title: "🗂️ Glosario: Validación",
                            items: [
                                {
                                    term: "Esquema (Schema)",
                                    definition: "La definición formal de la estructura de tus datos. Qué campos existen y qué tipos tienen."
                                },
                                {
                                    term: "Type Hinting",
                                    definition: "Sintaxis de Python (`x: int`) para indicar el tipo de dato esperado. Pydantic usa esto para saber cómo validar."
                                },
                                {
                                    term: "Coerción",
                                    definition: "La conversión automática y forzada de un tipo de dato a otro (ej. String -> Integer) para cumplir con el esquema."
                                },
                                {
                                    term: "Declarativo",
                                    definition: "Estilo de programación donde describes QUÉ quieres lograr (ej. 'edad > 18') en lugar de CÓMO hacerlo paso a paso."
                                }
                            ]
                        }
                    }
                },
                {
                    id: "m4",
                    title: "Módulo 4: requirements.txt",
                    shortTitle: "Dependencias",
                    objective: "Garantizar la reproducibilidad del entorno de análisis en cualquier máquina.",
                    duration: "20 min",
                    content: {
                        concept: {
                            title: "La Receta Exacta y la Cocina Aislada",
                            text: "Tu código no vive en el vacío; vive sobre una montaña de librerías (pandas, numpy, scikit-learn). Pero... ¿Qué pasa si el Proyecto A necesita `pandas 1.0` y el Proyecto B necesita `pandas 2.0`? Si instalas todo globalmente, tendrás un conflicto (<span class='tooltip'>Dependency Hell<span class='tooltip-text'>Situación donde paquetes incompatibles rompen tu entorno.</span></span>).<br><br>Para evitar esto, usamos <span class='tooltip'>Entornos Virtuales (venv)<span class='tooltip-text'>Una carpeta aislada que contiene su propia copia de Python y librerías para un proyecto específico.</span></span>.",
                            analogy: "🍰 <strong>Analogía:</strong><br>• <strong>Global:</strong> Una sola cocina comunitaria donde todos cocinan a la vez. Si alguien tira sal al puré, ¡arruina el pastel de al lado!<br>• <strong>Entorno Virtual:</strong> Cada chef tiene su propia cocina privada y cerrada. Lo que pasa en la cocina A, se queda en la cocina A.",
                            warning: "⚠️ <strong>Práctica Vital:</strong> Nunca uses `pip install` en tu sistema global. Crea siempre un entorno virtual (`python -m venv .venv`) antes de empezar."
                        },
                        comparison: [
                            {
                                title: "Instalación Global 🌍",
                                pros: ["Fácil al principio (solo `pip install`)"],
                                cons: ["Conflictos de versiones entre proyectos", "Rompe el sistema operativo", "Irreproducible"],
                                bestFor: "Nada (Evitar siempre)"
                            },
                            {
                                title: "Entorno Virtual 📦",
                                pros: ["Aislamiento total", "Reproducible (requirements.txt)", "Seguro"],
                                cons: ["Requiere pasos extra (activar)"],
                                bestFor: "Todos los proyectos de Python"
                            }
                        ],
                        code: {
                            title: "Flujo de Trabajo Profesional",
                            language: "bash",
                            snippet: `# 1. CREAR el entorno virtual (solo una vez)
# (Esto crea una carpeta .venv oculta)
python -m venv .venv

# 2. ACTIVAR el entorno (Cada vez que trabajes)
# Mac/Linux:
source .venv/bin/activate
# Windows:
# .\\.venv\\Scripts\\activate

# (Verás que tu terminal cambia: "(.venv) user@mac:~$")

# 3. INSTALAR librerías (Se guardan en .venv, no en el sistema)
pip install pandas==2.0.3 numpy scikit-learn

# 4. CONGELAR versiones para compartir
pip freeze > requirements.txt

# --- Contenido generado en requirements.txt ---
# numpy==1.24.3
# pandas==2.0.3
# ...`,
                            output: "(.venv) $ pip freeze > requirements.txt\n(Se crea el archivo con las versiones exactas)"
                        },
                        codeExplanation: {
                            title: "🔍 El Ciclo de Vida",
                            steps: [
                                {
                                    title: "1. python -m venv .venv",
                                    text: "El comando mágico. Crea una carpeta `.venv` que es una copia ligera de Python. Todo lo que hagas ahora ocurrirá allí adentro."
                                },
                                {
                                    title: "2. Activar",
                                    text: "Le dice a tu terminal: 'Oye, cuando diga python o pip, usa los de la carpeta .venv, no los de Windows/Mac'."
                                },
                                {
                                    title: "3. pip freeze",
                                    text: "Toma una foto instantánea de todas las librerías instaladas y sus versiones exactas. Es la garantía de que a tu colega le funcionará igual."
                                }
                            ]
                        },
                        quizzes: [
                            {
                                question: "¿Por qué es importante el símbolo '==' en requirements.txt (ej: pandas==2.0.1)?",
                                options: [
                                    "Es solo sintaxis, no importa.",
                                    "Para indicar que instale la versión más reciente.",
                                    "Para 'anclar' (pin) la versión exacta y asegurar que el código funcione igual en el futuro.",
                                    "Para comparar si pandas está instalado."
                                ],
                                correct: 2,
                                feedback: "✅ Correcto. 'Pinning' (anclar) versiones previene que una actualización futura de una librería rompa tu análisis estadístico antiguo."
                            }
                        ],
                        glossary: {
                            title: "🗂️ Glosario: Entornos",
                            items: [
                                {
                                    term: "Virtual Environment",
                                    definition: "Espacio aislado para dependencias de un proyecto. Evita conflictos 'Dependency Hell'."
                                },
                                {
                                    term: "pip freeze",
                                    definition: "Comando que lista todas las librerías instaladas y sus versiones. Se usa para generar `requirements.txt`."
                                },
                                {
                                    term: "requirements.txt",
                                    definition: "Archivo de texto que define las dependencias exactas de un proyecto. Permite reproducir el entorno con `pip install -r requirements.txt`."
                                }
                            ]
                        }
                    }
                },
                {
                    id: "synth",
                    title: "Síntesis e Integración",
                    shortTitle: "Resumen",
                    objective: "Integrar los conceptos en un pipeline mental robusto.",
                    duration: "15 min",
                    content: {
                        concept: {
                            title: "Pipeline Completo: De Idea a Análisis Reproducible",
                            text: "<strong>Resumen del flujo de trabajo profesional:</strong><br><br><strong>1. Configuración del Entorno (una vez por proyecto)</strong><br>• Crear repositorio Git: <code>git init</code><br>• Crear entorno virtual: <code>python -m venv env</code> o <code>conda create</code><br>• Definir <code>.gitignore</code> (datos, outputs, env)<br>• Primer commit: <code>git add . && git commit -m 'Estructura inicial'</code><br>• Conectar GitHub: <code>git remote add origin URL && git push</code><br><br><strong>2. Desarrollo Iterativo (ciclo diario)</strong><br>• Activar entorno → Escribir código → Probar → Commit atómico → Push<br>• Usar decoradores para validar supuestos estadísticos<br>• Actualizar <code>requirements.txt</code> al añadir dependencias<br><br><strong>3. Entrega/Publicación</strong><br>• Crear tag de versión: <code>git tag -a v1.0 -m 'Entrega final'</code><br>• Opcional: Crear Dockerfile para reproducibilidad total<br>• Compartir: repositorio + requirements.txt (o imagen Docker)",
                            analogy: "🎯 <strong>El estadístico moderno:</strong> Domina tanto la teoría estadística como las herramientas de ingeniería de software. Esto no significa convertirse en programador, sino adoptar prácticas que garantizan que tus análisis sean <strong>reproducibles</strong>, <strong>versionados</strong>, y <strong>validados automáticamente</strong>. Un análisis que no se puede reproducir es, científicamente, un análisis que no existe.",
                            warning: " <strong>Checklist antes de entregar cualquier análisis:</strong><br>☐ ¿El código corre desde cero en un entorno limpio?<br>☐ ¿Existe requirements.txt o environment.yml actualizado?<br>☐ ¿Los datos sensibles están en .gitignore?<br>☐ ¿Hay commits descriptivos (no 'cambios finales')?<br>☐ ¿Se verifican supuestos estadísticos antes de cada test?<br>☐ ¿El repositorio está sincronizado con GitHub?"
                        },
                        comparison: [
                            { tool: "Python 3.11+", use: "Rendimiento", detail: "Pattern matching, mejor velocidad, mensajes de error claros. Base sólida para análisis modernos.", icon: "🐍" },
                            { tool: "venv/conda", use: "Aislamiento", detail: "Entornos reproducibles. requirements.txt para compartir. Evita conflictos de dependencias.", icon: "📦" },
                            { tool: "Docker", use: "Reproducibilidad Total", detail: "Empaqueta SO + Python + libs. Ideal para papers y producción.", icon: "🐳" },
                            { tool: "Git + GitHub", use: "Versionado y Respaldo", detail: "Historial de cambios, colaboración, respaldo en nube. Esencial para cualquier proyecto.", icon: "📋" },
                            { tool: "Decoradores", use: "Validación Automática", detail: "Verifican supuestos antes de ejecutar tests. Código DRY y robusto.", icon: "🛡️" }
                        ],
                        code: {
                            title: "Plantilla: Inicio de Proyecto de Análisis",
                            snippet: `# ═══════════════════════════════════════════════════════════
# SCRIPT DE INICIO RÁPIDO PARA NUEVO PROYECTO
# Copia y ejecuta estos comandos en tu terminal
# ═══════════════════════════════════════════════════════════

# 1. Crear estructura de carpetas
mkdir mi_proyecto_tesis
cd mi_proyecto_tesis
mkdir datos scripts outputs figuras

# 2. Inicializar Git
git init

# 3. Crear .gitignore
cat > .gitignore << 'EOF'
# Datos (no subir a GitHub)
datos/
*.csv
*.xlsx
*.parquet

# Outputs regenerables
outputs/
figuras/
*.png
*.pdf

# Entornos
venv/
env/
.env
*.pyc
__pycache__/

# Sistema
.DS_Store
Thumbs.db
EOF

# 4. Crear entorno virtual
python -m venv env
source env/bin/activate  # Windows: env\\Scripts\\activate

# 5. Instalar dependencias base
pip install pandas numpy scipy matplotlib statsmodels
pip freeze > requirements.txt

# 6. Crear archivo principal
cat > scripts/analisis_principal.py << 'EOF'
"""
Análisis Principal - Mi Proyecto
Autor: Tu Nombre
Fecha: $(date +%Y-%m-%d)
"""
import pandas as pd
import numpy as np
from scipy import stats

def main():
    # Tu código aquí
    print("Proyecto iniciado correctamente")

if __name__ == "__main__":
    main()
EOF

# 7. Primer commit
git add .
git commit -m "Estructura inicial del proyecto"

# 8. Conectar con GitHub (reemplaza URL)
# git remote add origin https://github.com/usuario/mi_proyecto.git
# git push -u origin main

echo "✅ Proyecto listo para trabajar"`,
                            output: "✅ Proyecto listo para trabajar\\n📁 Estructura: datos/ scripts/ outputs/ figuras/\\n🐍 Entorno: env/ activado\\n📋 Git: Repositorio inicializado"
                        },
                        resources: [
                            { name: "Real Python - Virtual Environments", desc: "Guía completa de entornos virtuales en Python.", url: "https://realpython.com/python-virtual-environments-a-primer/" },
                            { name: "Git - Pro Git Book (Español)", desc: "Libro oficial de Git, gratuito y en español.", url: "https://git-scm.com/book/es/v2" },
                            { name: "Docker para Data Science (DataCamp)", desc: "Tutorial completo de Docker para proyectos de datos.", url: "https://www.datacamp.com/tutorial/docker-for-data-science-introduction" },
                            { name: "Scipy Lecture Notes", desc: "Tutoriales del stack científico Python (NumPy, Pandas, Scipy).", url: "https://scipy-lectures.org/" },
                            { name: "The Missing Semester (MIT)", desc: "Curso de MIT sobre herramientas esenciales: Git, Shell, etc.", url: "https://missing.csail.mit.edu/" }
                        ],
                        chartData: {
                            type: 'radar',
                            label: 'Competencias Desarrolladas',
                            labels: ['Rendimiento (Py3.11)', 'Aislamiento (Venv/Conda)', 'Contenedores (Docker)', 'Control Versiones (Git)', 'Validación (Decoradores)'],
                            data: [85, 90, 70, 80, 85],
                            description: "Mapa de competencias técnicas cubiertas en este curso."
                        }
                    }
                }
            ]
        };

        // --- STATE MANAGMENT ---
        let currentModuleIndex = 0;
        let completedModules = new Set();

        // --- INIT ---
        function init() {
            renderPipeline();
            renderNav();
            loadModule(0);
            startTimer();
        }

        // --- RENDERING ---
        function renderPipeline() {
            pipelineContainer.innerHTML = '';
            courseData.modules.forEach((mod, index) => {
                const step = document.createElement('div');
                step.className = `relative flex flex-col items-center z-10 flex-1 step-connector cursor-pointer group`;
                if (index === courseData.modules.length - 1) step.classList.remove('step-connector');

                // State classes
                const isActive = index === currentModuleIndex;
                const isDone = completedModules.has(index);

                step.innerHTML = `
                    <div class="step-circle w-10 h-10 rounded-full flex items-center justify-center border-2 bg-white transition-all duration-300 
                        ${isActive ? 'border-orange-600 bg-orange-600 text-white shadow-lg scale-110' :
                        isDone ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-gray-300 text-gray-400 group-hover:border-gray-400'}">
                        ${isDone ? '✓' : index + 1}
                    </div>
                    <span class="mt-2 text-xs font-semibold ${isActive ? 'text-orange-700' : 'text-gray-500'}">
                        ${mod.shortTitle}
                    </span>
                `;

                step.onclick = () => loadModule(index);
                pipelineContainer.appendChild(step);
            });
        }

        function renderNav() {
            moduleNav.innerHTML = '';
            courseData.modules.forEach((mod, index) => {
                const btn = document.createElement('button');
                btn.className = `w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors mb-1 flex items-center justify-between
                    ${index === currentModuleIndex
                        ? 'bg-orange-50 text-orange-700 border border-orange-200'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`;

                btn.innerHTML = `
                    <span>${mod.title}</span>
                    ${completedModules.has(index) ? '<span class="text-emerald-500">✓</span>' : ''}
                `;
                btn.onclick = () => loadModule(index);
                moduleNav.appendChild(btn);
            });
        }

        function loadModule(index) {
            currentModuleIndex = index;
            renderPipeline();
            renderNav();

            const mod = courseData.modules[index];

            // Generate HTML based on module content
            let contentHTML = `
                <div class="animate-fade-in space-y-8">
                    <!-- Header -->
                    <div class="border-b border-gray-100 pb-6">
                        <div class="flex items-center space-x-2 text-sm text-orange-600 font-semibold mb-2 uppercase tracking-wide">
                            <span>Módulo ${index + 1}</span>
                        </div>
                        <h2 class="text-3xl font-bold text-gray-900 mb-4">${mod.title}</h2>
                        <div class="bg-gray-50 rounded-lg p-4 border border-gray-200 flex items-start gap-3">
                            <span class="text-xl">🎯</span>
                            <div>
                                <h3 class="font-bold text-gray-800 text-sm">Objetivo</h3>
                                <p class="text-gray-600 text-sm">${mod.objective}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Concept Section -->
                    <section class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div class="lg:col-span-2 space-y-4">
                            <h3 class="text-xl font-bold text-gray-800">${mod.content.concept.title}</h3>
                            <p class="text-gray-600 leading-relaxed">${mod.content.concept.text}</p>
                            ${mod.content.concept.analogy ? `
                            <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r text-sm text-blue-800" role="note">
                                ${mod.content.concept.analogy}
                            </div>` : ''}
                            ${mod.content.concept.warning ? `
                            <div class="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r text-sm text-yellow-800" role="alert">
                                ${mod.content.concept.warning}
                            </div>` : ''}
                        </div>
            `;

            // Comparison / Visual Comparison Section
            if (mod.content.comparison || mod.content.visualComparison) {
                const comparisons = mod.content.comparison || mod.content.visualComparison;
                contentHTML += `
                    <div class="lg:col-span-1 space-y-3">
                         <div class="text-xs font-bold text-gray-400 text-center uppercase">Comparativa</div>
                         ${comparisons.map(c => `
                            <div class="bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="text-xl">${c.icon || (c.title.includes('GET') ? '🔍' : c.title.includes('POST') ? '📝' : '⚡')}</span>
                                    <span class="font-bold text-gray-800">${c.title || c.tool}</span>
                                </div>
                                ${c.use ? `<div class="text-xs font-semibold text-orange-600 mb-1">${c.use}</div>` : ''}
                                ${c.pros ? `<ul class="text-xs text-green-700 list-disc ml-4 mb-1">${c.pros.map(p => `<li>${p}</li>`).join('')}</ul>` : ''}
                                ${c.cons ? `<ul class="text-xs text-red-700 list-disc ml-4">${c.cons.map(p => `<li>${p}</li>`).join('')}</ul>` : ''}
                                ${c.detail ? `<p class="text-xs text-gray-500">${c.detail}</p>` : ''}
                            </div>
                         `).join('')}
                    </div>
                `;
            } else if (mod.content.chartData && !mod.content.resources) {
                contentHTML += `
                    <div class="lg:col-span-1 bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center">
                        <div class="text-xs font-bold text-gray-400 text-center mb-2 uppercase">Visualización de Datos</div>
                        <div class="chart-container">
                            <canvas id="moduleChart"></canvas>
                        </div>
                        <p class="text-xs text-center text-gray-500 mt-2 italic">${mod.content.chartData.description}</p>
                    </div>
                `;
            } else {
                contentHTML += `<div class="lg:col-span-1"></div>`; // Placeholder to keep grid layout
            }

            contentHTML += `</section>`;

            // Code Section
            if (mod.content.code) {
                contentHTML += `
                    <section class="bg-gray-900 rounded-xl overflow-hidden shadow-lg border border-gray-700">
                        <div class="bg-gray-800 px-4 py-2 flex items-center justify-between border-b border-gray-700">
                            <span class="text-gray-300 text-xs font-mono">main.py</span>
                            <span class="text-xs text-gray-500">Python 3.11</span>
                        </div>
                        <div class="p-6 overflow-x-auto code-scroll">
                            <h4 class="text-gray-400 text-sm font-bold mb-3 border-b border-gray-700 pb-2">${mod.content.code.title}</h4>
                            <pre class="code-font text-sm text-gray-300 whitespace-pre"><code id="code-block">${escapeHtml(mod.content.code.snippet)}</code></pre>
                        </div>
                        <div class="bg-black bg-opacity-50 p-4 border-t border-gray-800 flex items-center justify-between">
                            <button onclick="runSimulation('${mod.id}')" class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded text-sm font-medium flex items-center gap-2 transition-colors">
                                <span>▶ Ejecutar Código</span>
                            </button>
                            <div id="output-${mod.id}" class="hidden font-mono text-xs text-emerald-400 bg-gray-900 px-3 py-2 rounded border border-gray-700 w-2/3">
                                >_ Esperando ejecución...
                            </div>
                        </div>
                    </section>
                `;
            }

            // Code Explanation Section (New for Semana II)
            if (mod.content.codeExplanation) {
                contentHTML += `
                    <section class="mt-6">
                        <h3 class="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                             <i class="fas fa-search-plus text-primary"></i> ${mod.content.codeExplanation.title}
                        </h3>
                        <div class="space-y-4">
                            ${mod.content.codeExplanation.steps.map((step, i) => `
                                <div class="flex gap-4">
                                    <div class="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                                        ${i + 1}
                                    </div>
                                    <div>
                                        <h4 class="font-bold text-gray-800 text-sm">${step.title}</h4>
                                        <p class="text-sm text-gray-600">${step.text}</p>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </section>
                `;
            }

            // Quizzes Section (Handling Multiple)
            if (mod.content.quizzes) {
                contentHTML += `<div class="space-y-6">`;
                mod.content.quizzes.forEach((quiz, index) => {
                    contentHTML += `
                        <section class="bg-orange-50 rounded-xl p-6 border border-orange-100">
                            <h3 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span class="bg-orange-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">?</span>
                                Checkpoint ${index + 1}
                            </h3>
                            <p class="text-gray-700 font-medium mb-4">${quiz.question}</p>
                            <div class="space-y-2" id="quiz-options-${mod.id}-${index}" role="radiogroup">
                                ${quiz.options.map((opt, i) => `
                                    <button onclick="checkAnswer(${i}, ${quiz.correct}, '${mod.id}', ${index})" 
                                        class="quiz-opt-btn w-full text-left p-3 rounded bg-white border border-orange-200 hover:bg-orange-100 transition-colors text-sm text-gray-700">
                                        ${opt}
                                    </button>
                                `).join('')}
                            </div>
                            <div id="quiz-feedback-${mod.id}-${index}" class="hidden mt-4 p-3 rounded text-sm font-medium"></div>
                        </section>
                    `;
                });
                contentHTML += `</div>`;
            }

            // Glossary Section (New for Semana II)
            if (mod.content.glossary) {
                contentHTML += `
                    <section class="mt-8 usta-card p-6">
                         <h3 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span class="usta-gradient text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">
                                <i class="fas fa-book text-xs"></i>
                            </span>
                            ${mod.content.glossary.title}
                        </h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            ${mod.content.glossary.items.map(item => `
                                <div class="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                    <span class="font-bold text-primary block mb-1">${item.term}</span>
                                    <p class="text-xs text-gray-600">${item.definition}</p>
                                </div>
                            `).join('')}
                        </div>
                         ${mod.content.glossary.conceptualExample ? `
                            <div class="mt-4 p-4 bg-gray-100 rounded-lg">
                                <h4 class="font-bold text-sm text-gray-800 mb-2">${mod.content.glossary.conceptualExample.title}</h4>
                                <p class="text-xs text-gray-600 mb-3">${mod.content.glossary.conceptualExample.description}</p>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <pre class="bg-red-50 text-red-800 p-2 rounded text-xs overflow-x-auto code-font">${mod.content.glossary.conceptualExample.codeOld}</pre>
                                    <pre class="bg-green-50 text-green-800 p-2 rounded text-xs overflow-x-auto code-font">${mod.content.glossary.conceptualExample.codeNew}</pre>
                                </div>
                            </div>
                        ` : ''}
                    </section>
                `;
            }

            // Chart Section (Synthesis)
            if (mod.content.chartData && mod.content.resources) {
                contentHTML += `
                    <section class="mt-8 usta-card p-6">
                        <h3 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span class="usta-gradient text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">
                                <i class="fas fa-chart-pie text-xs"></i>
                            </span>
                            Competencias Desarrolladas
                        </h3>
                        <div class="flex flex-col md:flex-row items-center gap-6">
                            <div class="w-full md:w-1/2" style="height: 320px;">
                                <canvas id="moduleChart"></canvas>
                            </div>
                            <div class="w-full md:w-1/2">
                                <p class="text-sm text-gray-600 mb-4">${mod.content.chartData.description}</p>
                                <div class="space-y-2">
                                    ${mod.content.chartData.labels.map((label, i) => `
                                        <div class="flex items-center justify-between text-sm">
                                            <span class="text-gray-700">${label}</span>
                                            <div class="flex items-center gap-2">
                                                <div class="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div class="h-full usta-gradient rounded-full" style="width: ${mod.content.chartData.data[i]}%"></div>
                                                </div>
                                                <span class="text-xs font-bold text-primary">${mod.content.chartData.data[i]}%</span>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    </section>
                `;
            }

            // Resources (Synthesis)
            if (mod.content.resources) {
                contentHTML += `
                    <section class="mt-8">
                        <h3 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span class="usta-gradient text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">
                                <i class="fas fa-rocket text-xs"></i>
                            </span>
                            Próximos Pasos
                        </h3>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            ${mod.content.resources.map(res => `
                                <a href="${res.url}" target="_blank" rel="noopener noreferrer" class="block p-4 rounded-lg border border-gray-200 hover:border-secondary hover:shadow-md transition-all group" aria-label="Recurso externo: ${res.name}">
                                    <div class="font-bold text-gray-800 group-hover:text-secondary mb-1">${res.name} <span class="text-xs">↗</span></div>
                                    <div class="text-xs text-gray-500">${res.desc}</div>
                                </a>
                            `).join('')}
                        </div>
                    </section>
                `;
            }

            // Navigation buttons
            contentHTML += `
                <div class="mt-10 pt-6 border-t border-gray-200 flex justify-between items-center">
                    ${index > 0 ? `
                    <button onclick="loadModule(${index - 1})" class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors" aria-label="Ir al módulo anterior">
                        <span>←</span> Anterior
                    </button>` : '<div></div>'}
                    ${index < courseData.modules.length - 1 ? `
                    <button onclick="loadModule(${index + 1})" class="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors" aria-label="Ir al siguiente módulo">
                        Siguiente Módulo <span>→</span>
                    </button>` : `
                    <div class="text-center">
                        <span class="text-emerald-600 font-bold">🎉 Sesión Completada!</span>
                    </div>`}
                </div>
            `;

            contentHTML += `</div>`; // Close fade-in wrapper
            contentArea.innerHTML = contentHTML;

            // Initialize Chart if needed
            if (mod.content.chartData) {
                renderChart(mod.content.chartData);
            }
        }

        // --- INTERACTION LOGIC ---

        function runSimulation(modId) {
            const outputDiv = document.getElementById(`output-${modId}`);
            const mod = courseData.modules.find(m => m.id === modId);

            outputDiv.innerHTML = "<span class='animate-pulse'>Procesando...</span>";
            outputDiv.classList.remove('hidden');

            setTimeout(() => {
                outputDiv.innerHTML = `>_ ${mod.content.code.output.replace(/\n/g, '<br>>_ ')}`;
                outputDiv.classList.remove('text-emerald-400', 'bg-gray-900');
                outputDiv.classList.add('bg-black', 'text-green-400'); // Terminal look
            }, 800);
        }

        function checkAnswer(selectedIdx, correctIdx, modId, quizIndex) {
            const feedbackDiv = document.getElementById(`quiz-feedback-${modId}-${quizIndex}`);
            const buttons = document.querySelectorAll(`#quiz-options-${modId}-${quizIndex} button`);
            const mod = courseData.modules.find(m => m.id === modId);
            const quiz = mod.content.quizzes[quizIndex];

            buttons.forEach((btn, idx) => {
                btn.disabled = true;
                if (idx === correctIdx) {
                    btn.classList.remove('bg-white', 'border-orange-200');
                    btn.classList.add('bg-emerald-100', 'border-emerald-500', 'text-emerald-800');
                } else if (idx === selectedIdx) {
                    btn.classList.remove('bg-white', 'border-orange-200');
                    btn.classList.add('bg-red-100', 'border-red-500', 'text-red-800');
                }
            });

            feedbackDiv.classList.remove('hidden');
            if (selectedIdx === correctIdx) {
                feedbackDiv.className = "mt-4 p-3 rounded text-sm font-medium bg-emerald-50 text-emerald-800 border border-emerald-200";
                feedbackDiv.innerHTML = quiz.feedback;
                // Mark module as complete if all quizzes in module are correct? For now just simplest logic:
                // We'll mark as complete if it's the last quiz? Or just mark it.
                // Simple logic: if user attempts and gets right, we consider it progress.

                // Only mark visual progress for module if this is the last quiz or if there's only 1.
                // But simplified: just mark if not marked.
                const modIdx = courseData.modules.findIndex(m => m.id === modId);
                if (!completedModules.has(modIdx)) {
                    completedModules.add(modIdx);
                    renderPipeline(); // Update visual progress
                    renderNav();
                }
            } else {
                feedbackDiv.className = "mt-4 p-3 rounded text-sm font-medium bg-red-50 text-red-800 border border-red-200";
                feedbackDiv.innerHTML = "❌ Incorrecto. Revisa el concepto clave e intenta de nuevo.";
                // Re-enable after delay
                setTimeout(() => {
                    buttons.forEach(btn => {
                        btn.disabled = false;
                        btn.className = "quiz-opt-btn w-full text-left p-3 rounded bg-white border border-orange-200 hover:bg-orange-100 transition-colors text-sm text-gray-700";
                    });
                    feedbackDiv.classList.add('hidden');
                }, 2500);
            }
        }

        function renderChart(data) {
            const ctx = document.getElementById('moduleChart').getContext('2d');

            // Common Options
            const commonOptions = {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: data.type === 'radar' },
                }
            };

            if (data.type === 'bar') {
                new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: data.labels,
                        datasets: [{
                            label: data.label,
                            data: data.data,
                            backgroundColor: ['#E5E7EB', '#D1D5DB', '#EA580C'],
                            borderRadius: 4
                        }]
                    },
                    options: {
                        ...commonOptions,
                        scales: {
                            y: { beginAtZero: true, title: { display: true, text: 'Valor' } }
                        }
                    }
                });
            } else if (data.type === 'radar') {
                new Chart(ctx, {
                    type: 'radar',
                    data: {
                        labels: data.labels,
                        datasets: [{
                            label: 'Competencias',
                            data: data.data,
                            backgroundColor: 'rgba(61, 0, 141, 0.15)',
                            borderColor: '#3D008D',
                            pointBackgroundColor: '#ED1E79',
                            pointBorderColor: '#fff',
                            pointHoverBackgroundColor: '#fff',
                            pointHoverBorderColor: '#ED1E79',
                            borderWidth: 2
                        }]
                    },
                    options: {
                        ...commonOptions,
                        scales: {
                            r: {
                                angleLines: { display: true, color: 'rgba(0,0,0,0.1)' },
                                suggestedMin: 0,
                                suggestedMax: 100,
                                ticks: { backdropColor: 'transparent' }
                            }
                        }
                    }
                });
            }
        }

        function startTimer() {
            let mins = 120;
            const timeDisplay = document.getElementById('time-remaining');
            setInterval(() => {
                if (mins > 0) {
                    mins--;
                    if (timeDisplay) timeDisplay.innerText = mins;
                }
            }, 60000);
        }

        function escapeHtml(text) {
            if (!text) return '';
            return text
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }

        // Start App
        init();

        // Scroll to Top Button
        const scrollToTopBtn = document.getElementById('scrollToTopBtn');

        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                scrollToTopBtn.classList.add('visible');
            } else {
                scrollToTopBtn.classList.remove('visible');
            }
        });

        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

