# Mentora - Multimodal AI Teaching Quality Evaluation

A prototype system that evaluates teaching quality using video, audio, and syllabus alignment through AI analysis.

## Project Structure

```
mentora/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   ├── models/         # Data models
│   │   └── utils/          # Utilities
│   ├── uploads/            # Temporary file storage
│   ├── requirements.txt
│   └── main.py
├── frontend/               # Next.js frontend
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── services/
│   ├── package.json
│   └── next.config.js
└── README.md
```

## Setup Instructions

### Backend Setup
1. Navigate to backend directory: `cd backend`
2. Create virtual environment: `python -m venv venv`
3. Activate virtual environment:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Run server: `uvicorn main:app --reload --port 8000`

### Frontend Setup
1. Navigate to frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Run development server: `npm run dev`

## Environment Variables

### Backend (.env)
```
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=100000000
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## API Endpoints

- `POST /upload/video` - Upload lecture video
- `POST /transcribe` - Transcribe audio (placeholder)
- `POST /evaluate` - Evaluate teaching quality
- `GET /health` - Health check

## Features

- Video upload and storage
- Audio transcription (placeholder)
- Teaching quality evaluation with scoring
- Clean, responsive UI
- Modular, extensible architecture

## Deployment

### Backend (Render/Railway)
- Ensure `requirements.txt` is up to date
- Set environment variables in deployment platform
- Use `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Frontend (Vercel)
- Connect GitHub repository
- Set `NEXT_PUBLIC_API_URL` environment variable
- Deploy automatically on push

## Note
This is a hackathon prototype with placeholder AI logic. Real AI implementations will be added later.