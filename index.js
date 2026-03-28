<<<<<<< HEAD
// index.js  — PlaceX / PlaceIQ Placement Portal Backend
// Integrates all 4 team members' routes.
// M4 additions are clearly marked with 🟦 M4.

const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
require('dotenv').config();       // load .env if present

// ── Firebase init ─────────────────────────────────────────────────
let serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // Production: env variable contains JSON string
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
  // Local dev: JSON file in project root
  serviceAccount = require('./serviceAccountKey.json');
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
console.log('✅ Firebase initialized!');

// ── App setup ─────────────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());

// ── Root health check ─────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'PlaceX Placement Backend Running!',
    timestamp: new Date().toISOString(),
    routes: [
      'GET  /',
      '─── M1/M2/M3 ───',
      'POST/GET        /students',
      'PUT/DELETE       /students/:id',
      'POST/GET        /companies',
      'POST/GET        /jobs',
      'GET             /jobs/:jobId/match',
      'POST/GET        /applications',
      '─── M4 ───',
      'POST/GET        /alumni',
      'GET/PUT/DELETE   /alumni/:id',
      'PATCH           /alumni/:id/mentorship',
      'POST/GET        /mentorship',
      'GET             /mentorship/alumni/:alumniId',
      'GET             /mentorship/student/:studentId',
      'PATCH           /mentorship/:id/status',
      'DELETE          /mentorship/:id',
      'GET             /external/jobs',
    ],
  });
});

// ════════════════════════════════════════════
//  M1 / M2 / M3 ROUTES  (unchanged from team)
// ════════════════════════════════════════════
const studentsRoute = require('./routes/students');
app.use('/students', studentsRoute);

=======
const express = require('express');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
console.log('Firebase initialized!');

const app = express();
app.use(express.json());

// 🔹 Existing route
const studentsRoute = require('./routes/students');
app.use('/students', studentsRoute);

// 🔹 ADD THESE LINES HERE 👇
>>>>>>> origin/M2
const companiesRoute = require('./routes/companies');
app.use('/companies', companiesRoute);

const jobsRoute = require('./routes/jobs');
app.use('/jobs', jobsRoute);

<<<<<<< HEAD
const applicationsRoute = require('./routes/applications');
app.use('/applications', applicationsRoute);

// ════════════════════════════════════════════
//  🟦 M4 ROUTES
// ════════════════════════════════════════════
const alumniRoute     = require('./routes/alumni');       // upgraded
const mentorshipRoute = require('./routes/mentorship');   // new
const externalRoute   = require('./routes/external');     // new

app.use('/alumni',      alumniRoute);
app.use('/mentorship',  mentorshipRoute);
app.use('/external',    externalRoute);

// ── 404 fallback ─────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ── Start ─────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
=======
const alumniRoute = require('./routes/alumni');
app.use('/alumni', alumniRoute);

const applicationsRoute = require('./routes/applications');
app.use('/applications', applicationsRoute);

// Root route
app.get('/', (req, res) => {
  res.send('Placement Backend Server Running!');
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
>>>>>>> origin/M2
