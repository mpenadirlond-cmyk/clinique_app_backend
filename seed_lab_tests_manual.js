const models = require('./db/models');
const db = require('./db/connection');

async function seed() {
  try {
    await db.initDb();
    const existing = await models.getLabTests();
    if (existing && existing.length > 0) {
      console.log('Lab tests already present, skipping manual seed.');
      process.exit(0);
    }
    console.log('Seeding lab tests (manual)...');
    await models.createLabTest({ name: 'Hémogramme', description: 'Hémogramme complet', price: 263, category: 'Hématologie' });
    await models.createLabTest({ name: 'Glycémie', description: 'Glycémie à jeun', price: 150, category: 'Biochimie' });
    await models.createLabTest({ name: 'Bilan rénal', description: 'Créatinine, urée', price: 800, category: 'Biochimie' });
    console.log('Manual seed complete.');
    process.exit(0);
  } catch (e) {
    console.error('Manual seed failed:', e);
    process.exit(1);
  }
}

seed();
