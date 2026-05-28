---
tags:
  - leccion
  - prioridad/media
fecha: 2026-05-15
severidad: media
area: sam3
---

# SAM 3 Requiere Parches para CPU y MPS

## Sintoma

Meta SAM 3 tiene hardcodes de `device="cuda"`, `pin_memory()` y dependencia de Triton (NVIDIA-only), impidiendo su ejecucion en CPU Docker o Apple Silicon MPS sin modificaciones.

## Raiz del problema

SAM 3 fue disenado y probado exclusivamente en GPUs NVIDIA con CUDA. Meta no incluyo fallbacks para CPU ni soporte para MPS (Apple Silicon).

## Mitigacion

Tres tipos de parches aplicados (documentados en `Dockerfile.sam`):

1. **Device hardcodes**: reemplazar `device="cuda"` por `device=args.sam_device` con soporte para "cpu", "mps", "cuda".
2. **pin_memory()**: deshabilitar en CPU/MPS (no soportado).
3. **Triton stubs**: mockear imports de Triton (NVIDIA-only) con stubs vacios.

```python
# Patch aplicado en Dockerfile.sam
RUN sed -i 's/device="cuda"/device=kwargs.get("device", "cpu")/g' \
    /usr/local/lib/python3.12/site-packages/sam3/model_builder.py
```

Para MPS nativo en Apple Silicon:
```bash
export PYTORCH_ENABLE_MPS_FALLBACK=1
python app/analisis_estanteria_hybrid.py --sam-device mps
```

## Patron preventivo

- Verificar `torch.cuda.is_available()` antes de asumir CUDA.
- Usar `device = torch.device("cuda" if torch.cuda.is_available() else "cpu")`.
- Documentar plataformas soportadas explicitamente.

## Caso de prueba

```python
def test_sam3_runs_on_cpu():
    """Verifica que SAM 3 pueda cargarse y ejecutar una inferencia basica en CPU."""
    import torch
    from app.core import load_sam3_model, generate_sam3_masks
    model = load_sam3_model(device="cpu")
    assert model is not None
    img = Image.new("RGB", (640, 480), color="white")
    masks = generate_sam3_masks(model, img, text_prompt="product", device="cpu")
    assert isinstance(masks, list)
```

## Alcance

- **Severidad**: media — requiere parches que pueden romperse con nuevas versiones de SAM 3.
- **Plataformas afectadas**: CPU Docker, Apple Silicon MPS.
- **Funciona sin parches en**: GPU NVIDIA con CUDA.

## 🔗 Relacionado

- [[../componentes/shelf-analyzer-sam3]]
- [[../experimentos/pipeline-v5-sam3]]
- [[truncamiento-json-vlm]]
