# LoadMaster - Calculateur de Charge

Application de calcul de charge intelligente développée avec React, TypeScript et Vite.

## 🚀 Déploiement sur Vercel

### Option 1: Via l'interface Vercel (Recommandé)

1. Allez sur [vercel.com](https://vercel.com)
2. Connectez-vous avec votre compte GitHub
3. Cliquez sur "Add New Project"
4. Importez le dépôt `xrmdcr/COACH`
5. Vercel détectera automatiquement la configuration Vite
6. **Important**: Ajoutez la variable d'environnement :
   - `GEMINI_API_KEY` = votre clé API Gemini
7. Cliquez sur "Deploy"

### Option 2: Via CLI Vercel

```bash
# Installer la CLI Vercel
npm i -g vercel

# Déployer
vercel --prod
```

Configurez la variable d'environnement `GEMINI_API_KEY` via :
```bash
vercel env add GEMINI_API_KEY
```

## 🛠️ Développement local

### Installation

```bash
npm install
```

### Configuration

Créez un fichier `.env.local` à la racine :
```env
GEMINI_API_KEY=votre_clé_api_ici
```

### Lancer le serveur

```bash
npm run dev
```

L'application sera sur `http://localhost:3000`

## 📦 Build de production

```bash
npm run build
npm run preview
```

## 🔧 Stack technique

- React 19 + TypeScript
- Vite 6
- Tailwind CSS
- Framer Motion
- Google Gemini API

## 🌐 Application déployée

Une fois déployée : `https://coach-xxxx.vercel.app`

## Lien AI Studio

View app in AI Studio: https://ai.studio/apps/drive/1kW0DGy0tM219ZhUORvnnezycAUeuXyfT
