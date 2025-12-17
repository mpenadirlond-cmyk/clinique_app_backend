const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL not set. Aborting Postgres init.');
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function run() {
  try {
    // Create tables (equivalent to SQLite schema but adapted for Postgres)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        fullname TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS patients (
        id TEXT PRIMARY KEY,
        nom TEXT NOT NULL,
        postnom TEXT,
        prenom TEXT,
        sexe TEXT,
        age INTEGER,
        adresse TEXT,
        telephone TEXT,
        etatcivil TEXT,
        profession TEXT,
        lieuorigine TEXT,
        createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS consultations (
        id TEXT PRIMARY KEY,
        patientid TEXT NOT NULL,
        date TIMESTAMP,
        motifconsultation TEXT,
        taille REAL,
        poids REAL,
        tension TEXT,
        temperature REAL,
        diagnostic TEXT,
        traitement TEXT,
        doctorname TEXT,
        createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patientid) REFERENCES patients(id)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS bon_sortie (
        id TEXT PRIMARY KEY,
        patientid TEXT NOT NULL,
        montant REAL NOT NULL,
        montantlettres TEXT,
        motif TEXT,
        date TIMESTAMP,
        caisse TEXT,
        administration TEXT,
        createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patientid) REFERENCES patients(id)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS medicines (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT,
        quantity INTEGER DEFAULT 0,
        price REAL DEFAULT 0,
        unit TEXT DEFAULT 'box',
        supplier TEXT,
        expirydate DATE,
        createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS lab_tests (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        price REAL DEFAULT 0,
        category TEXT,
        createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS lab_orders (
        id TEXT PRIMARY KEY,
        patientid TEXT NOT NULL,
        testids TEXT,
        doctorname TEXT,
        orderdate TIMESTAMP,
        status TEXT DEFAULT 'pending',
        createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patientid) REFERENCES patients(id)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id TEXT PRIMARY KEY,
        patientid TEXT NOT NULL,
        date TIMESTAMP NOT NULL,
        time TEXT,
        reason TEXT,
        status TEXT DEFAULT 'scheduled',
        doctorname TEXT,
        createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patientid) REFERENCES patients(id)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS pharmacy_vouchers (
        id TEXT PRIMARY KEY,
        patientid TEXT NOT NULL,
        medicines TEXT,
        totalprice REAL DEFAULT 0,
        status TEXT DEFAULT 'pending',
        createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patientid) REFERENCES patients(id)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS etat_besoin (
        id TEXT PRIMARY KEY,
        description TEXT,
        status TEXT DEFAULT 'pending',
        createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS fiche_suivi (
        id TEXT PRIMARY KEY,
        patientid TEXT NOT NULL,
        observations TEXT,
        status TEXT DEFAULT 'ongoing',
        createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patientid) REFERENCES patients(id)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS hospitalisation (
        id TEXT PRIMARY KEY,
        patientid TEXT NOT NULL,
        admissiondate TIMESTAMP,
        dischargdate TIMESTAMP,
        reason TEXT,
        ward TEXT,
        status TEXT DEFAULT 'admitted',
        createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patientid) REFERENCES patients(id)
      );
    `);

    console.log('All Postgres tables created or verified. Seeding test data...');

    // Seed minimal test data
    const testUserId = uuidv4();
    await pool.query(
      `INSERT INTO users (id, fullname, email, password, role) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (id) DO NOTHING`,
      [testUserId, 'Test User', 'test@example.com', 'password123', 'admin']
    );

    // Close
    await pool.end();
    console.log('Postgres init complete.');
    process.exit(0);
  } catch (e) {
    console.error('Error initializing Postgres schema', e);
    process.exit(1);
  }
}

run();
