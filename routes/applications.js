const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();

// Apply for job
router.post('/', async (req, res) => {
  const docRef = db.collection('applications').doc();
  await docRef.set({
    ...req.body,
    status: 'applied'
  });

  res.json({ id: docRef.id, message: 'Applied successfully' });
});

// Get applications
router.get('/', async (req, res) => {
  const snapshot = await db.collection('applications').get();
  res.json(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
});

module.exports = router;