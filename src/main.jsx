import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import { App } from './App.jsx';
import './index.css';

const clerkFrontendApi = import.meta.env.VITE_CLERK_FRONTEND_API;
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkFrontendApi || !clerkPubKey) {
  throw new Error("Missing Clerk Frontend API or Publishable Key in .env file");
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClerkProvider frontendApi={clerkFrontendApi} publishableKey={clerkPubKey}>
      <App />
    </ClerkProvider>
  </StrictMode>
);