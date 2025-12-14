const { v4: uuidv4 } = require('uuid');
const db = require('./connection');

// Users
const createUser = async (data) => {
  const id = uuidv4();
  const fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim();
  await db.run(`
    INSERT INTO users (id, fullName, email, password, role)
    VALUES (?, ?, ?, ?, ?)
  `, [id, fullName, data.email, data.password, data.role || 'user']);
  return { id, firstName: data.firstName || '', lastName: data.lastName || '', email: data.email, phone: data.phone || '', role: data.role || 'user', createdAt: new Date().toISOString(), password: data.password };
};

const getUserByEmail = async (email) => {
  return await db.get('SELECT * FROM users WHERE email = ?', [email]);
};

const getUserById = async (id) => {
  return await db.get('SELECT * FROM users WHERE id = ?', [id]);
};

// Patients
const createPatient = async (data) => {
  const id = uuidv4();
  await db.run(`
    INSERT INTO patients (id, nom, postnom, prenom, sexe, age, adresse, telephone, etatCivil, profession, lieuOrigine)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [id, data.nom, data.postnom || null, data.prenom, data.sexe, data.age, data.adresse, data.telephone, data.etatCivil, data.profession, data.lieuOrigine]);
  return { id, ...data };
};

const getPatients = async () => {
  return await db.all('SELECT * FROM patients ORDER BY createdAt DESC');
};

const getPatientById = async (id) => {
  return await db.get('SELECT * FROM patients WHERE id = ?', [id]);
};

const updatePatient = async (id, data) => {
  const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
  const values = [...Object.values(data), id];
  await db.run(`UPDATE patients SET ${fields}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`, values);
  return { id, ...data };
};

const deletePatient = async (id) => {
  await db.run('DELETE FROM patients WHERE id = ?', [id]);
};

// Consultations
const createConsultation = async (data) => {
  const id = uuidv4();
  await db.run(`
    INSERT INTO consultations (id, patientId, date, motifConsultation, taille, poids, tension, temperature, diagnostic, traitement, doctorName)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [id, data.patientId, data.date, data.motifConsultation, data.taille, data.poids, data.tension, data.temperature, data.diagnostic, data.traitement, data.doctorName]);
  return { id, ...data };
};

const getConsultations = async () => {
  return await db.all('SELECT * FROM consultations ORDER BY date DESC');
};

const getConsultationsByPatient = async (patientId) => {
  return await db.all('SELECT * FROM consultations WHERE patientId = ? ORDER BY date DESC', [patientId]);
};

const updateConsultation = async (id, data) => {
  const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
  const values = [...Object.values(data), id];
  await db.run(`UPDATE consultations SET ${fields} WHERE id = ?`, values);
  return { id, ...data };
};

const deleteConsultation = async (id) => {
  await db.run('DELETE FROM consultations WHERE id = ?', [id]);
};

// Bon Sortie
const createBonSortie = async (data) => {
  const id = uuidv4();
  await db.run(`
    INSERT INTO bon_sortie (id, patientId, montant, montantLettres, motif, date, caisse, administration)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [id, data.patientId, data.montant, data.montantLettres, data.motif, data.date, data.caisse, data.administration]);
  return { id, ...data };
};

const getBonsSortie = async () => {
  return await db.all('SELECT * FROM bon_sortie ORDER BY date DESC');
};

const getBonSortieById = async (id) => {
  return await db.get('SELECT * FROM bon_sortie WHERE id = ?', [id]);
};

const getBonSortieByPatient = async (patientId) => {
  return await db.all('SELECT * FROM bon_sortie WHERE patientId = ? ORDER BY date DESC', [patientId]);
};

const updateBonSortie = async (id, data) => {
  const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
  const values = [...Object.values(data), id];
  await db.run(`UPDATE bon_sortie SET ${fields} WHERE id = ?`, values);
  return { id, ...data };
};

const deleteBonSortie = async (id) => {
  await db.run('DELETE FROM bon_sortie WHERE id = ?', [id]);
};

// Medicines
const createMedicine = async (data) => {
  const id = uuidv4();
  await db.run(`
    INSERT INTO medicines (id, name, category, quantity, price, unit, supplier, expiryDate)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [id, data.name, data.category, data.quantity || 0, data.price || 0, data.unit || 'box', data.supplier, data.expiryDate]);
  return { id, ...data };
};

const getMedicines = async () => {
  return await db.all('SELECT * FROM medicines ORDER BY name');
};

const getMedicineById = async (id) => {
  return await db.get('SELECT * FROM medicines WHERE id = ?', [id]);
};

const updateMedicine = async (id, data) => {
  const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
  const values = [...Object.values(data), id];
  await db.run(`UPDATE medicines SET ${fields}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`, values);
  return { id, ...data };
};

const deleteMedicine = async (id) => {
  await db.run('DELETE FROM medicines WHERE id = ?', [id]);
};

// Lab Tests
const createLabTest = async (data) => {
  const id = uuidv4();
  await db.run(`
    INSERT INTO lab_tests (id, name, description, price, category)
    VALUES (?, ?, ?, ?, ?)
  `, [id, data.name, data.description, data.price || 0, data.category]);
  return { id, ...data };
};

const getLabTests = async () => {
  return await db.all('SELECT * FROM lab_tests ORDER BY name');
};

const getLabTestById = async (id) => {
  return await db.get('SELECT * FROM lab_tests WHERE id = ?', [id]);
};

const updateLabTest = async (id, data) => {
  const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
  const values = [...Object.values(data), id];
  await db.run(`UPDATE lab_tests SET ${fields} WHERE id = ?`, values);
  return { id, ...data };
};

const deleteLabTest = async (id) => {
  await db.run('DELETE FROM lab_tests WHERE id = ?', [id]);
};

// Lab Orders
const createLabOrder = async (data) => {
  const id = uuidv4();
  await db.run(`
    INSERT INTO lab_orders (id, patientId, testIds, doctorName, orderDate, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [id, data.patientId, JSON.stringify(data.testIds || []), data.doctorName, data.orderDate, data.status || 'pending']);
  return { id, ...data };
};

const getLabOrders = async () => {
  return await db.all('SELECT * FROM lab_orders ORDER BY orderDate DESC');
};

const getLabOrderById = async (id) => {
  return await db.get('SELECT * FROM lab_orders WHERE id = ?', [id]);
};

const updateLabOrder = async (id, data) => {
  const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
  const values = [...Object.values(data), id];
  await db.run(`UPDATE lab_orders SET ${fields} WHERE id = ?`, values);
  return { id, ...data };
};

// Appointments
const createAppointment = async (data) => {
  const id = uuidv4();
  await db.run(`
    INSERT INTO appointments (id, patientId, date, time, reason, status, doctorName)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [id, data.patientId, data.date, data.time, data.reason, data.status || 'scheduled', data.doctorName]);
  return { id, ...data };
};

const getAppointments = async () => {
  return await db.all('SELECT * FROM appointments ORDER BY date DESC');
};

const getAppointmentsByPatient = async (patientId) => {
  return await db.all('SELECT * FROM appointments WHERE patientId = ? ORDER BY date DESC', [patientId]);
};

const updateAppointment = async (id, data) => {
  const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
  const values = [...Object.values(data), id];
  await db.run(`UPDATE appointments SET ${fields} WHERE id = ?`, values);
  return { id, ...data };
};

const deleteAppointment = async (id) => {
  await db.run('DELETE FROM appointments WHERE id = ?', [id]);
};

// Pharmacy Vouchers
const createVoucher = async (data) => {
  const id = uuidv4();
  await db.run(`
    INSERT INTO pharmacy_vouchers (id, patientId, medicines, totalPrice, status)
    VALUES (?, ?, ?, ?, ?)
  `, [id, data.patientId, JSON.stringify(data.medicines || []), data.totalPrice || 0, data.status || 'pending']);
  return { id, ...data };
};

const getVouchers = async () => {
  return await db.all('SELECT * FROM pharmacy_vouchers ORDER BY createdAt DESC');
};

const getVouchersByPatient = async (patientId) => {
  return await db.all('SELECT * FROM pharmacy_vouchers WHERE patientId = ? ORDER BY createdAt DESC', [patientId]);
};

const updateVoucher = async (id, data) => {
  // Fetch existing voucher to detect status changes
  const existing = await db.get('SELECT * FROM pharmacy_vouchers WHERE id = ?', [id]);
  const prevStatus = existing ? existing.status : null;

  // If voucher is being validated now (and wasn't validated before), decrement medicine stock
  if (data.status === 'validated' && prevStatus !== 'validated') {
    let meds = [];
    try {
      if (data.medicines) {
        meds = Array.isArray(data.medicines) ? data.medicines : JSON.parse(data.medicines);
      } else if (existing && existing.medicines) {
        meds = JSON.parse(existing.medicines);
      }
    } catch (e) {
      meds = [];
    }

    for (const m of meds) {
      const medId = m.id || m.medicineId || m.medicamentId;
      const qty = Number(m.quantity || m.qty || m.qte || 0);
      if (!medId || qty <= 0) continue;
      const medRow = await db.get('SELECT * FROM medicines WHERE id = ?', [medId]);
      if (medRow) {
        const currentQty = Number(medRow.quantity || 0);
        const newQty = Math.max(0, currentQty - qty);
        await db.run('UPDATE medicines SET quantity = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?', [newQty, medId]);
      }
    }
  }

  const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
  const values = [...Object.values(data), id];
  await db.run(`UPDATE pharmacy_vouchers SET ${fields}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`, values);
  return { id, ...data };
};

// Etat Besoin
const createEtatBesoin = async (data) => {
  const id = uuidv4();
  await db.run(`
    INSERT INTO etat_besoin (id, description, status)
    VALUES (?, ?, ?)
  `, [id, data.description, data.status || 'pending']);
  return { id, ...data };
};

const getEtatBesoins = async () => {
  return await db.all('SELECT * FROM etat_besoin ORDER BY createdAt DESC');
};

const updateEtatBesoin = async (id, data) => {
  const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
  const values = [...Object.values(data), id];
  await db.run(`UPDATE etat_besoin SET ${fields}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`, values);
  return { id, ...data };
};

// Fiche Suivi
const createFicheSuivi = async (data) => {
  const id = uuidv4();
  await db.run(`
    INSERT INTO fiche_suivi (id, patientId, observations, status)
    VALUES (?, ?, ?, ?)
  `, [id, data.patientId, data.observations, data.status || 'ongoing']);
  return { id, ...data };
};

const getFicheSuivis = async () => {
  return await db.all('SELECT * FROM fiche_suivi ORDER BY createdAt DESC');
};

const getFicheSuivisByPatient = async (patientId) => {
  return await db.all('SELECT * FROM fiche_suivi WHERE patientId = ? ORDER BY createdAt DESC', [patientId]);
};

const updateFicheSuivi = async (id, data) => {
  const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
  const values = [...Object.values(data), id];
  await db.run(`UPDATE fiche_suivi SET ${fields}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`, values);
  return { id, ...data };
};

// Hospitalisation
const createHospitalisation = async (data) => {
  const id = uuidv4();
  await db.run(`
    INSERT INTO hospitalisation (id, patientId, admissionDate, dischargeDate, reason, ward, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [id, data.patientId, data.admissionDate, data.dischargeDate, data.reason, data.ward, data.status || 'admitted']);
  return { id, ...data };
};

const getHospitalisations = async () => {
  return await db.all('SELECT * FROM hospitalisation ORDER BY admissionDate DESC');
};

const getHospitalisationsByPatient = async (patientId) => {
  return await db.all('SELECT * FROM hospitalisation WHERE patientId = ? ORDER BY admissionDate DESC', [patientId]);
};

const updateHospitalisation = async (id, data) => {
  const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
  const values = [...Object.values(data), id];
  await db.run(`UPDATE hospitalisation SET ${fields} WHERE id = ?`, values);
  return { id, ...data };
};

module.exports = {
  createPatient, getPatients, getPatientById, updatePatient, deletePatient,
  createConsultation, getConsultations, getConsultationsByPatient, updateConsultation, deleteConsultation,
  createBonSortie, getBonsSortie, getBonSortieById, getBonSortieByPatient, updateBonSortie, deleteBonSortie,
  createMedicine, getMedicines, getMedicineById, updateMedicine, deleteMedicine,
  createLabTest, getLabTests, getLabTestById, updateLabTest, deleteLabTest,
  createLabOrder, getLabOrders, getLabOrderById, updateLabOrder,
  createAppointment, getAppointments, getAppointmentsByPatient, updateAppointment, deleteAppointment,
  createVoucher, getVouchers, getVouchersByPatient, updateVoucher,
  createEtatBesoin, getEtatBesoins, updateEtatBesoin,
  createFicheSuivi, getFicheSuivis, getFicheSuivisByPatient, updateFicheSuivi,
  createHospitalisation, getHospitalisations, getHospitalisationsByPatient, updateHospitalisation
};
module.exports.createUser = createUser;
module.exports.getUserByEmail = getUserByEmail;
module.exports.getUserById = getUserById;
