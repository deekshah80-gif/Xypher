const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();

// Add company
router.post('/', async (req, res) => {
  const docRef = db.collection('companies').doc();
  await docRef.set(req.body);
  res.json({ id: docRef.id, message: 'Company added' });
});

// Get all companies
router.get('/', async (req, res) => {
  const snapshot = await db.collection('companies').get();
  res.json(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
});

module.exports = router;