// routes/alumni.js  — M4: Alumni System
// Replaces the basic alumni.js from the main branch.
// Same pattern as students.js / companies.js — plain Express + Firebase Admin.

const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();

// ────────────────────────────────────────────
//  POST /alumni  — Register / add alumni profile
// ────────────────────────────────────────────
// Expected body:
//  { name, email, graduationYear, currentCompany, jobTitle,
//    lpa, cgpa, branch, skills[], linkedin, github, resumeURL,
//    bio, mentorshipOpen (bool) }
router.post('/', async (req, res) => {
  try {
    const {
      name, email, graduationYear, currentCompany,
      jobTitle, lpa, cgpa, branch, skills,
      linkedin, github, resumeURL, bio, mentorshipOpen
    } = req.body;

    // Basic validation
    if (!name || !email || !currentCompany) {
      return res.status(400).json({ error: 'name, email and currentCompany are required' });
    }

    // Check for duplicate email
    const existing = await db.collection('alumni').where('email', '==', email).get();
    if (!existing.empty) {
      return res.status(409).json({ error: 'An alumni profile with this email already exists' });
    }

    const alumniData = {
      name:            name.trim(),
      email:           email.trim().toLowerCase(),
      graduationYear:  graduationYear || null,
      currentCompany:  currentCompany.trim(),
      jobTitle:        jobTitle || '',
      lpa:             lpa ? parseFloat(lpa) : null,
      cgpa:            cgpa ? parseFloat(cgpa) : null,
      branch:          branch || '',
      skills:          Array.isArray(skills) ? skills : [],
      linkedin:        linkedin || '',
      github:          github || '',
      resumeURL:       resumeURL || '',
      bio:             bio || '',
      mentorshipOpen:  mentorshipOpen === true || mentorshipOpen === 'true',
      createdAt:       new Date().toISOString(),
    };

    const docRef = db.collection('alumni').doc();
    await docRef.set(alumniData);
    res.status(201).json({ id: docRef.id, message: 'Alumni profile created', ...alumniData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ────────────────────────────────────────────
//  GET /alumni  — Get all alumni
// ────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('alumni').orderBy('createdAt', 'desc').get();
    const alumni = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(alumni);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ────────────────────────────────────────────
//  GET /alumni/:id  — Get single alumni profile
// ────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const doc = await db.collection('alumni').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Alumni not found' });
    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ────────────────────────────────────────────
//  PUT /alumni/:id  — Update alumni profile
// ────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const doc = await db.collection('alumni').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Alumni not found' });

    // Only allow updating safe fields (not email)
    const allowed = [
      'name','currentCompany','jobTitle','lpa','cgpa','branch',
      'skills','linkedin','github','resumeURL','bio','mentorshipOpen','graduationYear'
    ];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    updates.updatedAt = new Date().toISOString();

    await db.collection('alumni').doc(req.params.id).update(updates);
    res.json({ message: 'Alumni updated', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ────────────────────────────────────────────
//  DELETE /alumni/:id  — Delete alumni (admin use)
// ────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    await db.collection('alumni').doc(req.params.id).delete();
    res.json({ message: 'Alumni deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ────────────────────────────────────────────
//  PATCH /alumni/:id/mentorship
//  Toggle mentorship availability ON/OFF
// ────────────────────────────────────────────
router.patch('/:id/mentorship', async (req, res) => {
  try {
    const doc = await db.collection('alumni').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Alumni not found' });

    const current = doc.data().mentorshipOpen || false;
    await db.collection('alumni').doc(req.params.id).update({
      mentorshipOpen: !current,
      updatedAt: new Date().toISOString(),
    });
    res.json({ message: 'Mentorship toggled', mentorshipOpen: !current });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
