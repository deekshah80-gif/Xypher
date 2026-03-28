const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();

// Add job
router.post('/', async (req, res) => {
  const docRef = db.collection('jobs').doc();
  await docRef.set(req.body);
  res.json({ id: docRef.id, message: 'Job added' });
});

// Get jobs
router.get('/', async (req, res) => {
  const snapshot = await db.collection('jobs').get();
  res.json(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
});

// Matching logic
router.get('/:jobId/match', async (req, res) => {
  const jobDoc = await db.collection('jobs').doc(req.params.jobId).get();
  const job = jobDoc.data();

  const studentsSnap = await db.collection('students').get();

  const matched = studentsSnap.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(s =>
      s.cgpa >= job.minCgpa &&
      job.skills.every(skill => s.skills.includes(skill))
    );

  res.json(matched);
});

module.exports = router;