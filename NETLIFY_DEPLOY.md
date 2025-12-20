# Déploiement Netlify automatique

Ce dépôt contient un workflow GitHub Actions qui build le front Flutter Web et le déploie automatiquement sur Netlify lorsque vous poussez sur la branche `main`.

Étapes à suivre (nécessaires) :

1. Pousser le dépôt vers GitHub et activer Actions pour le repo.

2. Dans les `Settings > Secrets and variables > Actions` du dépôt GitHub, ajoutez les secrets suivants :

   - `NETLIFY_AUTH_TOKEN` : votre token Netlify (Personal access token) — créez-le depuis https://app.netlify.com/user/applications#personal-access-tokens
   - `NETLIFY_SITE_ID` : l'ID du site Netlify (disponible dans les settings du site, ou via l'URL d'API Netlify)
   - `API_URL` (optionnel) : l'URL de votre backend (utilisé par `flutter build web` via `--dart-define`)

3. Poussez sur `main` :

```bash
git add .github/workflows/deploy-netlify.yml
git commit -m "Add Netlify deploy workflow"
git push origin main
```

Le workflow :

- installe Flutter
- exécute `flutter build web --release --dart-define=API_URL=...`
- déploie `build/web` vers Netlify en production via `netlify-cli`

Comment récupérer le lien du site :

- Si vous avez déjà créé un site Netlify et avez mis son `NETLIFY_SITE_ID`, le déploiement mettra à jour ce site existant. Le lien est celui configuré dans votre site Netlify (ex. `https://votre-site.netlify.app`).
- Si vous préférez que Netlify crée automatiquement le site à la première push, connectez GitHub au projet Netlify via l'UI Netlify (ce processus crée aussi un site et un `SITE_ID`).

Si vous voulez, je peux :

- vous générer une commande `npx netlify-cli` pour déployer localement,
- ou vous guider pour créer le token et récupérer le `SITE_ID` pas à pas.
