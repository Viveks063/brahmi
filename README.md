# Brahmi Script Decoder

An AI-powered web app to decode ancient Brahmi script from images using Google Gemini.

## Project Structure

```
brahmi-merged/
├── Backend/          ← FastAPI Python backend
│   ├── main.py       ← Main server (single source of truth)
│   ├── requirements.txt
│   └── .env.example  ← Copy to .env and add your API key
├── src/              ← React + TypeScript frontend
├── public/
├── package.json
└── .env.example      ← Copy to .env.local for production URL config
```

## Setup

### 1. Backend

```bash
cd Backend

# Install dependencies
pip install -r requirements.txt

# Set your Gemini API key (get one free at https://aistudio.google.com)
export GEMINI_API_KEY=your_key_here

# Start the server
python main.py
# Server runs at http://localhost:8000
```

### 2. Frontend

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
# App runs at http://localhost:5173
```

### 3. Production Deployment

**Backend** → Deploy to Railway, Render, or Fly.io. Set `GEMINI_API_KEY` as an environment variable in your hosting dashboard.

**Frontend** → Deploy to Vercel. Set `VITE_BACKEND_URL` in Vercel environment variables pointing to your deployed backend URL.

## How It Works

1. **OCR** — Gemini 2.5 Flash reads characters from the uploaded image
2. **Mapping** — Recognized symbols are mapped to Brahmi Unicode characters
3. **Transliteration** — Brahmi characters are converted to IAST romanization
4. **Translation** — Gemini translates the IAST text to English

## Image Enhancement

The app's Brightness, Contrast, Sharpen, and Mode filters are applied to the image **before** sending it to the AI — not just for visual preview. Use these to improve OCR accuracy on faded or low-contrast inscriptions.
