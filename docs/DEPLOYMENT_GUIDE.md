# 🚀 Deployment Guide - Campus Founders

Complete guide to push code to GitHub and deploy on Vercel.

## 📋 Prerequisites

- Git installed and configured
- GitHub account with access to `https://github.com/Kishore-SR/Campus-Founders`
- Vercel account (free tier works)
- MongoDB Atlas account (for database)
- Stream.io account (for chat/video)

---

## 🔄 Step 1: Push Code to GitHub (Replace Everything)

**⚠️ WARNING: This will completely replace all code in your GitHub repository!**

### Option A: Force Push (Recommended - Clean Slate)

```bash
# Navigate to project root
cd "C:\Users\KSR\Desktop\KSR\MAJOR PROJECT\new-campus-founders"

# Initialize git if not already done (skip if already initialized)
git init

# Add all files
git add .

# Commit all changes
git commit -m "Complete project restructure: Separate frontend and backend with full features"

# Add remote (if not already added)
git remote add origin https://github.com/Kishore-SR/Campus-Founders.git

# OR if remote already exists, update it:
git remote set-url origin https://github.com/Kishore-SR/Campus-Founders.git

# Force push to replace everything on GitHub
git push -f origin main
```

### Option B: Create New Branch First (Safer)

```bash
# Create a backup branch first
git checkout -b backup-old-code
git push origin backup-old-code

# Go back to main
git checkout main

# Then follow Option A steps
```

---

## 🎯 Step 2: Verify GitHub Push

1. Visit: https://github.com/Kishore-SR/Campus-Founders
2. Verify you see:
   - `backend/` folder
   - `frontend/` folder
   - `README.md`
   - `SETUP_GUIDE.md`
   - `AI_ML_FEATURES.md`

---

## 🌐 Step 3: Deploy Backend to Vercel

### 3.1 Create Backend Project on Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import from GitHub: Select `Campus-Founders` repository
4. **Configure Project:**
   - **Root Directory:** `backend`
   - **Framework Preset:** Other
   - **Build Command:** `npm run vercel-build` (or leave empty)
   - **Output Directory:** (leave empty - not needed for serverless)
   - **Install Command:** `npm install`

### 3.2 Set Environment Variables

In Vercel project settings, add these environment variables:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET_KEY=your-super-secret-jwt-key-min-32-chars
STREAM_API_KEY=your-stream-api-key
STREAM_API_SECRET=your-stream-api-secret
NODE_ENV=production
```

**Or use the automated script:**

```bash
cd backend
npm run setup-vercel
```

### 3.3 Deploy Backend

1. Click **"Deploy"**
2. Wait for deployment to complete
3. Note your backend URL (e.g., `https://campus-founders-backend.vercel.app`)

### 3.4 Verify Backend Deployment

Visit: `https://your-backend-url.vercel.app/api/health`

You should see:

```json
{
  "status": "ok",
  "message": "Campus Founders API is running",
  ...
}
```

---

## 🎨 Step 4: Deploy Frontend to Vercel

### 4.1 Create Frontend Project on Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import from GitHub: Select `Campus-Founders` repository (same repo!)
4. **Configure Project:**
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `dist` (auto-detected)
   - **Install Command:** `npm install`

### 4.2 Set Environment Variables

**REQUIRED:**

```
VITE_STREAM_API_KEY=your-stream-api-key
```

This is needed for chat and video call functionality.

**OPTIONAL:**

```
VITE_API_BASE_URL=https://campus-founders-backend.vercel.app/api
```

**Note:** The frontend is already configured to use `https://campus-founders-backend.vercel.app/api` in production mode, so `VITE_API_BASE_URL` is optional. You only need to add it if your backend URL is different.

### 4.3 Deploy Frontend

1. Click **"Deploy"**
2. Wait for deployment to complete
3. Note your frontend URL (e.g., `https://campus-founders.vercel.app`)

---

## ✅ Step 5: Verify Complete Deployment

### 5.1 Test Backend

```bash
# Health check
curl https://campus-founders-backend.vercel.app/api/health

# Root endpoint
curl https://campus-founders-backend.vercel.app/
```

### 5.2 Test Frontend

1. Visit: `https://campus-founders.vercel.app`
2. Try logging in/signing up
3. Check browser console for any errors

### 5.3 Update CORS (if needed)

If you get CORS errors, make sure your backend `api/server.js` includes your frontend URL in the `allowedOrigins` array.

---

## 🔧 Troubleshooting

### Backend Issues

**Problem:** MongoDB connection fails

- **Solution:**
  1. Check MongoDB Atlas IP whitelist (allow `0.0.0.0/0` for Vercel)
  2. Verify `MONGODB_URI` format in Vercel env vars
  3. Run: `cd backend && npm run test-db`

**Problem:** Routes return 404

- **Solution:** Verify `api/server.js` includes all routes (startup, admin, investment)

**Problem:** Serverless function timeout

- **Solution:** Increase timeout in `backend/vercel.json`:
  ```json
  {
    "functions": {
      "api/server.js": {
        "memory": 1024,
        "maxDuration": 30
      }
    }
  }
  ```

### Frontend Issues

**Problem:** API calls fail

- **Solution:**
  1. Check `frontend/src/lib/axios.js` has correct backend URL
  2. Verify backend CORS settings include frontend URL
  3. Check browser console for errors

**Problem:** Build fails

- **Solution:**
  1. Run `cd frontend && npm install`
  2. Run `npm run build` locally to see errors
  3. Fix any import/dependency issues

---

## 📝 Project Structure

```
new-campus-founders/
├── backend/
│   ├── api/
│   │   └── server.js          # Vercel serverless entry point
│   ├── src/
│   │   ├── server.js          # Local development server
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── models/
│   │   └── lib/
│   ├── vercel.json            # Vercel configuration
│   └── package.json
├── frontend/
│   ├── src/
│   ├── vercel.json            # Vercel configuration
│   └── package.json
├── README.md
├── SETUP_GUIDE.md
└── AI_ML_FEATURES.md
```

---

## 🎉 Success Checklist

- [ ] Code pushed to GitHub successfully
- [ ] Backend deployed on Vercel
- [ ] Backend health check passes
- [ ] Frontend deployed on Vercel
- [ ] Frontend loads without errors
- [ ] Login/Signup works
- [ ] API calls from frontend to backend work
- [ ] No CORS errors in browser console

---

## 🔗 Important URLs

- **GitHub Repo:** https://github.com/Kishore-SR/Campus-Founders
- **Frontend (Expected):** https://campus-founders.vercel.app
- **Backend (Expected):** https://campus-founders-backend.vercel.app

---

## 📞 Need Help?

1. Check `SETUP_GUIDE.md` for detailed setup instructions
2. Check `AI_ML_FEATURES.md` for AI/ML feature documentation
3. Review Vercel deployment logs for errors
4. Check MongoDB Atlas connection logs

---

**Last Updated:** $(date)
**Project:** Campus Founders - Major Project 2022-2026
