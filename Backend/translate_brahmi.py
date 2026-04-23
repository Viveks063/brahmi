from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
import google.generativeai as genai

# --- CONFIGURE GEMINI ---
genai.configure(api_key="AIzaSyC_htQJTtU_f_nROSOAFOYICoLPaG7gDkk")
model = genai.GenerativeModel("models/gemini-2.5-flash-image")
app = FastAPI()

# --- CORS MIDDLEWARE ---
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",     # 👈 added
    "http://127.0.0.1:5174"      # 👈 added
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/process-image")
async def process_image_endpoint(image: UploadFile = File(...)):
    image_bytes = await image.read()

    prompt = """
    Look carefully at this image and reproduce the exact visible text or symbols
    as plain text. Do NOT interpret, translate, or describe — only copy the visible
    characters exactly as they appear.
    """

    response = model.generate_content([
        {"mime_type": image.content_type, "data": image_bytes},
        prompt
    ])

    try:
        text_output = response.text.strip()
    except Exception:
        text_output = ""

    # ✅ Return JSON in consistent format
    return {
        "success": True,
        "filename": image.filename,
        "results": {
            "recognized": text_output,
            "transliterated": "",
            "translated": ""
        }
    }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
