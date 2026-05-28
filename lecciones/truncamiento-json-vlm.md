---
tags:
  - leccion
  - prioridad/alta
fecha: 2026-04-15
severidad: alta
area: vlm
---

# Truncamiento de JSON en VLM (63%)

## Sintoma

El 63% de respuestas del VLM (qwen2.5vl:7b) se truncaban antes de completar el JSON, dejando objetos incompletos que no podian parsearse.

## Raiz del problema

Los VLM de 7B tienen una ventana de generacion limitada para listas largas. Al pedir todos los productos de una estanteria densa en una sola respuesta, el modelo se queda sin tokens y corta la generacion a mitad del JSON.

## Mitigacion

- **v4**: parser de cierre automatico de JSON + fallback regex para rescatar productos de respuestas truncadas.
- **v5 (definitiva)**: arquitectura SAM 3 + VLM — cada producto genera un JSON individual → 0% truncamiento.

## Patron preventivo

- No pedir listas largas a modelos con ventanas de generacion limitadas.
- Preferir arquitecturas "one item per call" cuando se requiere precision en cada elemento.
- Si se usa single-call, implementar parser robusto con cierre automatico de JSON y validacion de schema.

## Caso de prueba

```python
def test_json_not_truncated():
    """Verifica que el JSON generado sea parseable."""
    import json
    response = vlm_client.chat.completions.create(
        model="qwen2.5vl:7b",
        messages=[{"role": "user", "content": [...]}],
        max_tokens=2048
    )
    text = response.choices[0].message.content
    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        # Aplicar cierre automatico
        text = auto_close_json(text)
        data = json.loads(text)
    assert "products" in data
    assert all("name" in p and "price" in p for p in data["products"])
```

## Alcance

- **Severidad**: alta — impedia procesar el 63% de las imagenes en v4.
- **Resuelto en**: v5 (SAM 3 + VLM) con arquitectura de un JSON por producto.

## 🔗 Relacionado

- [[../experimentos/pipeline-v1-v4]]
- [[../componentes/shelf-analyzer-sam3]]
- [[sobre-conteo-vlm]]
