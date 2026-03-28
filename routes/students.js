const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();

// Add student
router.post('/', async (req, res) => {
  try {
    const student = req.body;
    const docRef = db.collection('students').doc();
    await docRef.set(student);
    res.status(201).json({ id: docRef.id, message: 'Student added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all students
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('students').get();
    const students = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update student
router.put('/:id', async (req, res) => {
  try {
    await db.collection('students').doc(req.params.id).update(req.body);
    res.json({ message: 'Student updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete student
router.delete('/:id', async (req, res) => {
  try {
    await db.collection('students').doc(req.params.id).delete();
    res.json({ message: 'Student deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;