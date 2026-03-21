from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="API de Registro de Experimentos")

# 1. Modelo de Datos (Esquema del Experimento)
class Experimento(BaseModel):
    id: int
    nombre: str
    resultado_metric: float
    notas: str

# Base de datos simulada
db = {}

# --- CREATE (POST): Registrar nuevo experimento ---
@app.post("/experimentos")
def crear_experimento(exp: Experimento):
    if exp.id in db:
        raise HTTPException(status_code=400, detail="ID ya existe")
    db[exp.id] = exp
    return {"mensaje": "Registrado", "data": exp}

# --- READ (GET): Consultar experimento por ID ---
@app.get("/experimentos/{exp_id}")
def obtener_experimento(exp_id: int):
    if exp_id not in db:
        raise HTTPException(status_code=404, detail="Experimento no encontrado")
    return db[exp_id]

# --- UPDATE (PUT): Corregir datos de un experimento ---
@app.put("/experimentos/{exp_id}")
def actualizar_experimento(exp_id: int, exp_actualizado: Experimento):
    if exp_id not in db:
        raise HTTPException(status_code=404, detail="Experimento no encontrado")
    db[exp_id] = exp_actualizado
    return {"mensaje": "Actualizado", "data": exp_actualizado}

# --- DELETE (DELETE): Eliminar registro ---
@app.delete("/experimentos/{exp_id}")
def eliminar_experimento(exp_id: int):
    if exp_id not in db:
        raise HTTPException(status_code=404, detail="Experimento no encontrado")
    del db[exp_id]
    return {"mensaje": f"Experimento {exp_id} eliminado"}