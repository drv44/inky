# Inky

Live app: https://inky-85bn.vercel.app/

## Introduction
Inky is a minimal, secure notes application that uses Clerk for authentication, an Express REST API for server logic, a Vite + React SPA for the UI, and the official MongoDB Node.js driver for persistence.   
Each request from the client includes a Clerk session token, which the server validates via @clerk/express; notes are scoped per user and include a createdAt timestamp displayed with locale‑aware formatting.

## Installation

### Prerequisites
- Node.js 18+ and npm installed on your machine. 
- A MongoDB connection string for MONGODB_URI and an optional DB_NAME.  
- Clerk keys: CLERK_PUBLISHABLE_KEY for the frontend and CLERK_SECRET_KEY for the backend. 

### 1) Backend (Express + MongoDB)
```
cd backend
cp .env.example .env   # or create .env with the variables below
npm install
node server.js         # starts API on PORT (default 4000)
```
Required backend .env
```
PORT=4000
MONGODB_URI=your_mongodb_connection_string
DB_NAME=notesdb
CLERK_SECRET_KEY=sk_...
CLERK_PUBLISHABLE_KEY=pk_...
```
Explanation: the backend uses the Clerk Express SDK to authenticate requests and the MongoDB driver to read/write notes.  

### 2) Frontend (Vite + React + Clerk)
```
cd ../frontend/clerk-notes
cp .env.example .env   # or create .env with the variables below
npm install
npm run dev            # Vite dev server at http://localhost:5173
```
Required frontend .env
```
VITE_CLERK_PUBLISHABLE_KEY=pk_...
VITE_API_BASE=http://localhost:4000
```
Notes: Vite only exposes variables prefixed with VITE_, so ensure the publishable key and API base are set with that prefix before starting the dev server.

### 3) Sign in and test
- Open the frontend dev URL, sign in with Clerk, then add and delete notes to verify authenticated API calls and data isolation.  
```
