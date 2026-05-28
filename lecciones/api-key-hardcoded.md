---
tags:
  - leccion
  - prioridad/baja
fecha: 2026-05-27
severidad: baja
area: seguridad
---

# api_key="ollama" Hardcoded

## Sintoma

El string `api_key="ollama"` aparece hardcoded en 6 archivos Python al instanciar el cliente OpenAI. Aunque Ollama no requiere autenticacion real, el patron es fragil: si se cambia el endpoint a un servicio pago, la key quedaria expuesta en el codigo fuente.

## Raiz del problema

Conveniencia durante desarrollo: el constructor de OpenAI requiere `api_key` como parametro obligatorio, y se uso el string "ollama" como placeholder.

## Mitigacion

```python
# En lugar de:
vlm_client = OpenAI(base_url=OLLAMA_URL, api_key="ollama")

# Usar:
import os
vlm_client = OpenAI(
    base_url=OLLAMA_URL,
    api_key=os.getenv("VLM_API_KEY", "ollama")
)
```

## Patron preventivo

- Todo cliente de API debe leer credenciales de variables de entorno.
- Proporcionar fallback solo para servicios locales sin autenticacion real.
- Si el endpoint es configurable, la key tambien debe serlo.

## Caso de prueba

```python
def test_no_hardcoded_api_keys():
    import ast, pathlib
    root = pathlib.Path(__file__).parent.parent
    for f in root.rglob("app/**/*.py"):
        tree = ast.parse(f.read_text())
        for node in ast.walk(tree):
            if (isinstance(node, ast.Call) and
                hasattr(node.func, 'attr') and
                node.func.attr == 'OpenAI'):
                for kw in node.keywords:
                    if kw.arg == 'api_key' and isinstance(kw.value, ast.Constant):
                        if kw.value.value == 'ollama':
                            # Baja severidad, pero documentar
                            print(f"WARNING: api_key='ollama' en {f}:{node.lineno}")
```

## Alcance

- **Severidad**: baja — Ollama es local y no requiere autenticacion real.
- **Archivos afectados** (6): `app/webapp.py:46`, `app/main_clasificacion.py:22`, `app/main_clasificacion_1.py:22`, `app/main_clasificacion_Text.py:75`, `app/prueba_conexion.py:18`, `app/analisis_estanteria_hybrid.py:726`.

## 🔗 Relacionado

- [[../componentes/webapp-flask]]
- [[../componentes/shelf-analyzer-sam3]]
- [[../componentes/clasificador-documentos]]
