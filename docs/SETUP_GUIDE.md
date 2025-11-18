# 🚀 Campus Founders - Complete Setup Guide

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Clone the Repository](#clone-the-repository)
3. [Environment Variables Setup](#environment-variables-setup)
4. [MongoDB Atlas Setup](#mongodb-atlas-setup)
5. [Stream API Setup](#stream-api-setup)
6. [Installation & Running](#installation--running)
7. [Project Flow](#project-flow)
8. [Admin Approval System](#admin-approval-system)
9. [AI Features Overview](#ai-features-overview)
10. [Quick Start Checklist](#quick-start-checklist)

---

## 📦 Prerequisites

Before starting, ensure you have:

- ✅ **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- ✅ **npm** (comes with Node.js)
- ✅ **Git** - [Download](https://git-scm.com/)
- ✅ **MongoDB Atlas Account** (free tier available)
- ✅ **Stream Account** (free tier available)
- ✅ **Code Editor** (VS Code recommended)

---

## 🔄 Clone the Repository

```bash
# Clone the repository
git clone https://github.com/Kishore-SR/Campus-Founders.git
cd Campus-Founders
```

**Repository Structure:**

```
Campus-Founders/
├── backend/          # Node.js/Express backend
├── frontend/         # React frontend
└── README.md
```

---

## 🔐 Environment Variables Setup

### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
cd backend
touch .env
```

**Required Variables:**

```env
# MongoDB Connection String
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority

# JWT Secret Key (generate a random string)
JWT_SECRET_KEY=your-super-secret-jwt-key-min-32-characters-long

# Stream API Credentials (for chat/video)
STREAM_API_KEY=your-stream-api-key
STREAM_API_SECRET=your-stream-api-secret

# Server Port (optional, defaults to 5001)
PORT=5001
```

### Frontend Environment Variables

Create a `.env` file in the `frontend/` directory:

```bash
cd frontend
touch .env
```

**Required Variables:**

```env
# Backend API URL (for development)
VITE_API_BASE_URL=http://localhost:5001/api
```

**Note:** For production, update the API URL in `frontend/src/lib/axios.js`

---

## 🗄️ MongoDB Atlas Setup

### Step 1: Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for a free account
3. Verify your email

### Step 2: Create a Cluster

1. **Click "Build a Database"**
2. **Choose Free Tier (M0)**
3. **Select Cloud Provider & Region** (choose closest to you)
4. **Click "Create"** (takes 3-5 minutes)

### Step 3: Create Database User

1. Go to **"Database Access"** (left sidebar)
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Enter username and password (save these!)
5. Set privileges to **"Read and write to any database"**
6. Click **"Add User"**

### Step 4: Whitelist IP Address

1. Go to **"Network Access"** (left sidebar)
2. Click **"Add IP Address"**
3. For development: Click **"Allow Access from Anywhere"** (0.0.0.0/0)
4. For production: Add specific IPs
5. Click **"Confirm"**

### Step 5: Get Connection String

1. Go to **"Database"** (left sidebar)
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Replace `<dbname>` with your database name (e.g., `campus-founders`)

**Example Connection String:**

```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/campus-founders?retryWrites=true&w=majority
```

### Step 6: Add to Backend .env

```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/campus-founders?retryWrites=true&w=majority
```

**🔗 Useful Links:**

- [MongoDB Atlas Dashboard](https://cloud.mongodb.com/)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Connection String Guide](https://docs.atlas.mongodb.com/tutorial/connect-to-your-cluster/)

---

## 💬 Stream API Setup

### Step 1: Create Stream Account

1. Go to [Stream Dashboard](https://getstream.io/dashboard/)
2. Sign up for a free account
3. Verify your email

### Step 2: Create Application

1. **Click "Create App"** or **"New App"**
2. **Enter App Name**: `Campus Founders`
3. **Select Region**: Choose closest to you
4. **Click "Create App"**

### Step 3: Get API Credentials

1. Go to your app dashboard
2. Find **"API Keys"** section
3. Copy:
   - **API Key** (starts with something like `abc123`)
   - **API Secret** (click "Show" to reveal)

### Step 4: Add to Backend .env

```env
STREAM_API_KEY=your-api-key-here
STREAM_API_SECRET=your-api-secret-here
```

**🔗 Useful Links:**

- [Stream Dashboard](https://getstream.io/dashboard/)
- [Stream Documentation](https://getstream.io/chat/docs/)
- [Stream React SDK](https://getstream.io/chat/docs/react/)

---

## 📦 Installation & Running

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Install nodemon as dev dependency (if not already installed)
npm install --save-dev nodemon

# Verify installation
npm list nodemon
```

**Start Backend Server:**

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

**Backend runs on:** `http://localhost:5001`

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

**Frontend runs on:** `http://localhost:5173` (or port shown in terminal)

### Verify Setup

1. **Backend**: Open `http://localhost:5001/api/health` (if health endpoint exists)
2. **Frontend**: Open `http://localhost:5173` in browser
3. **Check Console**: No errors should appear

---

## 🔄 Project Flow

### User Registration & Onboarding

```
1. User visits Signup Page
   ↓
2. Enters: email, username, password, role (student/investor/normal)
   ↓
3. Receives OTP via EmailJS
   ↓
4. Verifies OTP
   ↓
5. Completes Onboarding:
   - Student: Bio, location, current focus
   - Investor: Bio, firm, investment domains, ticket size
   ↓
6. Redirected to HomePage
```

### Student Founder Flow

```
1. Login as Student
   ↓
2. Go to Profile Page
   ↓
3. Create Startup:
   - Name, tagline, description
   - Category, stage
   - Logo, website URL
   - Team members
   ↓
4. Submit for Admin Approval
   ↓
5. Admin Reviews & Approves/Rejects
   ↓
6. If Approved:
   - Startup appears on /startups page
   - Gets AI-generated tags
   - Gets investment potential score
   ↓
7. Investors can:
   - View startup
   - Upvote
   - Add reviews
   - Send connection requests
   ↓
8. Founder receives connection requests
   ↓
9. Founder accepts → Can chat/video call
```

### Investor Flow

```
1. Login as Investor
   ↓
2. Complete Onboarding (investment domains, etc.)
   ↓
3. Admin Verifies Investor Account
   ↓
4. Once Verified:
   - Can browse startups
   - Get AI-powered recommendations
   - View compatibility scores
   ↓
5. Browse Startups:
   - Use regular search
   - Use AI semantic search
   - Filter by category
   ↓
6. View Startup Details:
   - See full description
   - Read reviews (with sentiment analysis)
   - Check investment potential score
   ↓
7. Actions:
   - Upvote startup
   - Add review (auto-analyzed for sentiment)
   - Send connection request
   - Invest (if approved)
   ↓
8. Connect with Founders:
   - Send friend request
   - Chat after acceptance
   - Video call
```

### Normal User Flow

```
1. Signup/Login
   ↓
2. Browse Startups:
   - View all approved startups
   - Use AI search
   - Filter by category
   ↓
3. Engage:
   - Upvote startups
   - Add reviews
   - View AI-generated summaries
```

---

## 👨‍💼 Admin Approval System

### Admin Login

1. **Navigate to:** `/admin/login`
2. **Default Credentials:**
   - Username: `cosmic`
   - Password: `123456`
3. **After Login:** Redirected to admin dashboard

### Startup Approval Process

```
1. Student creates startup → Status: "draft"
   ↓
2. Student clicks "Submit for Approval" → Status: "pending"
   ↓
3. Admin goes to Admin Dashboard → Admin Startups Page
   ↓
4. Admin sees pending startups:
   - Startup name, category, stage
   - Owner details
   - Full description
   - Logo, website
   ↓
5. Admin Actions:
   - ✅ Approve → Status: "approved"
     → Startup appears on /startups page
     → Gets AI tags & investment score
   - ❌ Reject → Status: "rejected"
     → Admin enters rejection reason
     → Student sees reason on profile
   ↓
6. Student receives notification (if implemented)
```

### Investor Verification Process

```
1. User signs up as Investor → Status: "pending"
   ↓
2. Completes onboarding with:
   - Firm name
   - Investment domains
   - Ticket size
   - LinkedIn URL
   ↓
3. Admin goes to Admin Dashboard → Admin Investors Page
   ↓
4. Admin sees pending investors:
   - Profile info
   - Firm details
   - Investment domains
   - LinkedIn profile
   ↓
5. Admin Actions:
   - ✅ Approve → Status: "approved"
     → Investor can use all features
     → Gets AI recommendations
   - ❌ Reject → Status: "rejected"
     → Admin enters rejection reason
     → Investor cannot use platform
   ↓
6. Verified investors get:
   - "Verified" badge
   - Access to investment features
   - AI-powered recommendations
```

### Admin Dashboard Features

- **Statistics:**
  - Total users (students, investors, normal)
  - Total startups (pending, approved, rejected)
  - Pending investor verifications
- **Quick Actions:**
  - Approve/Reject startups
  - Verify investors
  - View all users
  - Monitor platform activity

---

## 🤖 AI Features Overview

### 1. AI-Powered Recommendations

**How it Works:**

- Analyzes investor profile (bio, investment domains)
- Uses TF-IDF to vectorize text
- Calculates cosine similarity with all startups
- Ranks by compatibility score
- Shows top 10 matches

**Where to See:**

- HomePage (for investors only)
- Shows compatibility scores (0-100%)

**Algorithm:** TF-IDF + Cosine Similarity (built from scratch)

---

### 2. Semantic Search

**How it Works:**

- User types natural language query
- Converts query to TF-IDF vector
- Compares with all startup vectors
- Returns most similar results

**Where to See:**

- StartupsPage
- Toggle AI search (sparkle icon ✨)

**Example:**

- Query: "fintech payment app"
- Finds: "digital banking", "payment gateway", etc.

**Algorithm:** TF-IDF Vectorization + Cosine Similarity

---

### 3. Text Summarization

**How it Works:**

- Splits description into sentences
- Scores sentences by word frequency
- Selects top N sentences (default: 2)
- Returns concise summary

**Where to Use:**

- API endpoint: `/api/startups/:id/ai/summary`
- Can be integrated in StartupDetailPage

**Algorithm:** Extractive Summarization (sentence scoring)

---

### 4. Sentiment Analysis

**How it Works:**

- Analyzes review comments automatically
- Uses predefined positive/negative word lists
- Calculates sentiment score (-1 to 1)
- Classifies as positive/negative/neutral

**Where to See:**

- All reviews automatically analyzed
- Stored in database: `sentimentScore`, `sentimentLabel`

**Algorithm:** Lexicon-Based Sentiment Analysis

---

### 5. Auto-Tagging

**How it Works:**

- Extracts keywords from startup description
- Filters stop words
- Scores by frequency
- Returns top 5 tags

**Where to See:**

- Automatically generated when startup created/updated
- Stored in `aiTags` field

**Algorithm:** TF-IDF Keyword Extraction

---

### 6. Investment Prediction

**How it Works:**

- Multi-factor scoring model:
  - Stage (0-25 points)
  - User Growth (0-20 points)
  - Revenue (0-20 points)
  - Engagement (0-15 points)
  - Team Size (0-10 points)
  - Description Quality (0-10 points)
- Total: 0-100 score
- Prediction: High/Medium/Low

**Where to See:**

- Automatically calculated for all startups
- API: `/api/startups/:id/ai/potential`
- Can be displayed on startup cards

**Algorithm:** Weighted Multi-Factor Scoring

---

### 7. Compatibility Scoring

**How it Works:**

- Base score: 50 points
- Category match: +30 points
- Text similarity: +20 points
- Stage bonus: +5 points
- Final: 0-100%

**Where to See:**

- AI recommendations section
- Shows match percentage

**Algorithm:** Multi-Factor Scoring + Text Similarity

---

### 8. AI Chatbot

**How it Works:**

- Pattern matching for query classification
- Understands natural language queries
- Fetches real data (startups, investors)
- Returns interactive cards with links

**Where to See:**

- Floating button (bottom-right) on all pages
- Click to open chat interface

**Example Queries:**

- "Show me fintech startups" → Returns startup cards
- "Find investors" → Returns investor cards
- "How do I find startups?" → Helpful response

**Algorithm:** Rule-Based Pattern Matching + Data Integration

---

## ✅ Quick Start Checklist

### Initial Setup (One-Time)

- [ ] Clone repository
- [ ] Install Node.js (v18+)
- [ ] Create MongoDB Atlas account
- [ ] Create Stream account
- [ ] Set up backend `.env` file
- [ ] Set up frontend `.env` file
- [ ] Install backend dependencies (`npm install` in `backend/`)
- [ ] Install frontend dependencies (`npm install` in `frontend/`)
- [ ] Install nodemon (`npm install --save-dev nodemon` in `backend/`)

### Running the Project

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

✅ Backend should run on `http://localhost:5001`

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

✅ Frontend should run on `http://localhost:5173`

### First-Time Testing

1. **Open Browser:** `http://localhost:5173`
2. **Signup:** Create a new account (student/investor/normal)
3. **Verify OTP:** Check email for OTP code
4. **Complete Onboarding:** Fill in profile details
5. **Test Features:**
   - Browse startups
   - Use AI search
   - Open AI chatbot
   - (If student) Create startup
   - (If investor) View AI recommendations

### Admin Access

1. Navigate to: `http://localhost:5173/admin/login`
2. Login with:
   - Username: `cosmic`
   - Password: `123456`
3. Access admin dashboard to approve startups/verify investors

---

## 🎯 Key Features Summary

### For Students

- ✅ Create and manage startup profile
- ✅ Submit for admin approval
- ✅ Track metrics (revenue, users, roadmap)
- ✅ Receive connection requests from investors
- ✅ Chat and video call with investors

### For Investors

- ✅ Browse approved startups
- ✅ AI-powered personalized recommendations
- ✅ Compatibility scores for each startup
- ✅ Semantic search for finding startups
- ✅ Upvote and review startups
- ✅ Connect with founders
- ✅ Chat and video call

### For Normal Users

- ✅ Browse all approved startups
- ✅ Use AI semantic search
- ✅ Upvote startups
- ✅ Add reviews (with sentiment analysis)
- ✅ View AI-generated summaries

### For Admins

- ✅ Approve/reject startup submissions
- ✅ Verify investor accounts
- ✅ View platform statistics
- ✅ Manage users and content

---

## 📚 Additional Resources

### Documentation Files

- **AI_ML_FEATURES.md** - Complete AI/ML features documentation
- **README_CAMPUS_FOUNDERS.md** - Project overview
- **PROJECT_STATUS.md** - Current development status
- **IMPLEMENTATION_GUIDE.md** - Technical implementation details

### Important Links

- **MongoDB Atlas:** https://cloud.mongodb.com/
- **Stream Dashboard:** https://getstream.io/dashboard/
- **Node.js:** https://nodejs.org/
- **React Documentation:** https://react.dev/

---

## 🚀 You're All Set!

Your Campus Founders platform is now ready to run. Follow the checklist above, and you'll have the platform running locally in minutes.

**Happy Coding! 🎉**

---

_Last Updated: 2024_  
_Project: Campus Founders - Major Project_
