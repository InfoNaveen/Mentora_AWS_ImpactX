# Mentora - AWS-First Multimodal AI for Teaching Quality Evaluation

Mentora is a **secure-by-design GenAI orchestration platform** that evaluates teaching quality through multimodal analysis of lecture videos. Built with AWS-native architecture patterns, it demonstrates explainable AI decisions with full audit trails.

---

## Quick Start (< 5 Minutes)

### Option 1: Use Demo Mode (Recommended)
1. Open http://localhost:3001
2. Click **"Quick Demo Access"** button
3. Upload any video file (or use a sample)
4. Enter a sample syllabus (e.g., "Machine learning, neural networks, deep learning")
5. Click through the evaluation pipeline
6. View your Teaching Quality Report!

### Demo Credentials
- **Email:** demo@mentora.ai
- **Password:** demo123

### API Docs
- **Swagger UI:** http://localhost:8001/docs
- **ReDoc:** http://localhost:8001/redoc

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                        │
│              GA4 Analytics + Professional UI                 │
└─────────────────────────────┬───────────────────────────────┘
                                │
┌─────────────────────────────▼───────────────────────────────┐
│                    FastAPI Backend                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │    Auth     │  │   Upload    │  │    Evaluation       │  │
│  │  (Cognito)  │  │    (S3)     │  │    (Bedrock)        │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Transcribe  │  │ Rekognition │  │    Health Check     │  │
│  │   (ASR)     │  │   (Vision)  │  │    & Monitoring     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## AWS Services Integration

| Service | Purpose | Status |
|---------|---------|--------|
| **Amazon Bedrock** | GenAI evaluation with Claude 3 Sonnet | Stub Ready |
| **Amazon Transcribe** | Speech-to-text transcription | Stub Ready |
| **Amazon Rekognition** | Visual engagement analysis | Stub Ready |
| **Amazon S3** | Video storage | Stub Ready |
| **Amazon Cognito** | Authentication | Planned (Supabase temporary) |
| **CloudWatch** | Logging & monitoring | Commented |

---

## Security & AI Orchestration

### Trust Boundaries

```
┌─────────────────────────────────────────────────────────────┐
│  TRUST BOUNDARY 1: User Input                               │
│  - All user input is UNTRUSTED                              │
│  - Sanitization required before any processing              │
│  - File uploads validated and scanned                       │
└─────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────┐
│  TRUST BOUNDARY 2: Service Layer                            │
│  - Input sanitization enforced                              │
│  - Rate limiting applied                                    │
│  - Audit logging enabled                                    │
└─────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────┐
│  TRUST BOUNDARY 3: AI/LLM Layer                             │
│  - Prompt injection prevention                              │
│  - Output validation and filtering                          │
│  - Human-in-the-loop checkpoints                            │
└─────────────────────────────────────────────────────────────┘
```

### Prompt Injection Prevention
- User input is **NEVER** directly concatenated to prompts
- All user content wrapped in explicit delimiters
- System prompts are immutable and prepended
- Output is validated before returning to user

### Hallucination Mitigation
- Deterministic rubric-based evaluation
- Scores are bounded and validated
- Reasoning is auditable and explainable
- Human-in-the-loop for critical decisions

---

## RBAC (Role-Based Access Control)

| Role | Permissions |
|------|-------------|
| **Admin** | Full access: evaluations, users, institutions, reports |
| **Evaluator** | Create/read evaluations, basic reports |
| **Institution** | Read reports for their institution |
| **Demo** | Limited: create/read evaluations only |

---

## Evaluation Rubric

The teaching quality evaluation uses a **deterministic, explainable rubric**:

| Criterion | Weight | Description |
|-----------|--------|-------------|
| **Engagement** | 25% | Student interaction, questions, interactive language |
| **Concept Coverage** | 30% | Syllabus alignment, topic depth, sequencing |
| **Clarity** | 25% | Language simplicity, sentence structure, definitions |
| **Pedagogy** | 20% | Examples, scaffolding, summarization, understanding checks |

Each score includes:
- Numerical score (1-10)
- Reasoning explanation
- Specific improvement suggestion

---

## API Endpoints

### Authentication
```
POST /auth/login          - Login with email/password
POST /auth/register       - Register new account
POST /auth/demo-token     - Get demo token
GET  /auth/me             - Get current user profile
```

### Evaluation Pipeline
```
POST /upload/video        - Upload lecture video
POST /transcribe          - Transcribe video to text
POST /evaluate            - Run teaching quality evaluation
GET  /health              - Health check
GET  /aws-status          - AWS integration status
```

---

## Project Structure

```
mentora/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py        # Centralized config
│   │   │   └── security.py      # JWT + RBAC
│   │   ├── routes/
│   │   │   ├── auth.py          # Authentication
│   │   │   ├── upload.py        # Video upload
│   │   │   ├── transcribe.py    # Transcription
│   │   │   ├── evaluate.py      # Evaluation
│   │   │   └── health.py        # Health checks
│   │   ├── services/
│   │   │   ├── bedrock_service.py      # AWS Bedrock (GenAI)
│   │   │   ├── transcribe_service.py   # AWS Transcribe
│   │   │   ├── rekognition_service.py  # AWS Rekognition
│   │   │   ├── storage_service.py      # AWS S3
│   │   │   └── evaluation_service.py   # Core evaluation
│   │   └── models/
│   ├── main.py
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   └── index.tsx        # Main app
│   │   ├── lib/
│   │   │   └── analytics.ts     # GA4 integration
│   │   └── services/
│   │       └── api.ts           # API client
│   └── .env.local
└── README.md
```

---

## What's Implemented vs Stubbed

### Implemented
- Full evaluation pipeline (upload → transcribe → evaluate → report)
- JWT authentication with RBAC
- Deterministic evaluation with explainable scores
- GA4 analytics tracking
- Professional dark-mode UI
- API documentation (Swagger/ReDoc)
- Audit logging structure

### Stubbed (AWS Ready)
- Amazon Bedrock LLM calls (using deterministic heuristics)
- Amazon Transcribe (using sample transcripts)
- Amazon Rekognition (placeholder metrics)
- Amazon S3 (local file storage fallback)

### Planned
- Amazon Cognito migration
- AWS CloudWatch metrics
- PDF/CSV report export
- AWS SES email notifications

---

## Environment Variables

### Backend (.env)
```env
SUPABASE_URL=https://placeholder.supabase.co
SUPABASE_ANON_KEY=supabase-public-anon-placeholder
AWS_ACCESS_KEY_ID=aws-access-placeholder
AWS_SECRET_ACCESS_KEY=aws-secret-placeholder
AWS_REGION=ap-south-1
AWS_S3_BUCKET_NAME=mentora-dev-bucket
AWS_BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8001
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

## Running the Project

### Development
```bash
# Frontend (Next.js)
cd frontend && npm install && npm run dev

# Backend (FastAPI)
cd backend && pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

### Production Deployment
- **Frontend:** Vercel
- **Backend:** AWS EC2 / Lambda + API Gateway
- **Database:** Supabase → Amazon RDS migration path

---

## Summary

This project demonstrates:

1. **AWS-Native GenAI Architecture**
   - Bedrock, Transcribe, Rekognition, S3 integrations
   - All services have clear implementation paths

2. **Secure AI Orchestration**
   - Trust boundaries documented
   - Prompt injection prevention
   - Audit trails for compliance

3. **Explainable AI Decisions**
   - Every score has reasoning
   - Deterministic evaluation rubric
   - Reproducible results

4. **Production Readiness**
   - RBAC authentication
   - Error handling
   - API documentation
   - Analytics integration

---

## License

MIT License

