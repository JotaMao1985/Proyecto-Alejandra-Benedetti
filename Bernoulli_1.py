from fastapi import FastAPI
import numpy as np

app = FastAPI()

@app.get("/bernoulli")
def experimento_bernoulli():
    """
    Simula un ensayo de Bernoulli con p=0.7.
    """
    p = 0.7
    resultado = np.random.binomial(n=1, p=p)
    interpretacion = "Éxito" if resultado == 1 else "Fracaso"
    
    return {
        "experimento": "Ensayo Bernoulli",
        "parametro_p": p,
        "observacion_cruda": int(resultado), 
        "interpretacion": interpretacion
    }