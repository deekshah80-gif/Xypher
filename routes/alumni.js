const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();

router.post('/', async (req, res) => {
  const docRef = db.collection('alumni').doc();
  await docRef.set(req.body);
  res.json({ id: docRef.id });
});

router.get('/', async (req, res) => {
  const snapshot = await db.collection('alumni').get();
  res.json(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
});

module.exports = router;