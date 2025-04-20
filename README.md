# College Utility System

A full-stack application for managing college utilities, featuring a Node.js/Express backend with MongoDB and a React frontend. Includes Google OAuth authentication.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
  - [Backend](#backend-env)
  - [Frontend](#frontend-env)
- [Installation & Running](#installation--running)
  - [Backend](#backend)
  - [Frontend](#frontend)
- [Usage](#usage)
- [License](#license)

## Features

- User authentication with JWT and Google OAuth
- RESTful API built with Express
- MongoDB database connectivity
- React frontend with environment-based API URLs

## Prerequisites

- Node.js ≥ 14.x
- npm ≥ 6.x
- MongoDB Atlas account (or local MongoDB)
- Google Cloud project with OAuth 2.0 credentials

## Environment Variables

Create a `.env` file in both the **backend** and **frontend** directories using the templates below.

### Backend `.env` <a name="backend-env"></a>

Create `backend/.env` with:

```env
# Environment
NODE_ENV=development
PORT=5001

# MongoDB
MONGO_URI=mongodb+srv://collegeadmin:sikoGmV4jX85bOj2@cluster0.fckwv2m.mongodb.net/college-utility-system?retryWrites=true&w=majority&appName=Cluster0

# JWT
JWT_SECRET=a_strong_random_string_at_least_32_characters
JWT_EXPIRE=30d

# Session
SESSION_SECRET=your_session_secret_here

# Google OAuth
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback

# Frontend & API URLs
CLIENT_URL=http://localhost:3000
API_URL=http://localhost:5001
REACT_APP_API_URL=http://localhost:5001

# Optional
ALLOWED_DOMAIN=iiitdwd.ac.in

```

Create `frontend/.env` with:
```env
# MongoDB (if used in frontend - usually not recommended directly)
# MONGO_URI=mongodb+srv://collegeadmin:sikoGmV4jX85bOj2@cluster0.fckwv2m.mongodb.net/college-utility-system?retryWrites=true&w=majority&appName=Cluster0

# JWT (if frontend needs to decode token - typically only stored)
# JWT_SECRET=a_strong_random_string_at_least_32_characters

# Google OAuth (Client ID is often needed for login button)
REACT_APP_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
# GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
# GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback # Usually handled by backend redirect

# URLs
REACT_APP_CLIENT_URL=http://localhost:3000
REACT_APP_API_URL=http://localhost:5001
# API_URL=http://localhost:5001 # Redundant if using REACT_APP_API_URL
```
## Run backend
```
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Run the development server
npm run dev
```
## Start frontend
```
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the React development server
npm start
```
