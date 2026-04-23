from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import json
import time
import google.generativeai as genai
import hashlib
from typing import Dict

# --- CONFIGURE GEMINI ---
genai.configure(api_key="AIzaSyAiSq_T11gTF2wrCstmEPCKh_VOBX0EYd8")
model = genai.GenerativeModel("models/gemini-2.5-flash")

app = FastAPI()

# --- SIMPLE IN-MEMORY CACHE ---
request_cache: Dict[str, dict] = {}

def get_cache_key(image_bytes: bytes) -> str:
    """Generate cache key from image hash"""
    return hashlib.md5(image_bytes).hexdigest()

# --- CORS MIDDLEWARE ---
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- SYMBOL → BRAHMI CHARACTER MAPPING ---
SYMBOL_TO_BRAHMI = {
    "Я": "𑀅",
    "H": "𑀅",    # a
    "☐": "𑀩",   # ba
    "∧": "𑀢",   # ta
    "し": "𑀳",   # ha
    "ㅣ": "𑀯",   # va
    "↨": "𑀯",   # va
    "↓": "𑀯",   # va
    "ε": "𑀚",   # ja
    "ـسا": "𑀖", # gha
    "ـա": "𑀖",  # gha
    "⊙": "𑀣",   # tha
    "亅": "𑀬",   # ya
    "J": "𑀬",    # ya
    "+": "𑀓",    # ka
    "♉": "𑀫",    # ma
    "⊥": "𑀦",    # na
    "t": "𑀱",    # ṣa
    "し": "𑀧",   # pa
    "d": "𑀘",    # ca
    "ฦ": "𑀔",    # kha
    "ण": "𑀔",    # kha
    "ๅ": "𑀔",    # kha
    "{": "𑀭",    # ra
    "↑": "𑀰",    # śa
    "D": "𑀥",    # dha
    "U": "𑀧",    # pa
    "b": "𑀨",    # pha
    "□": "𑀩",    # ba
    "┴": "𑀦",    # na
    "6": "𑀨",    # pha
    "人": "𑀢",
    "ㄴ":"𑀳",
    "8": "𑀫",
    "K": "𑀅",
    "λ": "𑀢",
    "Y": "𑀢"
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
    "𑀰": "ṣa",
    "𑀏": "e",
    "𑀧": "pa",
    "𑀘": "ca",
    "𑀔": "kha",
    "𑀭": "ra",
    "𑀱": "śa",
    "𑀢": "ta"
}

# --- HELPER: API CALL WITH RETRY ---
def call_gemini_with_retry(prompt, image_data=None, image_type=None, max_retries=3):
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
                    print(f"⏳ Rate limited. Waiting {wait_time}s... (Attempt {attempt + 1}/{max_retries})")
                    time.sleep(wait_time)
                else:
                    raise HTTPException(status_code=429, detail="API rate limit exceeded. Try again in a few minutes.")
            else:
                raise HTTPException(status_code=500, detail=f"Gemini API Error: {str(e)}")


# --- STAGE 1: OCR - RECOGNIZE TEXT FROM IMAGE ---
def recognize_text(image_bytes, image_type):
    prompt = """
    YOU ARE A WORLD-CLASS OPTICAL CHARACTER RECOGNITION (OCR) EXPERT WITH 99.99% ACCURACY.

    CRITICAL MISSION: Extract EVERY single visible character/symbol from this image with ABSOLUTE PRECISION.

    ========== MANDATORY OCR PROCEDURE ==========

    1. PIXEL-LEVEL ANALYSIS - Examine every pixel, stroke, dot, and curve
    2. CHARACTER ISOLATION - Identify each distinct character/symbol separately
    3. SEQUENTIAL ORDERING - Preserve exact left-to-right, top-to-bottom sequence
    4. SHAPE DOCUMENTATION - Record the EXACT shape of each character (even if ambiguous)
    5. SPECIAL CHARACTERS - Include ALL symbols, marks, diacritics, punctuation
    6. NO INTERPRETATION - Do NOT guess or interpret what characters "should" be
    7. 100% FIDELITY - Match what you see with absolute visual accuracy

    ========== QUALITY REQUIREMENTS ==========

    - ZERO OMISSIONS: Every visible character must be captured
    - EXACT REPRODUCTION: Output must be visually identical to input
    - NO ASSUMPTIONS: If uncertain about a character, describe its visual properties exactly as seen
    - PRESERVE SPACING: Maintain exact spacing between characters
    - SYMBOL ACCURACY: Capture special symbols and diacritical marks precisely

    ========== OUTPUT FORMAT ==========

    Return ONLY the extracted characters/symbols in exact order. Nothing else.
    - No explanations
    - No bracketed descriptions
    - No interpretation
    - Just the pure, raw characters exactly as they appear in the image

    Remember: Your output will be matched pixel-by-pixel against the image. Accuracy is CRITICAL.
    """
    return call_gemini_with_retry(prompt, image_bytes, image_type)


# --- STAGE 2: MAP TO BRAHMI CHARACTERS (LETTER BY LETTER) ---
def map_to_brahmi(recognized_text: str):
    """Map each symbol/character to Brahmi, letter by letter"""
    mapped_brahmi = ""
    mapping_details = []
    unknown_chars = []
    
    for i, char in enumerate(recognized_text):
        brahmi_char = SYMBOL_TO_BRAHMI.get(char, "?")
        mapped_brahmi += brahmi_char
        
        if brahmi_char == "?":
            unknown_chars.append(f"Position {i+1}: '{char}' (Unicode: U+{ord(char):04X})")
            print(f"  ❌ UNKNOWN: Position {i+1} - '{char}' (Unicode: U+{ord(char):04X}) - NOT IN DICTIONARY!")
        else:
            mapping_details.append(f"Char {i+1}: '{char}' → '{brahmi_char}'")
            print(f"  ✅ Char {i+1}: '{char}' → '{brahmi_char}'")
    
    if unknown_chars:
        print(f"\n⚠️  UNKNOWN CHARACTERS FOUND:")
        for unk in unknown_chars:
            print(f"   {unk}")
    
    explanation = "Letter-by-letter mapping:\n" + "\n".join(mapping_details)
    if unknown_chars:
        explanation += "\n\nUNKNOWN CHARACTERS:\n" + "\n".join(unknown_chars)
    
    return {
        "brahmi_characters": mapped_brahmi,
        "confidence": "high" if "?" not in mapped_brahmi else "low",
        "mapping_explanation": explanation
    }


# --- STAGE 3: TRANSLITERATE BRAHMI (LETTER BY LETTER) ---
def transliterate_brahmi(brahmi_text):
    """Transliterate each Brahmi character to IAST, letter by letter"""
    result = ""
    transliteration_details = []
    
    for i, char in enumerate(brahmi_text):
        iast_char = BRAHMI_TO_TRANSLITERATION.get(char, "?")
        result += iast_char
        transliteration_details.append(f"Brahmi '{char}' → IAST '{iast_char}'")
        print(f"  🔄 {transliteration_details[-1]}")
    
    return result


# --- STAGE 4: TRANSLATE ---
def translate_text(transliterated_text, brahmi_characters, recognized_text):
    """Use strong AI to translate even with incomplete/uncertain transliteration"""
    
    prompt = f"""
    YOU ARE A WORLD-CLASS EXPERT IN:
    - Ancient Brahmi script paleography and linguistics
    - Sanskrit, Prakrit, and ancient Indian languages
    - Historical character recognition and transliteration
    - Contextual inference and linguistic pattern analysis
    - 10,000+ hours of ancient text translation experience

    ========== CRITICAL TRANSLATION TASK ==========

    GIVEN DATA:
    - Original recognized symbols from image: "{recognized_text}"
    - Mapped Brahmi characters: "{brahmi_characters}"
    - Transliterated (IAST) text: "{transliterated_text}"

    ========== MANDATORY ANALYSIS PROCEDURE ==========

    1. PHONETIC ANALYSIS - Break down each syllable and sound pattern
    2. LINGUISTIC DECOMPOSITION - Identify root words, prefixes, suffixes
    3. HISTORICAL CONTEXT - Consider common Brahmi words and phrases from inscriptions
    4. PATTERN MATCHING - Compare against known Sanskrit/Prakrit vocabulary
    5. SEMANTIC INFERENCE - Determine most likely meaning based on character patterns
    6. VOWEL RECONSTRUCTION - Infer missing or unclear vowel marks (matras)
    7. CONSONANT CLUSTERING - Analyze conjunct consonant combinations
    8. CONTEXTUAL GUESSING - Use linguistic probability to fill gaps
    9. VERIFICATION - Cross-check against known ancient Indian texts

    ========== RECONSTRUCTION LOGIC ==========

    Even if the transliteration has "?" or gaps:
    - Use character frequency analysis from Brahmi inscriptions
    - Consider common Brahmi word patterns
    - Apply Sanskrit/Prakrit phonetic rules
    - Infer from surrounding characters
    - Make educated guesses based on historical context

    ========== INSTRUCTIONS ==========
    1. Match EXACT IAST transliteration to Sanskrit/Prakrit dictionary
    2. Prioritize particle/word meanings from ancient inscriptions
    3. Consider Brahmi script context (not Hindi/Modern Sanskrit)
    4. For "ama" specifically: It is a particle of assent meaning "yes/certainly" (not mango/illness)
    5. Return the PRIMARY meaning in ancient texts
    
    ========== REFERENCE MEANINGS ==========
    - "ama" (अम) = Yes, Certainly, Indeed (particle of assent in Brahmi/Sanskrit)
    - "raja" (राज) = King, Prince, Ruler
    - "nara" (नर) = Man, Human, Person
    - "pata" (पत) = Leaf, Page, Cloth

    ========== OUTPUT REQUIREMENTS ==========

    Return ONLY:
   Return ONLY the English translation in 1-3 words maximum.
    Be authoritative and accurate. No explanations.
    Remember: You have vast knowledge of ancient languages. Use it to make intelligent inferences.
    """
    
    translation = call_gemini_with_retry(prompt)
    print(f"  🧠 AI-powered translation: {translation}")
    return translation


# --- MAIN ENDPOINT ---
@app.post("/process-image")
async def process_image_endpoint(image: UploadFile = File(...)):
    try:
        image_bytes = await image.read()
        cache_key = get_cache_key(image_bytes)
        
        # CHECK CACHE FIRST
        if cache_key in request_cache:
            print(f"✅ Cache hit! Using cached result for {image.filename}")
            return request_cache[cache_key]
        
        print(f"\n🔄 Cache miss. Processing {image.filename}...")
        
        # Stage 1: Recognize text from image
        print("\n📷 Stage 1: Recognizing text letter by letter...")
        recognized = recognize_text(image_bytes, image.content_type)
        print(f"✅ Stage 1 - Recognized: '{recognized}' (length: {len(recognized)})")
        
        # Stage 2: Map to Brahmi characters
        print("\n🔤 Stage 2: Mapping to Brahmi (letter by letter)...")
        brahmi_mapping = map_to_brahmi(recognized)
        brahmi_characters = brahmi_mapping.get("brahmi_characters", "")
        print(f"✅ Stage 2 - Brahmi Characters: '{brahmi_characters}' (length: {len(brahmi_characters)})")
        
        # Stage 3: Transliterate
        print("\n🔄 Stage 3: Transliterating (letter by letter)...")
        transliterated = transliterate_brahmi(brahmi_characters)
        print(f"✅ Stage 3 - Transliterated: '{transliterated}'")
        
        # Stage 4: Translate
        print("\n🌍 Stage 4: Translating with AI intelligence...")
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
                "translated": translated
            }
        }
        
        # CACHE THE RESULT
        request_cache[cache_key] = result
        print(f"\n💾 Result cached for future use\n")
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ FATAL ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)