import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ClerkProvider } from '@clerk/clerk-react'

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!publishableKey) throw new Error('VITE_CLERK_PUBLISHABLE_KEY is not set in environment variables');

createRoot(document.getElementById('root')).render(
  <ClerkProvider publishableKey={publishableKey}>
    <App />
  </ClerkProvider>
)
