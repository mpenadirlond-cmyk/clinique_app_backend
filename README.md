# Clinique API Backend

Node.js Express backend for Clinique Salvatrice app with SQLite database.

## Setup

1. **Install dependencies**:

   ```bash
   cd backend
   npm install
   ```

2. **Initialize database** (creates tables and seeds test data):

   ```bash
   npm run db:init
   ```

3. **Start the server**:
   ```bash
   npm start
   # or for development with auto-reload:
   npm run dev
   ```

The API will be available at `http://localhost:3000`

## API Endpoints

### Patients

- `POST /patients` - Create patient
- `GET /patients` - List all patients
- `GET /patients/:id` - Get patient by ID
- `PUT /patients/:id` - Update patient
- `DELETE /patients/:id` - Delete patient

### Consultations

- `POST /consultations` - Create consultation
- `GET /consultations` - List all consultations
- `GET /consultations/patient/:patientId` - Get consultations for patient
- `PUT /consultations/:id` - Update consultation
- `DELETE /consultations/:id` - Delete consultation

### Bon Sortie

- `POST /bon_sortie` - Create bon sortie
- `GET /bon_sortie` - List all
- `GET /bon_sortie/:id` - Get by ID
- `GET /bon_sortie/patient/:patientId` - Get by patient
- `PUT /bon_sortie/:id` - Update
- `DELETE /bon_sortie/:id` - Delete

### Medicines

- `POST /medicines` - Create medicine
- `GET /medicines` - List all
- `GET /medicines/:id` - Get by ID
- `PUT /medicines/:id` - Update
- `DELETE /medicines/:id` - Delete

### Lab Tests

- `POST /lab_tests` - Create lab test
- `GET /lab_tests` - List all
- `GET /lab_tests/:id` - Get by ID
- `PUT /lab_tests/:id` - Update
- `DELETE /lab_tests/:id` - Delete

### Lab Orders

- `POST /lab_orders` - Create lab order
- `GET /lab_orders` - List all
- `GET /lab_orders/:id` - Get by ID
- `PUT /lab_orders/:id` - Update

### Appointments

- `POST /appointments` - Create appointment
- `GET /appointments` - List all
- `GET /appointments/patient/:patientId` - Get by patient
- `PUT /appointments/:id` - Update
- `DELETE /appointments/:id` - Delete

### Pharmacy Vouchers

- `POST /vouchers` - Create voucher
- `GET /vouchers` - List all
- `GET /vouchers/patient/:patientId` - Get by patient
- `PUT /vouchers/:id` - Update

### Etat Besoin

- `POST /etat_besoin` - Create
- `GET /etat_besoin` - List all
- `PUT /etat_besoin/:id` - Update

### Fiche Suivi

- `POST /fiche_suivi` - Create
- `GET /fiche_suivi` - List all
- `GET /fiche_suivi/patient/:patientId` - Get by patient
- `PUT /fiche_suivi/:id` - Update

### Hospitalisation

- `POST /hospitalisation` - Create
- `GET /hospitalisation` - List all
- `GET /hospitalisation/patient/:patientId` - Get by patient
- `PUT /hospitalisation/:id` - Update

## Environment Variables

Create a `.env` file in the backend directory:

```
PORT=3000
NODE_ENV=development
```

## Database

SQLite database is stored at the project root as `clinique.db`. All tables are automatically created on first run.

## Déploiement sur Render — Problèmes courants

Si votre déploiement Render échoue avec une erreur liée à `sqlite3` (ex: "invalid ELF header" ou `ERR_DLOPEN_FAILED`), c'est généralement dû à un binaire précompilé incompatible avec l'image Linux utilisée par Render. Solutions recommandées :

- Option 1 — Rebuild `sqlite3` sur l'instance (appliqué automatiquement) :

  - Le fichier `package.json` inclut désormais un script `postinstall` qui tente de reconstruire `sqlite3` depuis les sources pendant l'installation (`npm rebuild sqlite3 --build-from-source`).
  - Assurez-vous dans le tableau de bord Render que la version Node est compatible (recommandé `18.x` — voir `engines` dans `package.json`).

- Option 2 — Utiliser une base distante (recommandé pour production) :

  - Préférez PostgreSQL (Neon, Render Postgres, Railway, etc.) pour les services déployés sur Render plutôt que SQLite, car SQLite dépend d'un fichier local et de binaires natifs.
  - Pour cela : migrez la logique DB vers Postgres (ou utilisez `backend_api` qui attend `DATABASE_URL`) et définissez la variable d'environnement `DATABASE_URL` dans les settings du service Render.

- Option 3 — Forcer une image d'exécution différente / builder personnalisé :
  - Si vous avez des besoins spécifiques, créez un `Dockerfile` pour construire l'image et compiler les modules natifs, puis déployez via Render en utilisant votre Dockerfile.

Conseils pratiques :

- Dans Render Service → Settings, définissez la version Node à `18.x` (ou celle indiquée dans `package.json`).
- Vérifiez les logs de déploiement pour la sortie de `npm rebuild sqlite3` si le `postinstall` s'exécute.
- Si le rebuild échoue et que vous n'avez pas besoin de SQLite en production, migrez vers Postgres et mettez à jour votre code pour utiliser `DATABASE_URL`.

### Migration vers Postgres (recommandé)

1. Créez une base Postgres via Render (Add -> Database) ou utilisez Neon / Railway.
2. Dans votre Service Render -> Environment, ajoutez `DATABASE_URL` avec la chaîne de connexion fournie.
3. Déployez ou redéployez le service. Le backend détecte automatiquement `DATABASE_URL` et utilisera Postgres.
4. Pour initialiser les tables et seeder des données de test, exécutez localement ou sur l'instance :

```bash
# local (après avoir exporté DATABASE_URL)
cd backend
npm run db:init:pg
```

Sur Render, vous pouvez exécuter un job ou temporairement lancer la commande via un shell pour appeler `npm run db:init:pg` si Render le permet pour votre plan.

Si vous préférez garder SQLite en local mais Postgres en production, ne changez rien en local et ajoutez seulement `DATABASE_URL` sur Render.

### Notes

- Le projet contient maintenant `backend/db/init_postgres.js` pour créer les tables Postgres automatiquement.
- `backend/db/connection.js` bascule automatiquement vers Postgres quand `DATABASE_URL` est défini.
