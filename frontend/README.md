# Campus Founders Frontend

Frontend application for Campus Founders - A platform connecting student founders with investors in the campus ecosystem.

## Tech Stack

- **React 19** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **TailwindCSS + DaisyUI** - Styling with 30+ themes
- **React Query** - Server state management
- **Axios** - HTTP client
- **Stream.io** - Real-time chat and video calls
- **EmailJS** - Email OTP verification

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Create .env file
# VITE_API_BASE_URL=http://localhost:5001/api
# VITE_STREAM_API_KEY=your-stream-api-key

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Environment Variables

### Required

- `VITE_STREAM_API_KEY` - Stream.io API key for chat/video functionality

### Optional

- `VITE_API_BASE_URL` - Backend API URL (defaults to `http://localhost:5001/api` in development, uses production URL in production mode)

## Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page components
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # API clients and utilities
│   ├── constants/     # App constants
│   ├── store/         # State management (Zustand)
│   └── styles/        # CSS files
├── public/            # Static assets
└── package.json
```

## Features

- 🎨 30+ themes with DaisyUI
- 💬 Real-time chat with Stream.io
- 📹 Video calls
- 🔐 JWT authentication
- 📱 Responsive design
- 🚀 Optimized production builds

## Deployment

The frontend is configured for deployment on Vercel. See [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md) for detailed instructions.
