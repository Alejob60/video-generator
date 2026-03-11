# Test FLUX 2 Pro - Python oficial de Microsoft Foundry
import os
import requests
import base64
from PIL import Image
from io import BytesIO
import time

# Variables de entorno
endpoint = "https://labsc-m9j5kbl9-eastus2.cognitiveservices.azure.com"
deployment = "FLUX.2-pro"
api_version = "preview"
subscription_key = "7PAsgxvIw4v494OveKjy4izsjqpXUp6gCCJOMBZkeT0AYA4zKNpSJQQJ99BDACHYHv6XJ3w3AAAAACOGQKWS"

def decode_and_save_image(b64_data, output_filename):
    """Decodifica base64 y guarda la imagen"""
    image = Image.open(BytesIO(base64.b64decode(b64_data)))
    image.save(output_filename)
    print(f"✅ Imagen guardada en: '{output_filename}'")
    return output_filename

def save_response(response_data, filename_prefix):
    """Extrae y guarda la imagen del response"""
    data = response_data['data']
    b64_img = data[0]['b64_json']
    timestamp = int(time.time())
    filename = f"{filename_prefix}-{timestamp}.png"
    return decode_and_save_image(b64_img, filename)

# Construir URL correcta (Foundry endpoint)
base_path = f'providers/blackforestlabs/v1/{deployment}'
params = f'?api-version={api_version}'
generation_url = f"{endpoint}/{base_path}{params}"

print(f"📡 Endpoint: {generation_url}")

# Payload correcto
generation_body = {
    "prompt": "robot futurista en un ciudad cberpunk",
    "n": 1,
    "size": "1024x1024",
    "output_format": "png"
}

print(f"📝 Payload: {generation_body}")
print(f"\n🔄 Generando imagen...")

start_time = time.time()

# Hacer petición
generation_response = requests.post(
    generation_url,
    headers={
        'Api-Key': subscription_key,
        'Content-Type': 'application/json',
    },
    json=generation_body
)

elapsed_time = time.time() - start_time
print(f"⏱️ Tiempo de generación: {elapsed_time:.2f} segundos")

print(f"\n📥 Status Code: {generation_response.status_code}")

if generation_response.status_code == 200:
    response_json = generation_response.json()
    print(f"✅ SUCCESS!")
    print(f"Keys: {', '.join(response_json.keys())}")
    
    # Guardar imagen
    saved_file = save_response(response_json, "misy-image")
    print(f"📏 Tamaño: {os.path.getsize(saved_file) / 1024:.2f} KB")
else:
    print(f"❌ ERROR: {generation_response.status_code}")
    print(f"Response: {generation_response.text}")
