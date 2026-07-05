<div align="center">
  <img src="./frontend/public/icon.svg" alt="SafeHer AI Logo" width="120" />
  <h1>SafeHer AI</h1>
  <p><strong>Advanced Smart Women Safety Companion & Guardian Network</strong></p>
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![React](https://img.shields.io/badge/React-18.x-61dafb?logo=react&logoColor=black)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
</div>

<br />

## 🌟 Overview

**SafeHer AI** is an enterprise-grade, location-aware emergency companion designed to provide immediate safety assistance, predictive alerts, and a real-time guardian monitoring network. By combining community-reported incidents, real-time disaster alerts (GDACS), local infrastructure data (OpenStreetMap Overpass API), and Google's Gemini AI, SafeHer creates a comprehensive safety shield.

## ✨ Core Features

### 🚨 Real-Time SOS System
- **1-Tap Emergency Trigger**: Instantly alerts all assigned Guardians via email and in-app notifications.
- **Live Location Tracking**: Continuously updates backend with high-accuracy GPS coordinates during active SOS.
- **Guardian Dashboard**: Real-time map displaying the exact location, battery status, and route of the monitored user.

### 🧠 Location-Aware AI Assistant (Gemini)
- **Contextual Intelligence**: Reverses geocodes user location using Nominatim.
- **Nearby Intelligence**: Suggests nearby Safe Places (Police, Hospitals, Shelters) using the Overpass API.
- **Privacy-First**: Never accesses location without explicit browser permission. Caches data to prevent API abuse.

### 🗺️ Live Safety Map (Triple-Layer Integration)
- **User Incidents**: Crowdsourced incident reports (harassment, unsafe areas, accidents) stored in MongoDB using `2dsphere` geospatial indexing.
- **GDACS Disasters**: Live global disaster alerts (Earthquakes, Floods, Cyclones) integrated dynamically via GeoJSON.
- **Verified Safe Places**: Real-time extraction of nearby Police Stations, Hospitals, and Pharmacies via OSM Overpass API.

### 🎨 Premium AMOLED UI
- Custom Dark Mode optimized for OLED screens (`#0B0F19` deep backgrounds).
- Glassmorphism UI with smooth micro-animations.
- Highly responsive Mobile Drawer and Navigation structure.

---

## 🏗️ Architecture

The application follows a standard MERN stack architecture with MVC design patterns on the backend.

### Tech Stack
- **Frontend**: React (Vite), TailwindCSS, Leaflet (Maps), React Hook Form, Zustand/Context API, React Router v6.
- **Backend**: Node.js, Express.js, Mongoose (MongoDB), JSON Web Tokens (JWT).
- **External APIs**: Google OAuth 2.0, Gemini AI (Generative Language), GDACS (Disaster), Overpass API (OSM), Nominatim.
- **Security**: Helmet, Rate Limiting, express-mongo-sanitize, sanitize-html.

### Folder Structure
```text
📦 safeher-ai
 ┣ 📂 backend
 ┃ ┣ 📂 config       # DB, Cloudinary configuration
 ┃ ┣ 📂 controllers  # Request handling logic (auth, sos, map)
 ┃ ┣ 📂 middlewares  # Auth (JWT), XSS, Error Handling
 ┃ ┣ 📂 models       # Mongoose Schemas (User, SOS, Incident)
 ┃ ┣ 📂 routes       # API Route definitions
 ┃ ┣ 📂 services     # External APIs (Gemini, Email, Notifications)
 ┃ ┗ 📜 server.js    # Entry point & Express setup
 ┗ 📂 frontend
 ┃ ┣ 📂 src
 ┃ ┃ ┣ 📂 components # Reusable UI components
 ┃ ┃ ┣ 📂 context    # AuthProvider, ThemeProvider
 ┃ ┃ ┣ 📂 hooks      # Custom hooks (useGeolocation)
 ┃ ┃ ┣ 📂 layouts    # MainLayout, DashboardLayout
 ┃ ┃ ┣ 📂 pages      # Page views (Dashboard, SOS, Maps)
 ┃ ┃ ┗ 📂 services   # Axios API wrappers
 ┃ ┗ 📜 vite.config.js
```

---

## 🛡️ Security Features
- **NoSQL Injection Prevention**: `express-mongo-sanitize` strips prohibited characters.
- **XSS Protection**: Custom `sanitize-html` middleware sanitizes payload inputs.
- **Rate Limiting**: `express-rate-limit` prevents brute-force attacks on authentication endpoints.
- **Anti-Enumeration Guard**: Strict zero-knowledge responses on Forgot Password endpoints.
- **Token Security**: Cryptographically secure, SHA-256 hashed, one-time-use password reset tokens.
- **Mass Assignment Protection**: Explicit field validation during user registration prevents privilege escalation.
- **CORS Configuration**: Restricts access to allowed frontend origins only.
- **JWT Authentication**: Implements short-lived access tokens and secure refresh token rotation via HTTP-only cookies.
- **Role-Based Access Control (RBAC)**: Strict separation between `user`, `guardian`, and `admin` roles.

---

## ⚡ Performance Optimizations
- **React Lazy Loading & Suspense**: Heavy map and dashboard components are dynamically imported, drastically reducing the initial Vite bundle size (`index.js` reduced from ~750kB to ~476kB).
- **Geospatial Indexing**: MongoDB `2dsphere` indexes allow lightning-fast distance sorting for nearby incidents.
- **API Caching**: Safe places and reverse geocoding results are cached to prevent redundant Overpass/Nominatim API calls.

---

## 🚀 Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/iamartya15/SafeHer.git
cd SafeHer
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
ADMIN_EMAIL=your_admin_email@example.com

# Email (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
```
Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```
Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```
Start the Vite development server:
```bash
npm run dev
```

---

## 🧪 Testing & Validation
The project includes a comprehensive backend sanity verification script.
```bash
cd backend
node verify_backend.js
```
This script checks all routes, controllers, database models, and service configurations to ensure production readiness.

---

## 🗺️ Roadmap
- [ ] Push Notifications via Firebase Cloud Messaging (FCM).
- [ ] Offline-first capability using Service Workers (PWA).
- [ ] Background Geolocation Tracking for continuous Guardian updates while phone is locked.
- [ ] Voice-activated SOS trigger using browser Web Speech API.

---

## 📄 License
This project is licensed under the MIT License. See the `LICENSE` file for details.
