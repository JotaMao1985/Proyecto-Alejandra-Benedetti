---
tags:
  - leccion
  - prioridad/media
fecha: 2026-04-10
severidad: media
area: vlm
---

# Sobre-conteo Sistematico en VLM

## Sintoma

El VLM (qwen2.5vl:7b) infla consistentemente el numero de productos en estanterias densas, reportando entre 2x y 85x mas productos que el ground truth.

## Raiz del problema

Los modelos de vision-lenguaje de 7-8B tienen un sesgo hacia la exhaustividad: prefieren "ver de mas" que "perder productos". En estanterias densas, confunden reflejos, etiquetas parciales y productos adyacentes como items distintos.

## Mitigacion

- Cap por producto a 8 unidades.
- Few-shot example mostrando el formato esperado.
- Indicar error comun explicitamente en el prompt: "ERROR COMUN: listar 50+ productos es INCORRECTO".
- Post-procesamiento dinamico (solo 4/65 imagenes lo necesitaron en v4).

## Patron preventivo

- Establecer limites superiores realistas basados en el dominio (una estanteria no tiene 200 productos visibles).
- Incluir ejemplos negativos en el prompt (casos tipicos de error).
- En v5, el sobre-conteo se mitiga con segmentacion previa (SAM 3), pero requiere NMS para eliminar mascaras superpuestas.

## Caso de prueba

```python
def test_product_count_reasonable():
    """Verifica que el conteo no exceda limites fisicos razonables."""
    MAX_PRODUCTS_PER_SHELF = 80
    result = analyze_shelf(image_path)
    assert len(result["products"]) <= MAX_PRODUCTS_PER_SHELF, (
        f"Sobre-conteo detectado: {len(result['products'])} productos"
    )
```

## Alcance

- **Severidad**: media — reducido de +2,894 (v1) a +610 (v4) y +119 (v5), pero aun presente.
- **Proxima mejora**: NMS pre-VLM en v5 para eliminar mascaras superpuestas.

## 🔗 Relacionado

- [[../experimentos/pipeline-v1-v4]]
- [[truncamiento-json-vlm]]
- [[../componentes/shelf-analyzer-sam3]]
