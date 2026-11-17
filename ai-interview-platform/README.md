# AI Interview Platform

Generates role-specific interview questions from your resume and a job description, then runs an interactive mock interview with real-time answer scoring and tailored follow-up questions.

**Interview modes:** Data Engineer, Backend Engineer, Full-Stack Engineer and Software Engineer, each with Easy, Medium or Hard difficulty. The job description is optional; without one, questions follow the mode's focus areas.

**Stack:** React · Node.js · Express · PostgreSQL · pgvector · Kafka · Docker · OpenRouter

## How it works

```
Upload resume (PDF) ──► text extracted, stored in Postgres
        │
Start interview (job title + job description)
        ├─► LLM generates role-specific questions from resume + JD
        └─► resume + JD split into chunks, embedded, stored in pgvector
        │
Answer a question
        ├─► answer saved, "interview.answer.submitted" event published to Kafka
        │        └─► scoring worker (Kafka consumer) retrieves relevant chunks
        │            from pgvector, scores the answer 1–10 with feedback,
        │            and writes the result back — the interview never waits on it
        └─► relevant chunks retrieved from pgvector (RAG) to ground a tailored
            follow-up question, then the interview moves on
```

The interview page polls for scores, so each evaluation appears a few seconds after you answer.

## Project layout

```
backend/
  src/
    controllers/      HTTP handlers (auth, resumes, interviews)
    services/
      interviewAI.js  question generation, follow-ups, answer scoring
      ragService.js   chunking, pgvector indexing and similarity search
      llmService.js   OpenRouter chat API
      embeddingService.js  OpenRouter embeddings API
    config/kafka.js   Kafka producer, topics
    workers/scoringWorker.js  Kafka consumer that scores answers
  prisma/             schema and migrations
frontend/
  src/pages/          Login, Register, Dashboard, Interview
docker-compose.yml    Postgres + pgvector, Kafka (and the full app with --profile app)
```

## Running locally

Requirements: Node.js 22+, Docker, and an [OpenRouter API key](https://openrouter.ai/keys).

**1. Start Postgres (with pgvector) and Kafka**

```bash
docker compose up -d
```

Postgres is exposed on port **5433** so it won't clash with a locally installed Postgres. Kafka is on **9092**.

**2. Configure and start the backend**

```bash
cd backend
cp .env.example .env        # then set JWT_SECRET and OPENROUTER_API_KEY
npm install
npx prisma migrate deploy
npm run dev                 # API on http://localhost:3001
```

**3. Start the scoring worker** (in a second terminal)

```bash
cd backend
npm run dev:worker
```

**4. Start the frontend** (in a third terminal)

```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

## Running everything in Docker

```bash
docker compose --profile app up -d --build
```

The app is then at http://localhost:8080 (API on port 3001). The backend container applies database migrations on startup.

## Configuration

| Variable | Purpose | Default |
|---|---|---|
| `DATABASE_URL` | Postgres connection string | — (required) |
| `JWT_SECRET` | Signs login tokens | — (required) |
| `OPENROUTER_API_KEY` | OpenRouter API key | — (required) |
| `OPENROUTER_MODEL` | Chat model for questions, follow-ups and scoring | `openai/gpt-4.1-mini` |
| `EMBEDDING_MODEL` | Embedding model; must output 1536 dimensions | `openai/text-embedding-3-small` |
| `KAFKA_BROKERS` | Comma-separated Kafka brokers | `localhost:9092` |
| `CORS_ORIGIN` | Allowed frontend origin(s) | `http://localhost:5173` |
| `INTERVIEW_QUESTION_COUNT` | Main questions per interview | `5` |

Frontend: `VITE_API_URL` (default `http://localhost:3001/api`).

## API

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create an account |
| `POST` | `/api/auth/login` | Log in, returns a JWT |
| `GET` | `/api/users/profile` | Current user |
| `POST` | `/api/resumes/upload` | Upload a PDF resume |
| `GET` | `/api/resumes/latest` | Most recent resume |
| `GET` | `/api/interviews/options` | Available interview modes and difficulty levels |
| `POST` | `/api/interviews` | Start an interview (`resumeId`, `mode`, `difficulty`, optional `jobTitle` and `jobDescription`) |
| `GET` | `/api/interviews` | Interview history |
| `GET` | `/api/interviews/:id` | One interview with questions, answers and scores |
| `POST` | `/api/interviews/:id/questions/:questionId/answer` | Submit an answer |
| `POST` | `/api/interviews/:id/complete` | End an interview early |
