const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Create db directory if it doesn't exist
const dbDir = path.join(__dirname, '../..');
const dbFile = path.join(dbDir, 'clinique.db');

console.log(`Creating database at: ${dbFile}`);

const db = new sqlite3.Database(dbFile, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }
  console.log('Connected to SQLite database.');
  initializeSchema();
});

function initializeSchema() {
  db.serialize(() => {
    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        fullName TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Patients table
    db.run(`
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
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Consultations table
    db.run(`
      CREATE TABLE IF NOT EXISTS consultations (
        id TEXT PRIMARY KEY,
        patientId TEXT NOT NULL,
        date DATETIME,
        motifConsultation TEXT,
        taille REAL,
        poids REAL,
        tension TEXT,
        temperature REAL,
        diagnostic TEXT,
        traitement TEXT,
        doctorName TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patientId) REFERENCES patients(id)
      )
    `);

    // Bon Sortie table
    db.run(`
      CREATE TABLE IF NOT EXISTS bon_sortie (
        id TEXT PRIMARY KEY,
        patientId TEXT NOT NULL,
        montant REAL NOT NULL,
        montantLettres TEXT,
        motif TEXT,
        date DATETIME,
        caisse TEXT,
        administration TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patientId) REFERENCES patients(id)
      )
    `);

    // Medicine table
    db.run(`
      CREATE TABLE IF NOT EXISTS medicines (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT,
        quantity INTEGER DEFAULT 0,
        price REAL DEFAULT 0,
        unit TEXT DEFAULT 'box',
        supplier TEXT,
        expiryDate DATE,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Lab Tests table
    db.run(`
      CREATE TABLE IF NOT EXISTS lab_tests (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        price REAL DEFAULT 0,
        category TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Lab Orders table
    db.run(`
      CREATE TABLE IF NOT EXISTS lab_orders (
        id TEXT PRIMARY KEY,
        patientId TEXT NOT NULL,
        testIds TEXT,
        doctorName TEXT,
        orderDate DATETIME,
        status TEXT DEFAULT 'pending',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patientId) REFERENCES patients(id)
      )
    `);

    // Appointment table
    db.run(`
      CREATE TABLE IF NOT EXISTS appointments (
        id TEXT PRIMARY KEY,
        patientId TEXT NOT NULL,
        date DATETIME NOT NULL,
        time TEXT,
        reason TEXT,
        status TEXT DEFAULT 'scheduled',
        doctorName TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patientId) REFERENCES patients(id)
      )
    `);

    // Pharmacy Vouchers table
    db.run(`
      CREATE TABLE IF NOT EXISTS pharmacy_vouchers (
        id TEXT PRIMARY KEY,
        patientId TEXT NOT NULL,
        medicines TEXT,
        totalPrice REAL DEFAULT 0,
        status TEXT DEFAULT 'pending',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patientId) REFERENCES patients(id)
      )
    `);

    // Etat Besoin (Need State) table
    db.run(`
      CREATE TABLE IF NOT EXISTS etat_besoin (
        id TEXT PRIMARY KEY,
        description TEXT,
        status TEXT DEFAULT 'pending',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Fiche Suivi (Follow-up Sheet) table
    db.run(`
      CREATE TABLE IF NOT EXISTS fiche_suivi (
        id TEXT PRIMARY KEY,
        patientId TEXT NOT NULL,
        observations TEXT,
        status TEXT DEFAULT 'ongoing',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patientId) REFERENCES patients(id)
      )
    `);

    // Hospitalisation table
    db.run(`
      CREATE TABLE IF NOT EXISTS hospitalisation (
        id TEXT PRIMARY KEY,
        patientId TEXT NOT NULL,
        admissionDate DATETIME,
        dischargeDate DATETIME,
        reason TEXT,
        ward TEXT,
        status TEXT DEFAULT 'admitted',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patientId) REFERENCES patients(id)
      )
    `, () => {
      console.log('All tables created successfully.');
      seedTestData();
    });
  });
}

function seedTestData() {
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

  // If DATABASE_URL is set, use the shared db connection (Postgres); otherwise use sqlite3 commands above
  if (process.env.DATABASE_URL) {
    const dbShared = require('./connection');
    (async () => {
      try {
        // Insert user using ON CONFLICT on email
        await dbShared.run(`INSERT INTO users (id, fullName, email, password, role) VALUES (?, ?, ?, ?, ?) ON CONFLICT (email) DO NOTHING`, [testUser.id, testUser.fullName, testUser.email, testUser.password, testUser.role]);

        // Insert patients
        for (const patient of testPatients) {
          await dbShared.run(`INSERT INTO patients (id, nom, prenom, age, telephone) VALUES (?, ?, ?, ?, ?) ON CONFLICT (id) DO NOTHING`, [patient.id, patient.nom, patient.prenom, patient.age, patient.telephone]);
        }

        const testMedicines = [
          { id: uuidv4(), name: 'Paracétamol', category: 'Analgésique', quantity: 100, price: 500 },
          { id: uuidv4(), name: 'Amoxicilline', category: 'Antibiotique', quantity: 50, price: 1500 },
          { id: uuidv4(), name: 'Ibuprofène', category: 'Anti-inflammatoire', quantity: 75, price: 800 }
        ];

        for (const med of testMedicines) {
          await dbShared.run(`INSERT INTO medicines (id, name, category, quantity, price) VALUES (?, ?, ?, ?, ?) ON CONFLICT (id) DO NOTHING`, [med.id, med.name, med.category, med.quantity, med.price]);
        }

        const testLabTests = [
          { id: uuidv4(), name: 'Hémogramme', description: 'Hémogramme complet', price: 263, category: 'Hématologie' },
          { id: uuidv4(), name: 'Glycémie', description: 'Glycémie à jeun', price: 150, category: 'Biochimie' },
          { id: uuidv4(), name: 'Bilan rénal', description: 'Créatinine, urée', price: 800, category: 'Biochimie' }
        ];

        for (const t of testLabTests) {
          await dbShared.run(`INSERT INTO lab_tests (id, name, description, price, category) VALUES (?, ?, ?, ?, ?) ON CONFLICT (id) DO NOTHING`, [t.id, t.name, t.description, t.price, t.category]);
        }

        console.log('Test data seeded successfully.');
      } catch (e) {
        console.error('Seeding failed:', e);
      } finally {
        process.exit(0);
      }
    })();
    return;
  }

  // sqlite path (no DATABASE_URL)
  db.serialize(() => {
    // Insert test user
    db.run(`
      INSERT OR IGNORE INTO users (id, fullName, email, password, role)
      VALUES (?, ?, ?, ?, ?)
    `, [testUser.id, testUser.fullName, testUser.email, testUser.password, testUser.role]);

    // Insert test patients
    testPatients.forEach(patient => {
      db.run(`
        INSERT OR IGNORE INTO patients (id, nom, prenom, age, telephone)
        VALUES (?, ?, ?, ?, ?)
      `, [patient.id, patient.nom, patient.prenom, patient.age, patient.telephone]);
    });

    // Insert test medicines
    const testMedicines = [
      { id: uuidv4(), name: 'Paracétamol', category: 'Analgésique', quantity: 100, price: 500 },
      { id: uuidv4(), name: 'Amoxicilline', category: 'Antibiotique', quantity: 50, price: 1500 },
      { id: uuidv4(), name: 'Ibuprofène', category: 'Anti-inflammatoire', quantity: 75, price: 800 }
    ];

    testMedicines.forEach(med => {
      db.run(`
        INSERT OR IGNORE INTO medicines (id, name, category, quantity, price)
        VALUES (?, ?, ?, ?, ?)
      `, [med.id, med.name, med.category, med.quantity, med.price]);
    });

    // Insert test lab tests (examens)
    const testLabTests = [
      { id: uuidv4(), name: 'Hémogramme', description: 'Hémogramme complet', price: 263, category: 'Hématologie' },
      { id: uuidv4(), name: 'Glycémie', description: 'Glycémie à jeun', price: 150, category: 'Biochimie' },
      { id: uuidv4(), name: 'Bilan rénal', description: 'Créatinine, urée', price: 800, category: 'Biochimie' }
    ];

    testLabTests.forEach(t => {
      db.run(`
        INSERT OR IGNORE INTO lab_tests (id, name, description, price, category)
        VALUES (?, ?, ?, ?, ?)
      `, [t.id, t.name, t.description, t.price, t.category]);
    });

    console.log('Test data seeded successfully.');
    db.close();
    process.exit(0);
  });
}
