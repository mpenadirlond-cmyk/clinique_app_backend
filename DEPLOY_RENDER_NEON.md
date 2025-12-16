Déploiement du backend sur Render avec une base Neon

1. Créer une base de données sur Neon

   - Dans Neon, créez un projet et une base de données.
   - Copiez la chaîne de connexion (connection string). Exemple : postgres://user:pass@host:5432/dbname

2. Configurer Render

   - Dans Render, créez un nouveau service Web (Node) ou utilisez ce dépôt avec `render.yaml`.
   - Build command: `cd backend && npm install`
   - Start command: `cd backend && npm start`
   - Dans les Environment Variables du service, ajoutez `DATABASE_URL` avec la valeur fournie par Neon.
   - Render injecte automatiquement `PORT` ; notre serveur écoute `process.env.PORT`.

3. Points techniques

   - Le fichier `backend/db/connection.js` active SSL automatiquement pour les connexions distantes et utilise `rejectUnauthorized: false` pour compatibilité avec les certificats fournis par certains hosts.
   - Ne mettez jamais la `DATABASE_URL` en clair dans le dépôt.

4. Test local rapide
   - Du dossier `backend` :

```bash
npm install
# Créer la variable d'environnement localement, puis :
export DATABASE_URL="postgres://..."
npm run db:init
npm start
```

5. Besoin d'aide ?
   - Si vous voulez, je peux :
     - créer le secret `DATABASE_URL` sur Render (je peux générer les commandes à exécuter),
     - valider la connexion Neon et ajuster `connection.js` pour vérifier le CA si vous avez un certificat.
