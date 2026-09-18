# Diksha Foundation Platform

Hackathon project platform foundation built with React + Vite (Frontend) and Node.js + Express + TypeScript + Mongoose (Backend).

## Repository Structure

```
diksha-foundation-platform/
├── client/     # React + Vite + TypeScript Frontend
└── server/     # Node.js + Express + TypeScript Backend
```

---

## Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- `npm` (v9+ recommended)
- MongoDB Atlas database instance (or local MongoDB server)

---

### Backend Setup (`server/`)

1. Navigate to the `server` directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Update `MONGODB_URI` and `PORT` in `.env` as needed.

4. Start the development server:
   ```bash
   npm run dev
   ```
   The backend runs on `http://localhost:5000`. You can check server status at `http://localhost:5000/api/health`.

---

### Frontend Setup (`client/`)

1. Navigate to the `client` directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend app runs on `http://localhost:5173`.

---

## Scripts Overview

### Backend (`server/`)
- `npm run dev`: Starts server in watch mode using `tsx`
- `npm run build`: Compiles TypeScript code to `dist/`
- `npm start`: Starts the compiled JavaScript production server from `dist/index.js`

### Frontend (`client/`)
- `npm run dev`: Starts Vite dev server
- `npm run build`: Compiles TypeScript and builds production bundle in `dist/`
- `npm run preview`: Previews the production build locally
