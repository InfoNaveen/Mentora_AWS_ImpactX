# Mentora AI

AWS-First Multimodal AI for Teaching Quality Evaluation

## Quick Start

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Features

- **Video Upload**: Upload lecture videos for analysis
- **AI Transcription**: Automatic speech-to-text (stub)
- **Teaching Evaluation**: Deterministic scoring across 4 dimensions
- **Results Dashboard**: Visual score breakdown and recommendations
- **Demo Mode**: Quick access without AWS credentials

## API Endpoints

- `POST /upload/video` - Upload video file
- `POST /transcribe` - Transcribe video audio
- `POST /evaluate` - Evaluate teaching quality
- `POST /auth/demo-token` - Get demo authentication token
- `GET /auth/me` - Get current user
- `GET /health` - Health check
- `GET /aws-status` - AWS service status

## Architecture

- **Backend**: FastAPI with modular structure
- **Frontend**: Next.js with AWS Console-style UI
- **Services**: AWS-ready stubs (Bedrock, Transcribe, Rekognition, S3)
- **Auth**: JWT-based demo authentication

## Environment Variables

See `.env.example` files in backend and frontend directories.

