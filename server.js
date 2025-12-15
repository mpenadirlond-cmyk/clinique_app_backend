const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const db = require('./db/connection');
const models = require('./db/models');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// Enable CORS with explicit headers to avoid XHR issues from the browser.
app.use(cors({ origin: true, credentials: true }));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.header('Origin') || '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Request logging for debugging browser XHR problems
app.use((req, res, next) => {
  console.log(new Date().toISOString(), req.method, req.originalUrl);
  try {
    const entry = `${new Date().toISOString()} ${req.method} ${req.originalUrl} body=${JSON.stringify(req.body || {})}\n`;
    fs.appendFileSync(path.join(__dirname, '..', 'server_requests.log'), entry);
  } catch (e) {
    // ignore file write errors
  }
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Clinique API is running' });
});

// Root route: return same payload as /health to avoid 404 on the service root
app.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'Clinique API is running' });
});

// ==================== AUTH ====================
app.post('/auth/signup', async (req, res) => {
  try {
    const user = await models.createUser(req.body);
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await models.getUserByEmail(email);
    // Verbose auth logging for local debugging (do not enable in production)
    try {
      const authFound = !!user;
      const authMatch = authFound && user.password === password;
      const entry = `${new Date().toISOString()} AUTH_ATTEMPT email=${email} found=${authFound} match=${authMatch}\n`;
      fs.appendFileSync(path.join(__dirname, '..', 'server_requests.log'), entry);
      console.log(entry.trim());
    } catch (e) {
      // ignore logging errors
    }

    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // For now return user object (no JWT). In future, issue a token here.
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== PATIENTS ====================
app.post('/patients', async (req, res) => {
  try {
    const patient = await models.createPatient(req.body);
    res.json({ success: true, data: patient });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/patients', async (req, res) => {
  try {
    const patients = await models.getPatients();
    res.json({ success: true, data: patients });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/patients/:id', async (req, res) => {
  try {
    const patient = await models.getPatientById(req.params.id);
    res.json({ success: true, data: patient });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user by id
app.get('/users/:id', async (req, res) => {
  try {
    const user = await models.getUserById(req.params.id);
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/patients/:id', async (req, res) => {
  try {
    const patient = await models.updatePatient(req.params.id, req.body);
    res.json({ success: true, data: patient });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.delete('/patients/:id', async (req, res) => {
  try {
    await models.deletePatient(req.params.id);
    res.json({ success: true, message: 'Patient deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== CONSULTATIONS ====================
app.post('/consultations', async (req, res) => {
  try {
    const consultation = await models.createConsultation(req.body);
    res.json({ success: true, data: consultation });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/consultations', async (req, res) => {
  try {
    const consultations = await models.getConsultations();
    res.json({ success: true, data: consultations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/consultations/patient/:patientId', async (req, res) => {
  try {
    const consultations = await models.getConsultationsByPatient(req.params.patientId);
    res.json({ success: true, data: consultations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/consultations/:id', async (req, res) => {
  try {
    const consultation = await models.updateConsultation(req.params.id, req.body);
    res.json({ success: true, data: consultation });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.delete('/consultations/:id', async (req, res) => {
  try {
    await models.deleteConsultation(req.params.id);
    res.json({ success: true, message: 'Consultation deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== BON SORTIE ====================
app.post('/bon_sortie', async (req, res) => {
  try {
    const bonSortie = await models.createBonSortie(req.body);
    res.json({ success: true, data: bonSortie });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/bon_sortie', async (req, res) => {
  try {
    const bonSortie = await models.getBonsSortie();
    res.json({ success: true, data: bonSortie });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/bon_sortie/:id', async (req, res) => {
  try {
    const bonSortie = await models.getBonSortieById(req.params.id);
    res.json({ success: true, data: bonSortie });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/bon_sortie/patient/:patientId', async (req, res) => {
  try {
    const bonSortie = await models.getBonSortieByPatient(req.params.patientId);
    res.json({ success: true, data: bonSortie });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/bon_sortie/:id', async (req, res) => {
  try {
    const bonSortie = await models.updateBonSortie(req.params.id, req.body);
    res.json({ success: true, data: bonSortie });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.delete('/bon_sortie/:id', async (req, res) => {
  try {
    await models.deleteBonSortie(req.params.id);
    res.json({ success: true, message: 'Bon sortie deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== MEDICINES ====================
app.post('/medicines', async (req, res) => {
  try {
    const medicine = await models.createMedicine(req.body);
    res.json({ success: true, data: medicine });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/medicines', async (req, res) => {
  try {
    const medicines = await models.getMedicines();
    res.json({ success: true, data: medicines });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/medicines/:id', async (req, res) => {
  try {
    const medicine = await models.getMedicineById(req.params.id);
    res.json({ success: true, data: medicine });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/medicines/:id', async (req, res) => {
  try {
    const medicine = await models.updateMedicine(req.params.id, req.body);
    res.json({ success: true, data: medicine });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.delete('/medicines/:id', async (req, res) => {
  try {
    await models.deleteMedicine(req.params.id);
    res.json({ success: true, message: 'Medicine deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== LAB TESTS ====================
app.post('/lab_tests', async (req, res) => {
  try {
    const labTest = await models.createLabTest(req.body);
    res.json({ success: true, data: labTest });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/lab_tests', async (req, res) => {
  try {
    const labTests = await models.getLabTests();
    if (!labTests || labTests.length === 0) {
      // Return a sensible default list so the UI can function even if DB empty
      const defaults = [
        { id: uuidv4(), name: 'Hémogramme', description: 'Hémogramme complet', price: 263, category: 'Hématologie' },
        { id: uuidv4(), name: 'Glycémie', description: 'Glycémie à jeun', price: 150, category: 'Biochimie' },
        { id: uuidv4(), name: 'Bilan rénal', description: 'Créatinine, urée', price: 800, category: 'Biochimie' },
      ];
      return res.json({ success: true, data: defaults });
    }
    res.json({ success: true, data: labTests });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/lab_tests/:id', async (req, res) => {
  try {
    const labTest = await models.getLabTestById(req.params.id);
    res.json({ success: true, data: labTest });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/lab_tests/:id', async (req, res) => {
  try {
    const labTest = await models.updateLabTest(req.params.id, req.body);
    res.json({ success: true, data: labTest });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.delete('/lab_tests/:id', async (req, res) => {
  try {
    await models.deleteLabTest(req.params.id);
    res.json({ success: true, message: 'Lab test deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== LAB ORDERS ====================
app.post('/lab_orders', async (req, res) => {
  try {
    const labOrder = await models.createLabOrder(req.body);
    res.json({ success: true, data: labOrder });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/lab_orders', async (req, res) => {
  try {
    const labOrders = await models.getLabOrders();
    res.json({ success: true, data: labOrders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/lab_orders/:id', async (req, res) => {
  try {
    const labOrder = await models.getLabOrderById(req.params.id);
    res.json({ success: true, data: labOrder });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/lab_orders/:id', async (req, res) => {
  try {
    const labOrder = await models.updateLabOrder(req.params.id, req.body);
    res.json({ success: true, data: labOrder });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ==================== APPOINTMENTS ====================
app.post('/appointments', async (req, res) => {
  try {
    const appointment = await models.createAppointment(req.body);
    res.json({ success: true, data: appointment });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/appointments', async (req, res) => {
  try {
    const appointments = await models.getAppointments();
    res.json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/appointments/patient/:patientId', async (req, res) => {
  try {
    const appointments = await models.getAppointmentsByPatient(req.params.patientId);
    res.json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/appointments/:id', async (req, res) => {
  try {
    const appointment = await models.updateAppointment(req.params.id, req.body);
    res.json({ success: true, data: appointment });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.delete('/appointments/:id', async (req, res) => {
  try {
    await models.deleteAppointment(req.params.id);
    res.json({ success: true, message: 'Appointment deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== PHARMACY VOUCHERS ====================
app.post('/vouchers', async (req, res) => {
  try {
    const voucher = await models.createVoucher(req.body);
    res.json({ success: true, data: voucher });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/vouchers', async (req, res) => {
  try {
    const vouchers = await models.getVouchers();
    res.json({ success: true, data: vouchers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/vouchers/patient/:patientId', async (req, res) => {
  try {
    const vouchers = await models.getVouchersByPatient(req.params.patientId);
    res.json({ success: true, data: vouchers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/vouchers/:id', async (req, res) => {
  try {
    const voucher = await models.updateVoucher(req.params.id, req.body);
    res.json({ success: true, data: voucher });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ==================== ETAT BESOIN ====================
app.post('/etat_besoin', async (req, res) => {
  try {
    const etatBesoin = await models.createEtatBesoin(req.body);
    res.json({ success: true, data: etatBesoin });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/etat_besoin', async (req, res) => {
  try {
    const etatBesoins = await models.getEtatBesoins();
    res.json({ success: true, data: etatBesoins });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/etat_besoin/:id', async (req, res) => {
  try {
    const etatBesoin = await models.updateEtatBesoin(req.params.id, req.body);
    res.json({ success: true, data: etatBesoin });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ==================== FICHE SUIVI ====================
app.post('/fiche_suivi', async (req, res) => {
  try {
    const ficheSuivi = await models.createFicheSuivi(req.body);
    res.json({ success: true, data: ficheSuivi });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/fiche_suivi', async (req, res) => {
  try {
    const ficheSuivis = await models.getFicheSuivis();
    res.json({ success: true, data: ficheSuivis });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/fiche_suivi/patient/:patientId', async (req, res) => {
  try {
    const ficheSuivis = await models.getFicheSuivisByPatient(req.params.patientId);
    res.json({ success: true, data: ficheSuivis });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/fiche_suivi/:id', async (req, res) => {
  try {
    const ficheSuivi = await models.updateFicheSuivi(req.params.id, req.body);
    res.json({ success: true, data: ficheSuivi });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ==================== HOSPITALISATION ====================
app.post('/hospitalisation', async (req, res) => {
  try {
    const hospitalisation = await models.createHospitalisation(req.body);
    res.json({ success: true, data: hospitalisation });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/hospitalisation', async (req, res) => {
  try {
    const hospitalisations = await models.getHospitalisations();
    res.json({ success: true, data: hospitalisations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/hospitalisation/patient/:patientId', async (req, res) => {
  try {
    const hospitalisations = await models.getHospitalisationsByPatient(req.params.patientId);
    res.json({ success: true, data: hospitalisations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/hospitalisation/:id', async (req, res) => {
  try {
    const hospitalisation = await models.updateHospitalisation(req.params.id, req.body);
    res.json({ success: true, data: hospitalisation });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Initialize database and start server
db.initDb().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Clinique API server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

// Ensure lab_tests table has some default entries when server starts
db.initDb().then(async () => {
  try {
    const tests = await models.getLabTests();
    if (!tests || tests.length === 0) {
      console.log('Seeding default lab tests into database (server bootstrap)');
      await models.createLabTest({ name: 'Hémogramme', description: 'Hémogramme complet', price: 263, category: 'Hématologie' });
      await models.createLabTest({ name: 'Glycémie', description: 'Glycémie à jeun', price: 150, category: 'Biochimie' });
      await models.createLabTest({ name: 'Bilan rénal', description: 'Créatinine, urée', price: 800, category: 'Biochimie' });
    }
  } catch (e) {
    console.error('Error seeding lab tests on bootstrap:', e);
  }
}).catch(e => {
  console.error('DB init failed during bootstrap seed check:', e);
});
