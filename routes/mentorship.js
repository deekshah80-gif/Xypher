// routes/mentorship.js  — M4: Mentorship System
// Students send requests to alumni. Alumni accept/decline/complete.
// Same plain Express + Firebase Admin pattern as the rest of the project.

const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();

// ────────────────────────────────────────────
//  POST /mentorship
//  Student sends a mentorship request to an alumni
// ────────────────────────────────────────────
// Required body: { studentId, studentName, alumniId, topic, message }
router.post('/', async (req, res) => {
  try {
    const { studentId, studentName, alumniId, topic, message } = req.body;

    if (!studentId || !alumniId || !topic || !message) {
      return res.status(400).json({
        error: 'studentId, alumniId, topic and message are all required'
      });
    }
    if (message.length < 20) {
      return res.status(400).json({ error: 'Message must be at least 20 characters' });
    }

    // Verify alumni exists and is open for mentorship
    const alumniDoc = await db.collection('alumni').doc(alumniId).get();
    if (!alumniDoc.exists) {
      return res.status(404).json({ error: 'Alumni not found' });
    }
    if (!alumniDoc.data().mentorshipOpen) {
      return res.status(400).json({
        error: 'This alumni is currently not accepting mentorship requests'
      });
    }

    // Prevent duplicate pending request from same student to same alumni
    const dupCheck = await db.collection('mentorshipRequests')
      .where('studentId', '==', studentId)
      .where('alumniId', '==', alumniId)
      .where('status', '==', 'pending')
      .get();

    if (!dupCheck.empty) {
      return res.status(409).json({
        error: 'You already have a pending request to this alumni'
      });
    }

    const requestData = {
      studentId,
      studentName:  studentName || '',
      alumniId,
      alumniName:   alumniDoc.data().name,
      alumniCompany: alumniDoc.data().currentCompany,
      topic:        topic.trim(),
      message:      message.trim(),
      status:       'pending',   // pending | accepted | declined | completed
      scheduledAt:  null,
      notes:        '',
      createdAt:    new Date().toISOString(),
      updatedAt:    new Date().toISOString(),
    };

    const docRef = await db.collection('mentorshipRequests').add(requestData);
    res.status(201).json({ id: docRef.id, message: 'Request sent successfully', ...requestData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ────────────────────────────────────────────
//  GET /mentorship
//  Get all requests (admin view)
// ────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('mentorshipRequests')
      .orderBy('createdAt', 'desc')
      .get();
    res.json(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ────────────────────────────────────────────
//  GET /mentorship/alumni/:alumniId
//  Get all requests sent TO a specific alumni
// ────────────────────────────────────────────
router.get('/alumni/:alumniId', async (req, res) => {
  try {
    const snapshot = await db.collection('mentorshipRequests')
      .where('alumniId', '==', req.params.alumniId)
      .orderBy('createdAt', 'desc')
      .get();
    res.json(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ────────────────────────────────────────────
//  GET /mentorship/student/:studentId
//  Get all requests made BY a specific student
// ────────────────────────────────────────────
router.get('/student/:studentId', async (req, res) => {
  try {
    const snapshot = await db.collection('mentorshipRequests')
      .where('studentId', '==', req.params.studentId)
      .orderBy('createdAt', 'desc')
      .get();
    res.json(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ────────────────────────────────────────────
//  PATCH /mentorship/:id/status
//  Alumni accepts, declines, or marks completed
// ────────────────────────────────────────────
// Body: { status: 'accepted' | 'declined' | 'completed', scheduledAt?, notes? }
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, scheduledAt, notes } = req.body;
    const validStatuses = ['accepted', 'declined', 'completed'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: `status must be one of: ${validStatuses.join(', ')}`
      });
    }

    const doc = await db.collection('mentorshipRequests').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Request not found' });

    const updates = {
      status,
      updatedAt: new Date().toISOString(),
    };
    if (notes !== undefined) updates.notes = notes;
    if (scheduledAt !== undefined) updates.scheduledAt = scheduledAt;

    await db.collection('mentorshipRequests').doc(req.params.id).update(updates);
    res.json({ message: `Request ${status}`, id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ────────────────────────────────────────────
//  DELETE /mentorship/:id
//  Delete a request (admin use)
// ────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    await db.collection('mentorshipRequests').doc(req.params.id).delete();
    res.json({ message: 'Request deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
