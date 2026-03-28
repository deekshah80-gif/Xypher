# PlaceX — College Placement Portal
### M4 Contribution: Alumni System · Mentorship · Integration · Documentation

---

## 👥 Team

| Member | Role | Key Files |
|--------|------|-----------|
| M1 | Students module | `routes/students.js` |
| M2 | Companies + Jobs module | `routes/companies.js`, `routes/jobs.js` |
| M3 | Applications + Matching | `routes/applications.js` |
| **M4 (you)** | **Alumni · Mentorship · Integration · Docs** | `routes/alumni.js`, `routes/mentorship.js`, `routes/external.js`, `index.js` |

---

## 📁 Project Structure

```
placex-backend/
├── index.js                  ← Main server (M4 integrated all routes here)
├── serviceAccountKey.json    ← Firebase credentials (NOT committed to git)
├── package.json
├── .env.example
├── test_m4.http              ← API tests for M4 routes
├── test.http                 ← Original team API tests
│
└── routes/
    ├── students.js           ← M1
    ├── companies.js          ← M2
    ├── jobs.js               ← M2/M3
    ├── applications.js       ← M3
    ├── alumni.js             ← M4 (upgraded from stub)
    ├── mentorship.js         ← M4 (new)
    └── external.js           ← M4 (new)
```

---

## 🚀 Setup & Run

### 1. Clone the repo

```bash
git clone https://github.com/deeksha80-gif/xypher.git
cd xypher
```

### 2. Install dependencies

```bash
npm install
```

> **M4 added 2 new packages** — `cors` and `dotenv`.
> Run `npm install` after pulling M4's branch.

### 3. Add Firebase credentials

Put your `serviceAccountKey.json` in the project root.
Get it from: Firebase Console → Project Settings → Service Accounts → Generate new private key.

```
placex-backend/
└── serviceAccountKey.json   ← add this file (never commit it!)
```

Make sure `.gitignore` has:
```
serviceAccountKey.json
.env
node_modules/
```

### 4. (Optional) Create a `.env` file

```bash
cp .env.example .env
# Edit .env and set PORT if needed
# Add JSEARCH_API_KEY for live external jobs (optional)
```

### 5. Start the server

```bash
npm start       # production
npm run dev     # development (auto-restart with nodemon)
```

Server runs at: **http://localhost:5000**

---

## 📡 Full API Reference

### M1 — Students

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/students` | Add a student |
| GET | `/students` | Get all students |
| PUT | `/students/:id` | Update student |
| DELETE | `/students/:id` | Delete student |

### M2 — Companies & Jobs

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/companies` | Add company |
| GET | `/companies` | Get all companies |
| POST | `/jobs` | Add job |
| GET | `/jobs` | Get all jobs |
| GET | `/jobs/:jobId/match` | Match students to a job by CGPA + skills |

### M3 — Applications

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/applications` | Apply to a job |
| GET | `/applications` | Get all applications |

### 🟦 M4 — Alumni

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/alumni` | Register alumni profile |
| GET | `/alumni` | Get all alumni |
| GET | `/alumni/:id` | Get single alumni |
| PUT | `/alumni/:id` | Update alumni profile |
| DELETE | `/alumni/:id` | Delete alumni |
| PATCH | `/alumni/:id/mentorship` | Toggle mentorship availability ON/OFF |

**POST /alumni — body fields:**
```json
{
  "name":          "Carol Lee",
  "email":         "carol@example.com",
  "graduationYear": 2022,
  "currentCompany": "Google",
  "jobTitle":      "Software Engineer II",
  "lpa":           45,
  "cgpa":          9.2,
  "branch":        "CSE",
  "skills":        ["Java", "System Design", "Kotlin"],
  "linkedin":      "https://linkedin.com/in/carollee",
  "github":        "https://github.com/carollee",
  "resumeURL":     "https://drive.google.com/...",
  "bio":           "Focus on DSA early. Internships are gold.",
  "mentorshipOpen": true
}
```

### 🟦 M4 — Mentorship

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/mentorship` | Student sends request to alumni |
| GET | `/mentorship` | Get all requests (admin) |
| GET | `/mentorship/alumni/:alumniId` | Requests received by an alumni |
| GET | `/mentorship/student/:studentId` | Requests sent by a student |
| PATCH | `/mentorship/:id/status` | Accept / decline / complete a request |
| DELETE | `/mentorship/:id` | Delete request |

**PATCH /mentorship/:id/status — body:**
```json
{
  "status":      "accepted",
  "scheduledAt": "2025-08-10T10:00:00.000Z",
  "notes":       "Let us connect via Google Meet."
}
```
Valid statuses: `accepted` | `declined` | `completed`

### 🟦 M4 — External Jobs

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/external/jobs` | Get curated + live jobs |

**Query parameters:**

| Param | Values | Example |
|-------|--------|---------|
| `q` | keyword | `?q=python` |
| `source` | `internshala` / `linkedin` / `all` | `?source=internshala` |
| `type` | `internship` / `full-time` / `all` | `?type=internship` |

---

## 🗃️ Firestore Collections

| Collection | Owner | Fields |
|------------|-------|--------|
| `students` | M1 | name, email, cgpa, skills, role |
| `companies` | M2 | name, industry, email, role |
| `jobs` | M2 | companyId, title, requiredSkills, minCgpa |
| `applications` | M3 | studentId, jobId, status |
| `alumni` | **M4** | name, email, currentCompany, jobTitle, lpa, cgpa, branch, skills, linkedin, github, resumeURL, bio, mentorshipOpen, createdAt |
| `mentorshipRequests` | **M4** | studentId, studentName, alumniId, alumniName, topic, message, status, scheduledAt, notes, createdAt |

---

## 🔗 How M4 Integrates with M1/M2/M3

### Mentorship → Students (M1)
When a student sends a mentorship request, their `studentId` must exist in the `students` collection created by M1.

**Frontend flow:**
1. Student logs in → M1 gives them their Firestore ID
2. Student browses `/alumni` → picks someone with `mentorshipOpen: true`
3. Student POSTs to `/mentorship` with their `studentId` and the alumni's `id`

### Alumni stats → Admin Dashboard
The admin dashboard (FINAL.html/PlaceIQ) can pull alumni data:
```js
// In PlaceIQ frontend — fetch alumni count for dashboard stats
const alumni = await fetch('/alumni').then(r => r.json());
const mentors = alumni.filter(a => a.mentorshipOpen).length;
```

### External Jobs → Student Recommendations (M3 / PlaceIQ)
PlaceIQ's AI recommendation engine can supplement its job list:
```js
// Fetch external jobs and merge with internal ones
const external = await fetch('/external/jobs?q=python').then(r => r.json());
// external.data contains Internshala + LinkedIn jobs to show alongside /jobs
```

### Job Matching → Alumni (M2)
When M2's `/jobs/:id/match` returns matched students, you can also suggest relevant alumni mentors who work at that company:
```js
// After matching students to a job:
const alumni = await db.collection('alumni')
  .where('currentCompany', '==', job.company)
  .where('mentorshipOpen', '==', true)
  .get();
// Suggest these alumni to matched students
```

---

## 🧪 Testing

### With VS Code REST Client
Install the **REST Client** extension, then open `test_m4.http` and click **Send Request** above any block.

### With curl
```bash
# Add an alumni
curl -X POST http://localhost:5000/alumni \
  -H "Content-Type: application/json" \
  -d '{"name":"Carol Lee","email":"carol@example.com","currentCompany":"Google","mentorshipOpen":true}'

# Get all alumni
curl http://localhost:5000/alumni

# Send mentorship request
curl -X POST http://localhost:5000/mentorship \
  -H "Content-Type: application/json" \
  -d '{"studentId":"STU_ID","studentName":"Alice","alumniId":"ALUMNI_ID","topic":"Interview prep","message":"Hi Carol, I want guidance on cracking Google interviews. I have strong DSA skills but struggle with system design."}'

# Get external jobs
curl http://localhost:5000/external/jobs
curl "http://localhost:5000/external/jobs?q=python&type=internship"
```

### Test order (for a full flow)
1. Add 2 students via `/students` → note their IDs
2. Add 2 alumni via `/alumni` → note their IDs
3. Make one alumni `mentorshipOpen: true` (it is by default in the POST above)
4. Send a mentorship request from student → alumni
5. Accept the request via PATCH `/mentorship/:id/status`
6. View the request in `/mentorship/alumni/:alumniId` — status should be `accepted`

---

## ☁️ Deployment

### Deploy backend to Render (free tier)

1. Push to GitHub
2. Go to [render.com](https://render.com) → New Web Service → Connect repo
3. Build command: `npm install`
4. Start command: `node index.js`
5. Add environment variable:
   - `FIREBASE_SERVICE_ACCOUNT` → paste your entire `serviceAccountKey.json` as a single-line JSON string
   - `PORT` → `5000` (Render sets this automatically)
6. Deploy — Render gives you a public URL like `https://placex.onrender.com`

### Update frontend to use production URL

In `FINAL.html` (PlaceIQ frontend), update all fetch calls:
```js
const API = 'https://placex.onrender.com';  // change from localhost
fetch(`${API}/alumni`).then(...)
```

---

## 📝 Git Workflow (for M4)

```bash
# Create your branch
git checkout -b feature/m4-alumni-mentorship

# Stage and commit your files
git add routes/alumni.js routes/mentorship.js routes/external.js
git add index.js package.json .env.example
git add test_m4.http README.md

git commit -m "feat(M4): alumni system, mentorship routes, external jobs, integration"

# Push
git push origin feature/m4-alumni-mentorship

# Open a Pull Request → main
# Tag teammates as reviewers
```

---

## ✅ M4 Checklist

- [x] Alumni registration and profile management (company, role, LPA, CGPA, career path)
- [x] Alumni CRUD — create, read, update, delete, toggle mentorship
- [x] Mentorship system — student sends request, alumni accepts/declines/completes
- [x] Duplicate request prevention, validation, error handling
- [x] External job platform integration (Internshala + LinkedIn via JSearch API with seed fallback)
- [x] Integrated all 4 members' routes in `index.js` cleanly
- [x] Added `cors` and `dotenv` to support frontend + production deploy
- [x] API test file (`test_m4.http`) for all 25 endpoints
- [x] README with full setup, API docs, integration guide, deployment steps
