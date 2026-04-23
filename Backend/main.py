from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
import json
import time
import google.generativeai as genai
import hashlib
from typing import Dict
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# --- CONFIGURE GEMINI ---
# Set your Gemini API key via environment variable:  export GEMINI_API_KEY=your_key_here
# Get a free key at: https://aistudio.google.com
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
if not GEMINI_API_KEY:
    print("⚠️  WARNING: GEMINI_API_KEY environment variable not set.")
    print("   Set it with: export GEMINI_API_KEY=your_key_here")
    print("   Get a free key at: https://aistudio.google.com")

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("models/gemini-2.5-flash")

app = FastAPI()

# --- SIMPLE IN-MEMORY CACHE ---
request_cache: Dict[str, dict] = {}

def get_cache_key(image_bytes: bytes) -> str:
    return hashlib.md5(image_bytes).hexdigest()

# --- CORS MIDDLEWARE ---
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- SYMBOL → BRAHMI CHARACTER MAPPING ---
# Fixed: removed duplicate "し" key (kept pa mapping; moved ha to "ㄴ")
SYMBOL_TO_BRAHMI = {
    "Я": "𑀅",
    "H": "𑀅",
    "☐": "𑀩",
    "∧": "𑀢",
    "し": "𑀧",   # pa
    "ㄴ": "𑀳",   # ha
    "ㅣ": "𑀯",   # va
    "↨": "𑀯",
    "↓": "𑀯",
    "ε": "𑀚",
    "ـسا": "𑀖",
    "ـա": "𑀖",
    "⊙": "𑀣",
    "亅": "𑀬",
    "J": "𑀬",
    "+": "𑀓",
    "♉": "𑀫",
    "⊥": "𑀦",
    "t": "𑀱",
    "d": "𑀘",
    "ฦ": "𑀔",
    "ण": "𑀔",
    "ๅ": "𑀔",
    "{": "𑀭",
    "↑": "𑀰",
    "D": "𑀥",
    "U": "𑀧",
    "b": "𑀨",
    "□": "𑀩",
    "┴": "𑀦",
    "6": "𑀨",
    "人": "𑀢",
    "8": "𑀫",
    "K": "𑀅",
    "λ": "𑀢",
    "Y": "𑀢",
}

# --- BRAHMI CHARACTER → TRANSLITERATION MAPPING ---
BRAHMI_TO_TRANSLITERATION = {
    "𑀅": "a",
    "𑀩": "ba",
    "𑀕": "ga",
    "𑀥": "dha",
    "𑀳": "ha",
    "𑀯": "va",
    "𑀚": "ja",
    "𑀖": "gha",
    "𑀣": "tha",
    "𑀬": "ya",
    "𑀓": "ka",
    "𑀮": "la",
    "𑀫": "ma",
    "𑀦": "na",
    "𑀰": "sa",
    "𑀏": "e",
    "𑀧": "pa",
    "𑀘": "ca",
    "𑀔": "kha",
    "𑀭": "ra",
    "𑀱": "sa",
    "𑀢": "ta",
}


def call_gemini_with_retry(prompt, image_data=None, image_type=None, max_retries=3):
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is not configured. Set it as an environment variable.")
    for attempt in range(max_retries):
        try:
            if image_data:
                response = model.generate_content([
                    {"mime_type": image_type, "data": image_data},
                    prompt
                ])
            else:
                response = model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            error_str = str(e)
            print(f"❌ Attempt {attempt + 1} failed: {error_str}")
            if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                if attempt < max_retries - 1:
                    wait_time = (attempt + 1) * 5
                    print(f"⏳ Rate limited. Waiting {wait_time}s...")
                    time.sleep(wait_time)
                else:
                    raise HTTPException(status_code=429, detail=" Try again in a few minutes.")
            else:
                raise HTTPException(status_code=500, detail=f"Gemini API Error: {str(e)}")


def recognize_text(image_bytes, image_type):
    prompt = """
    YOU ARE A WORLD-CLASS OPTICAL CHARACTER RECOGNITION (OCR) EXPERT WITH 99.99% ACCURACY.
    Extract EVERY single visible character/symbol from this image with ABSOLUTE PRECISION.
    - ZERO OMISSIONS: Every visible character must be captured
    - NO INTERPRETATION: Do NOT guess what characters "should" be
    - PRESERVE SPACING: Maintain exact spacing between characters
    Return ONLY the extracted characters/symbols in exact order. Nothing else.
    """
    return call_gemini_with_retry(prompt, image_bytes, image_type)


def map_to_brahmi(recognized_text: str):
    mapped_brahmi = ""
    mapping_details = []
    unknown_chars = []

    for i, char in enumerate(recognized_text):
        brahmi_char = SYMBOL_TO_BRAHMI.get(char, "?")
        mapped_brahmi += brahmi_char
        if brahmi_char == "?":
            unknown_chars.append(f"Position {i+1}: '{char}' (Unicode: U+{ord(char):04X})")
        else:
            mapping_details.append(f"Char {i+1}: '{char}' → '{brahmi_char}'")

    explanation = "Letter-by-letter mapping:\n" + "\n".join(mapping_details)
    if unknown_chars:
        explanation += "\n\nUNKNOWN CHARACTERS:\n" + "\n".join(unknown_chars)

    return {
        "brahmi_characters": mapped_brahmi,
        "confidence": "high" if "?" not in mapped_brahmi else "low",
        "mapping_explanation": explanation,
    }


def transliterate_brahmi(brahmi_text):
    result = ""
    for char in brahmi_text:
        result += BRAHMI_TO_TRANSLITERATION.get(char, "?")
    return result


def translate_text(transliterated_text, brahmi_characters, recognized_text):
    prompt = f"""
    YOU ARE A WORLD-CLASS EXPERT IN ancient Brahmi script, Sanskrit, and Prakrit.

    GIVEN DATA:
    - Original recognized symbols: "{recognized_text}"
    - Mapped Brahmi characters: "{brahmi_characters}"
    - Transliterated (IAST) text: "{transliterated_text}"

    INSTRUCTIONS:
    1. Match EXACT IAST transliteration to Sanskrit/Prakrit dictionary
    2. Consider Brahmi script context (ancient inscriptions, not modern Hindi)
    3. For "ama": particle of assent meaning "yes/certainly"
    4. For "raja": king/ruler; "nara": man/person; "pata": leaf/cloth
    5. Use linguistic probability to fill gaps from unknown characters

    Return ONLY the English translation in 1-3 words maximum. No explanations.
    """
    return call_gemini_with_retry(prompt)


# --- HEALTH CHECK ENDPOINT ---
@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "model": "gemini-2.5-flash",
        "api_key_configured": bool(GEMINI_API_KEY),
    }


# --- MAIN ENDPOINT ---
@app.post("/process-image")
async def process_image_endpoint(image: UploadFile = File(...)):
    try:
        image_bytes = await image.read()
        cache_key = get_cache_key(image_bytes)

        if cache_key in request_cache:
            print(f"✅ Cache hit for {image.filename}")
            return request_cache[cache_key]

        print(f"\n🔄 Processing {image.filename}...")

        recognized = recognize_text(image_bytes, image.content_type)
        print(f"✅ Stage 1 - Recognized: '{recognized}'")

        brahmi_mapping = map_to_brahmi(recognized)
        brahmi_characters = brahmi_mapping.get("brahmi_characters", "")
        print(f"✅ Stage 2 - Brahmi: '{brahmi_characters}'")

        transliterated = transliterate_brahmi(brahmi_characters)
        print(f"✅ Stage 3 - Transliterated: '{transliterated}'")

        translated = translate_text(transliterated, brahmi_characters, recognized)
        print(f"✅ Stage 4 - Translated: '{translated}'")

        result = {
            "success": True,
            "filename": image.filename,
            "results": {
                "recognized": recognized,
                "brahmi_characters": brahmi_characters,
                "brahmi_confidence": brahmi_mapping.get("confidence", ""),
                "brahmi_explanation": brahmi_mapping.get("mapping_explanation", ""),
                "transliterated": transliterated,
                "translated": translated,
            },
        }

        request_cache[cache_key] = result
        return result

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
