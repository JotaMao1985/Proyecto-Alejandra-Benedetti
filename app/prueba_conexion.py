import os
import sys
from openai import OpenAI

# Verificamos que la variable de entorno exista (definida en docker-compose.yml)
ollama_url = os.getenv('OLLAMA_HOST')

if not ollama_url:
    print("Error: La variable OLLAMA_HOST no está definida.")
    sys.exit(1)

print(f"Configurando cliente apuntando a: {ollama_url}")

# Configuramos el cliente usando la librería estándar de OpenAI
# pero apuntando a al servidor local Ollama
client = OpenAI(
    base_url=ollama_url,
    api_key='ollama', # Requerido por la librería, pero ignorado por Ollama
)

try:
    print("Enviando solicitud al modelo Qwen...")
    
    response = client.chat.completions.create(
        model="qwen2.5:7b", 
        messages=[
            {"role": "system", "content": "Eres un sistema de prueba."},
            {"role": "user", "content": "Si puedes leerme, responde solo con la frase: 'CONEXIÓN EXITOSA DOCKER-MAC'"}
        ]
    )
    
    print("\n--- RESPUESTA DEL MODELO ---")
    print(response.choices[0].message.content)
    print("----------------------------\n")
    
except Exception as e:
    print(f"\nFATAL: No se pudo conectar. Error:\n{e}")