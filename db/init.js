const db = require('./connection');

async function initializeSchema() {
  // Use parameterless CREATE TABLE IF NOT EXISTS statements adapted for Postgres
  await db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      fullName TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.run(`
    CREATE TABLE IF NOT EXISTS patients (
      id TEXT PRIMARY KEY,
      nom TEXT NOT NULL,
      postnom TEXT,
      prenom TEXT,
      sexe TEXT,
      age INTEGER,
      adresse TEXT,
      telephone TEXT,
      etatCivil TEXT,
      profession TEXT,
      lieuOrigine TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.run(`
    CREATE TABLE IF NOT EXISTS consultations (
      id TEXT PRIMARY KEY,
      patientId TEXT NOT NULL,
      date TIMESTAMP,
      motifConsultation TEXT,
      taille REAL,
      poids REAL,
      tension TEXT,
      temperature REAL,
      diagnostic TEXT,
      traitement TEXT,
      doctorName TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patientId) REFERENCES patients(id)
    )
  `);

  await db.run(`
    CREATE TABLE IF NOT EXISTS bon_sortie (
      id TEXT PRIMARY KEY,
      patientId TEXT NOT NULL,
      montant REAL NOT NULL,
      montantLettres TEXT,
      motif TEXT,
      date TIMESTAMP,
      caisse TEXT,
      administration TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patientId) REFERENCES patients(id)
    )
  `);

  await db.run(`
    CREATE TABLE IF NOT EXISTS medicines (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT,
      quantity INTEGER DEFAULT 0,
      price REAL DEFAULT 0,
      unit TEXT DEFAULT 'box',
      supplier TEXT,
      expiryDate DATE,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.run(`
    CREATE TABLE IF NOT EXISTS lab_tests (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price REAL DEFAULT 0,
      category TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.run(`
    CREATE TABLE IF NOT EXISTS lab_orders (
      id TEXT PRIMARY KEY,
      patientId TEXT NOT NULL,
      testIds TEXT,
      doctorName TEXT,
      orderDate TIMESTAMP,
      status TEXT DEFAULT 'pending',
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patientId) REFERENCES patients(id)
    )
  `);

  await db.run(`
    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      patientId TEXT NOT NULL,
      date TIMESTAMP NOT NULL,
      time TEXT,
      reason TEXT,
      status TEXT DEFAULT 'scheduled',
      doctorName TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patientId) REFERENCES patients(id)
    )
  `);

  await db.run(`
    CREATE TABLE IF NOT EXISTS pharmacy_vouchers (
      id TEXT PRIMARY KEY,
      patientId TEXT NOT NULL,
      medicines TEXT,
      totalPrice REAL DEFAULT 0,
      status TEXT DEFAULT 'pending',
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patientId) REFERENCES patients(id)
    )
  `);

  await db.run(`
    CREATE TABLE IF NOT EXISTS etat_besoin (
      id TEXT PRIMARY KEY,
      description TEXT,
      status TEXT DEFAULT 'pending',
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.run(`
    CREATE TABLE IF NOT EXISTS fiche_suivi (
      id TEXT PRIMARY KEY,
      patientId TEXT NOT NULL,
      observations TEXT,
      status TEXT DEFAULT 'ongoing',
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patientId) REFERENCES patients(id)
    )
  `);

  await db.run(`
    CREATE TABLE IF NOT EXISTS hospitalisation (
      id TEXT PRIMARY KEY,
      patientId TEXT NOT NULL,
      admissionDate TIMESTAMP,
      dischargeDate TIMESTAMP,
      reason TEXT,
      ward TEXT,
      status TEXT DEFAULT 'admitted',
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patientId) REFERENCES patients(id)
    )
  `);

  console.log('All tables created (or already exist).');
}

async function seedTestData() {
  const { v4: uuidv4 } = require('uuid');

  const testUser = {
    id: uuidv4(),
    fullName: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    role: 'admin'
  };

  const testPatients = [
    { id: uuidv4(), nom: 'Dupont', prenom: 'Jean', age: 45, telephone: '+242 06 123 4567' },
    { id: uuidv4(), nom: 'Martin', prenom: 'Marie', age: 32, telephone: '+242 06 234 5678' },
    { id: uuidv4(), nom: 'Bernard', prenom: 'Pierre', age: 58, telephone: '+242 06 345 6789' }
  ];

  // Insert user
  await db.run(`
    INSERT INTO users (id, fullName, email, password, role)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT (email) DO NOTHING
  `, [testUser.id, testUser.fullName, testUser.email, testUser.password, testUser.role]);

  for (const patient of testPatients) {
    await db.run(`
      INSERT INTO patients (id, nom, prenom, age, telephone)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT (id) DO NOTHING
    `, [patient.id, patient.nom, patient.prenom, patient.age, patient.telephone]);
  }

  const testMedicines = [
    { id: uuidv4(), name: 'Paracétamol', category: 'Analgésique', quantity: 100, price: 500 },
    { id: uuidv4(), name: 'Amoxicilline', category: 'Antibiotique', quantity: 50, price: 1500 },
    { id: uuidv4(), name: 'Ibuprofène', category: 'Anti-inflammatoire', quantity: 75, price: 800 }
  ];

  for (const med of testMedicines) {
    await db.run(`
      INSERT INTO medicines (id, name, category, quantity, price)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT (id) DO NOTHING
    `, [med.id, med.name, med.category, med.quantity, med.price]);
  }

  const testLabTests = [
    { id: uuidv4(), name: 'Hémogramme', description: 'Hémogramme complet', price: 2630, category: 'Hématologie' },
    { id: uuidv4(), name: 'Glycémie', description: 'Glycémie à jeun', price: 15000, category: 'Biochimie' },
    { id: uuidv4(), name: 'Bilan rénal', description: 'Créatinine, urée', price: 8000, category: 'Biochimie' }
  ];

  for (const t of testLabTests) {
    await db.run(`
      INSERT INTO lab_tests (id, name, description, price, category)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT (id) DO NOTHING
    `, [t.id, t.name, t.description, t.price, t.category]);
  }

  console.log('Test data seeded successfully.');
}

module.exports = {
  initializeSchema,
  seedTestData
};

// Allow running this file directly: `node db/init.js`
if (require.main === module) {
  (async () => {
    try {
      await require('./connection').initDb();
      await initializeSchema();
      await seedTestData();
      console.log('Database initialization and seeding complete.');
      process.exit(0);
    } catch (e) {
      console.error('Database init failed:', e);
      process.exit(1);
    }
  })();
}
