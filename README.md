
# 🚀 Mentora AI

**AWS-First, Agentic Multimodal System for Teaching Quality Evaluation**

Mentora is a **secure-by-design, AWS-aligned AI system** that objectively evaluates teaching quality from lecture videos.
Unlike black-box LLM tools, Mentora uses a **deterministic + agentic verification approach** to ensure **explainability, reliability, and zero hallucination risk**.

---

## 🎯 Problem Statement

Teaching quality today is evaluated:

* Manually
* Subjectively
* Inconsistently
* At very limited scale

As online education grows, **institutions lack a reliable, scalable, and explainable way to evaluate teaching quality**.

---

## 💡 Solution

Mentora analyzes lecture videos against a given syllabus and produces:

* Objective teaching quality scores
* Clear reasoning for each score
* Actionable improvement suggestions

All results are:

* **Explainable**
* **Reproducible**
* **Audit-ready**

---

## ⚡ Key Differentiators (Why Mentora)

* ✅ **Agentic Verification Mesh**
  Multiple specialized evaluators cross-validate outputs before results are shown.

* ✅ **Deterministic Evaluation (No Hallucinations)**
  No single LLM decides outcomes. AI augmentation is optional, never required.

* ✅ **AWS-First Architecture**
  Real cloud integration with Amazon S3; Bedrock-ready GenAI layer.

* ✅ **Working Backend, Real Persistence**
  Evaluations are computed, stored, and retrievable — not mocked.

* ✅ **Built for Trust-Sensitive Domains (Education)**
  Reliability > hype.

---

## 🧠 Evaluation Dimensions

Mentora evaluates teaching quality across four core dimensions:

| Dimension            | Description                             |
| -------------------- | --------------------------------------- |
| **Engagement**       | Interaction cues, emphasis, pacing      |
| **Concept Coverage** | Alignment with syllabus objectives      |
| **Clarity**          | Explanation structure and simplicity    |
| **Pedagogy**         | Use of examples, summaries, scaffolding |

Each score includes:

* Numeric score
* Human-readable reasoning
* Improvement suggestions

---

## 🏗️ System Architecture

```
Frontend (Next.js)
│
├── Upload Lecture Video
├── Enter Course Syllabus
├── View Evaluation Results
│
Backend (FastAPI)
│
├── Auth (Demo / JWT)
├── Video Upload API
├── Evaluation Engine
│
├── Agentic Verification Layer
│   ├── Input Guard Agent
│   ├── Coverage Agent
│   ├── Clarity Agent
│   ├── Pedagogy Agent
│   └── Verifier Agent
│
├── Database (Supabase / Postgres)
└── Cloud Storage (Amazon S3)
```

---

## ☁️ AWS Integration

Mentora uses AWS **where it matters most**:

| AWS Service            | Purpose                      | Status   |
| ---------------------- | ---------------------------- | -------- |
| **Amazon S3**          | Secure lecture video storage | ✅ Live   |
| **Amazon Bedrock**     | GenAI augmentation layer     | 🟡 Ready |
| **Amazon Transcribe**  | Speech-to-text               | 🟡 Stub  |
| **Amazon Rekognition** | Visual analysis              | 🟡 Stub  |

> The architecture is designed so AWS services can be enabled without refactoring core logic.

---

## 🔐 Security & AI Safety

* All user input treated as **untrusted**
* No raw input concatenated into prompts
* Deterministic fallback always available
* Agentic cross-validation prevents hallucinations
* Clear trust boundaries enforced

---

## 🧪 Demo Capabilities

* Upload any lecture video
* Paste syllabus content
* Run teaching evaluation
* View explainable results instantly
* Refresh and retrieve stored evaluations

---

## 🚀 Quick Start (Local Development)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🔌 API Endpoints

| Method | Endpoint           | Description                |
| ------ | ------------------ | -------------------------- |
| POST   | `/auth/demo-token` | Demo authentication        |
| GET    | `/auth/me`         | Current user               |
| POST   | `/upload/video`    | Upload lecture video       |
| POST   | `/evaluate`        | Evaluate teaching quality  |
| GET    | `/evaluations`     | Fetch previous evaluations |
| GET    | `/health`          | System health              |
| GET    | `/aws-status`      | AWS integration status     |

---

## 🔧 Environment Variables

Sample environment files are provided:

* `backend/.env.example`
* `frontend/.env.example`

### Backend (Required)

```env
SUPABASE_URL=
SUPABASE_ANON_KEY=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=ap-south-1
AWS_S3_BUCKET_NAME=
```

### Frontend

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

---

## 🎓 Use Cases

* Universities & Colleges
* EdTech platforms
* Accreditation bodies
* Faculty performance review
* Large-scale online course quality control

---

## 📌 Why This Matters

Mentora is not “AI for the sake of AI”.
It is **infrastructure for trust in education**.

> *“We’re not grading videos — we’re standardizing teaching quality.”*

---

## 🏁 Status

* ✅ Working backend
* ✅ Real AWS integration
* ✅ Real database persistence
* ✅ Demo-ready
* 🟡 Advanced AI layers modular and extensible

---

## 📄 License

MIT License

