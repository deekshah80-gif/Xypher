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
const companiesRoute = require('./routes/companies');
app.use('/companies', companiesRoute);

const jobsRoute = require('./routes/jobs');
app.use('/jobs', jobsRoute);

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