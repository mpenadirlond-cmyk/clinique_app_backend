Guide rapide : utiliser Neon (neon.tech) avec ce backend

1. Créer un projet Neon

- Allez sur https://neon.tech, créez un projet et une base.

2. Récupérer la chaîne de connexion

- Dans Neon → Project → Client → Connection string (libpq ou standard). Copiez exactement l'URI.

3. Ajouter `DATABASE_URL` sur Render (ou `.env` local)

- Sur Render (Service backend) → Settings → Environment → Add Environment Variable

  - KEY: `DATABASE_URL`
  - VALUE: (collez l'URI fourni par Neon)

- Localement, pour tests, créez un fichier `backend/.env` :

```
DATABASE_URL=postgresql://user:password@host:5432/dbname
```

4. SSL

- Neon utilise TLS. Le fichier `db/connection.js` du projet active `ssl: { rejectUnauthorized: false }` automatiquement lorsqu'il détecte que l'URL n'est pas `localhost` ou `127.0.0.1`.
- Aucune autre modification nécessaire côté code pour la plupart des déploiements.

5. Tester localement

- Installez `pg` si besoin et testez :

```powershell
cd backend
# si nécessaire
npm install pg

# test rapide (assurez-vous d'avoir DATABASE_URL en variable d'env)
node -e "const { Pool } = require('pg'); const p=new Pool({connectionString:process.env.DATABASE_URL, ssl:{rejectUnauthorized:false}}); p.query('SELECT 1').then(()=>console.log('OK')).catch(e=>console.error(e)).finally(()=>p.end())"
```

6. Déployer

- Déployez le service sur Render et ajoutez la variable `DATABASE_URL` (URI Neon). Redéployez (Manual Deploy → Clear build cache & deploy).
- Sur la première connexion Neon peut prendre quelques secondes; surveillez les logs et relancez le déploiement si nécessaire.

Remarques

- Ne laissez jamais d'URL `localhost` en production.
- Neon recommande de limiter le nombre de connexions simultanées; le `Pool` fourni par `pg` est adapté à un service persistant (comme Render). Si vous utilisez un environnement serverless, considérez les recommandations Neon spécifiques.
