const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// ⚠️ Dotenv UNIQUEMENT en local
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const db = require('./db/connection');
const models = require('./db/models');
const dbInit = require('./db/init');

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

/* ===================== MIDDLEWARE ===================== */

// CORS
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Logs simples (utile pour debug Render)
app.use((req, res, next) => {
  console.log(new Date().toISOString(), req.method, req.originalUrl);
  next();
});

/* ===================== HEALTH ===================== */

app.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'Clinique API is running' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Clinique API is running' });
});

/* ===================== AUTH ===================== */

app.post('/auth/signup', async (req, res) => {
  try {
    const user = await models.createUser(req.body);
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await models.getUserByEmail(email);

    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ===================== USERS ===================== */

app.get('/users/:id', async (req, res) => {
  try {
    const user = await models.getUserById(req.params.id);
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ===================== PATIENTS ===================== */

app.post('/patients', async (req, res) => {
  try {
    const patient = await models.createPatient(req.body);
    res.json({ success: true, data: patient });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.get('/patients', async (req, res) => {
  try {
    const patients = await models.getPatients();
    res.json({ success: true, data: patients });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/patients/:id', async (req, res) => {
  try {
    const patient = await models.getPatientById(req.params.id);
    res.json({ success: true, data: patient });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/patients/:id', async (req, res) => {
  try {
    const patient = await models.updatePatient(req.params.id, req.body);
    res.json({ success: true, data: patient });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.delete('/patients/:id', async (req, res) => {
  try {
    await models.deletePatient(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ===================== CONSULTATIONS ===================== */

app.post('/consultations', async (req, res) => {
  try {
    const data = await models.createConsultation(req.body);
    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.get('/consultations', async (req, res) => {
  try {
    const data = await models.getConsultations();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ===================== LAB TESTS ===================== */

app.get('/lab_tests', async (req, res) => {
  try {
    const tests = await models.getLabTests();

    if (!tests || tests.length === 0) {
      return res.json({
        success: true,
        data: [
          { id: uuidv4(), name: 'Hémogramme', price: 263 },
          { id: uuidv4(), name: 'Glycémie', price: 150 },
          { id: uuidv4(), name: 'Bilan rénal', price: 800 }
        ]
      });
    }

    res.json({ success: true, data: tests });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ===================== APPOINTMENTS ===================== */

app.post('/appointments', async (req, res) => {
  try {
    const data = await models.createAppointment(req.body);
    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.get('/appointments', async (req, res) => {
  try {
    const data = await models.getAppointments();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ===================== START SERVER ===================== */

(async () => {
  try {
    // Connexion PostgreSQL
    await db.initDb();

    // Création des tables si besoin
    await dbInit.initializeSchema();

    // Seed optionnel (peut être vide)
    await dbInit.seedTestData();

    app.listen(PORT, () => {
      console.log(` Clinique API running on port ${PORT}`);
      console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
    });

  } catch (err) {
    console.error(' Failed to initialize database:', err);
    process.exit(1);
  }
})();
