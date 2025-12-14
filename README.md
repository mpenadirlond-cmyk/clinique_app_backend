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
