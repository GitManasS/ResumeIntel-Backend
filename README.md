# ResumeIntel — Backend

Node/Express REST API for the hiring platform. Handles auth, resume upload + AI parsing, jobs, applications, recruiter pipeline, org management, and public career portal data.

**API base:** `/api/v1`  
**Health check:** `GET /health`  
**Swagger UI:** `GET /api/docs` (when server is running)

Frontend repo: [../frontend/README.md](../frontend/README.md)

---

## Stack

- Node.js (ES modules)
- Express 4
- MongoDB + Mongoose
- JWT access + refresh tokens
- OpenAI API (`gpt-4o-mini`) — resume parse, ATS, JD match, interviews, ranking
- Socket.io — live notifications, pipeline updates, resume ready/failed
- Multer — resume file upload (memory, 5MB, PDF/DOC/DOCX)
- pdf-parse — text from PDFs
- Cloudinary — optional file storage
- Joi — request validation
- Winston — logging
- BullMQ + Redis — optional background jobs (`REDIS_ENABLED=true`)
- Swagger (swagger-jsdoc + swagger-ui-express)

---

## API routes (prefix `/api/v1`)

| Prefix | Notes |
|--------|--------|
| `/auth` | register, login, refresh, logout, me, password reset |
| `/resumes` | upload, list, delete, primary, reanalyze (candidate) |
| `/jd-match` | compare resume to job description |
| `/interview` | generate question sets |
| `/jobs` | public job list; apply; recruiter CRUD; `GET /candidate/applications` |
| `/careers/:slug` | public org + jobs (no auth) |
| `/pipeline` | kanban board, move stage (org staff) |
| `/hiring` | search, analytics, notes, interviews, talent pools |
| `/analytics` | candidate / recruiter / admin stats |
| `/notifications` | in-app notifications |
| `/organizations` | platform admin — orgs + members |

Most staff routes need `Authorization: Bearer <token>` and org middleware. Super admin can pass `x-organization-id` to work inside a tenant.

---

## Folder structure

```
src/
├── server.js           # HTTP server + Socket.io init
├── app.js              # Express middleware, routes mount
├── config/             # env, db, swagger, permissions, pipeline stages
├── routes/             # Route files → controllers
├── controllers/
├── services/           # Business logic
├── models/             # Mongoose schemas
├── middleware/         # auth, permissions, tenant, upload, validate
├── ai/                 # OpenAI wrapper + fallbacks when key missing/errors
├── websocket/          # socket.js
├── queues/             # BullMQ (optional)
├── scripts/            # seed.js
└── utils/
```

---

## Environment

Copy the example file and fill in values:

```bash
cp .env.example .env
```

| Variable | Required | Notes |
|----------|----------|--------|
| `MONGODB_URI` | Yes | Local or Atlas |
| `JWT_SECRET` | Yes | Change in production |
| `JWT_REFRESH_SECRET` | Yes | Change in production |
| `OPENAI_API_KEY` | Strongly recommended | Without it you get fallback ATS scores; parsing still tries heuristics |
| `CLIENT_URL` | Yes for browser app | Full origin, e.g. `http://localhost:5173` or `https://resume-intelligence.netlify.app` |
| `PORT` | No | Default `5000` |
| `REDIS_ENABLED` | No | `false` unless Redis is running |
| Cloudinary trio | No | Upload works without; files just won’t be stored on CDN |
| SMTP | No | Password reset emails |

**CORS:** `CLIENT_URL` must include `https://` in production. Comma-separate multiple origins if needed.

---

## Run locally

```bash
cd backend
npm install
cp .env.example .env
# edit .env — at minimum MONGODB_URI, JWT secrets, OPENAI_API_KEY
npm run dev
```

Server: [http://localhost:5000](http://localhost:5000)  
Docs: [http://localhost:5000/api/docs](http://localhost:5000/api/docs)

Production-style start:

```bash
npm start
```

---

## Seed database (demo users + jobs + pipeline)

```bash
npm run seed
```

Reset everything and re-seed:

```bash
npm run seed:reset
```

**Demo password for all seeded accounts:** `Password123!`

Useful logins:

| Email | Role |
|-------|------|
| `admin@resumeintel.demo` | Platform super admin |
| `sarah.chen@techcorp.demo` | Recruiter (TechCorp) |
| `james.okonkwo@hireflow.demo` | Recruiter (HireFlow) |
| `priya.sharma@email.demo` | Candidate |

Career portals after seed:

- [http://localhost:5173/careers/techcorp](http://localhost:5173/careers/techcorp)
- [http://localhost:5173/careers/hireflow](http://localhost:5173/careers/hireflow)

---

## Resume upload flow (how it actually works)

1. `POST /resumes/upload` — multer reads file into memory, creates `Resume` with `status: parsing`.
2. Response returns immediately (`201`).
3. `parseResumeAsync` runs in the background:
   - Extract text (PDF via pdf-parse; DOCX returns a friendly error — use PDF)
   - OpenAI for structured fields + ATS score (errors fall back, don’t always crash)
   - Save `ready` or `failed` + optional `parseError` message
   - Socket event `resume:ready` / `resume:failed` to the user
4. Frontend polls `GET /resumes` while parsing.

Check Render/logs for lines like `Resume upload accepted` and `Resume parse complete` / `Resume parse failed`.

---

## Deploying (Render)

Typical setup:

- Build: `npm install`
- Start: `npm start`
- Env: `NODE_ENV=production`, `MONGODB_URI`, JWT secrets, `OPENAI_API_KEY`, `CLIENT_URL=https://your-netlify-site.netlify.app`

Free tier sleeps — first request after idle can be slow.

---

## Scripts

| Command | What it does |
|---------|----------------|
| `npm run dev` | nodemon |
| `npm start` | node src/server.js |
| `npm run seed` | demo data (skip if admin exists) |
| `npm run seed:reset` | wipe + reseed |
| `npm run lint` | ESLint |

---

## Auth notes

- Access token short-lived (`JWT_EXPIRES_IN`, default 15m).
- Refresh via `POST /auth/refresh` with body `{ refreshToken }`.
- Candidates: `role: candidate`, no `orgRole`.
- Org staff: `orgRole` + `organization` ref; permissions in `config/permissions.js`.

---

## Related

- [Frontend README](../frontend/README.md)
- [Root README](../README.md)
- [docs/DATABASE_SCHEMA.md](../docs/DATABASE_SCHEMA.md) — if present in repo
- [docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md) — if present in repo
