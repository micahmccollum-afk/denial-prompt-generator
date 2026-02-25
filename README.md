# Denial Prompt Generator

Storesight tool for generating and managing empathetic denial prompts sent to crowd users.

## Features

- **Generator** – Browse and copy denial reasons by category, with inline editing before copy
- **Admin** – Add, edit, and delete categories and keywords; manage denial templates

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment (Vercel + Firebase)

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/denial-prompt-generator.git
git push -u origin main
```

### 2. Create Firebase project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a project (or use an existing one)
3. Enable **Firestore Database**
4. Create a database (start in test mode, then add security rules)
5. Go to **Project Settings** → **Service Accounts** → **Generate new private key**
6. From the downloaded JSON, copy:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (paste the full key including `-----BEGIN...-----END-----`)

### 3. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. **Add New** → **Project** → Import your `denial-prompt-generator` repo
3. Before deploying, add **Environment Variables**:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY` (paste the full private key)
4. Deploy

Admin edits will be stored in Firestore and persist across deploys. Without Firebase env vars, admin edits will fail on Vercel (the filesystem is read-only).

## Local without Firebase

Without Firebase env vars, the app uses `data/denial-prompts.json` for storage. Admin edits work locally. Add `.env.local` with the Firebase vars to use Firestore locally.
