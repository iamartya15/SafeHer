# SafeHer AI - Advanced Smart Women Safety Companion

SafeHer AI is a production-ready, full-stack safety web application. It integrates predictive safety logs, geographic incident mapping, automated emergency alerts, and a Gemini-powered safety companion.

---

## 🛡️ Core Features

1. **Authentication & Multi-Role Hub**: Secure Register, Login, JWT access tokens, HTTP-only Refresh Tokens. Users can hold multiple roles simultaneously (User, Guardian, Admin) without needing separate accounts, switching instantly via the workspace dropdown.
2. **Interactive Safety Intelligence Map**: Advanced mapping powered by Leaflet and Leaflet MarkerCluster.
   - **Live Global Disaster Alerts**: Automatically pulls real-time earthquake, flood, and cyclone alerts via the **GDACS GeoJSON API**.
   - **Local Hazard Pins**: User-reported incidents for Harassment, Theft, Stalking, Poor Lighting, Unsafe Area, and Road Issues (MongoDB).
   - **Dynamic Filtering**: Filter by category and time (24h, 7d, 30d, All Time).
3. **Advanced Safe Places Network**: Live integration with **OpenStreetMap Overpass API**.
   - Automatically maps police shelters, hospitals, pharmacies, women's help centers, and fuel stations within a highly accurate 5km radius using the Haversine formula.
   - Extracts rich metadata including phone numbers, websites, opening hours, and operators.
   - Provides instant walking navigation links and clickable call buttons.
4. **Emergency SOS System**: One-click SOS broadcaster logging high-accuracy user coordinates, battery telemetry, and client user-agent metrics, with instant Nodemailer dispatches to linked safety guardians.
5. **Guardian Command Center**: Custom panel where guardians can accept ward permissions, audit active SOS alarms, and locate monitored users on live maps.
6. **AI Safety Companion**: Conversational assistant powered by Google Gemini (with pre-programmed local fallback rules in case keys are not set) generating immediate guidance for walking alone or escaping dangerous locations.
7. **Admin Moderation Portal**: Visualizes system registrations and alerts statistics, manages user roles, and moderates fake incident reports.
8. **In-App Notifications**: Real-time synchronized notifications with optimistic UI updates and zero stale caching.
9. **Premium AMOLED Theming**: 
   - **Deep Dark Mode**: Custom AMOLED-inspired charcoal/black aesthetics with soft purple/blue radiant glows.
   - **Light Mode**: High-contrast, clean, and bright visibility.
   - **System Mode**: Dynamically follows the user's OS preference (`prefers-color-scheme`) in real-time.

---

## ⚙️ Project Architecture

```
SafeHer/
├── backend/
│   ├── config/             # DB, Cloudinary, and Nodemailer configs
│   ├── controllers/        # Express MVC controllers
│   ├── middlewares/        # JWT auth, Multer uploads, security, and error catchers
│   ├── models/             # Mongoose schemas (User, Guardian, Incident, SOS, Notification, Chat)
│   ├── routes/             # REST routing maps
│   ├── services/           # Gemini API integrations
│   ├── validators/         # Input sanitizers using express-validator
│   └── server.js           # Server entry point
├── frontend/
│   ├── src/
│   │   ├── components/     # Navbar, Sidebar, InteractiveMap, etc.
│   │   ├── context/        # Auth and Theme Context providers
│   │   ├── hooks/          # useAuth and useGeolocation (with high-accuracy fallbacks)
│   │   ├── pages/          # Dashboards, Maps, AI chats, and auth screens
│   │   ├── services/       # Axios wrappers and API clients
│   │   ├── App.jsx         # App router configurations
│   │   └── index.css       # Tailwind directives and semantic CSS variables
│   ├── tailwind.config.js
│   ├── vercel.json         # SPA router redirects
│   └── vite.config.js
└── package.json            # Root command orchestrator
```

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js >= 18.0.0
- MongoDB (Local instance or Atlas string)

### 1. Installation
In the root directory, install all dependencies for both frontend and backend:
```bash
npm run install:all
```

### 2. Configure Environment Variables
Create a `.env` file in the `backend/` directory (see `backend/.env.example` for details):
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/safeher
JWT_SECRET=your_jwt_access_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
GEMINI_API_KEY=your_gemini_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
FRONTEND_URL=http://localhost:5173
ADMIN_EMAIL=your_super_admin@email.com
```
*Note: If `GEMINI_API_KEY`, `EMAIL_USER`, or `CLOUDINARY_*` are left blank, SafeHer AI automatically falls back to development simulators (printing emails to the console, saving images locally, and running rule-based keyword safety advisors).*

### 3. Run the Development Servers
From the root directory, launch both dev servers concurrently:
```bash
npm run dev
```
- Frontend will mount at: `http://localhost:5173`
- Backend API will run at: `http://localhost:5000/api`

---

## 🌐 Production Deployment

### Frontend (Vercel)
1. Push your repository to GitHub.
2. Link your repository on the Vercel dashboard.
3. Configure the Root Directory to `frontend`.
4. Set Environment Variables:
   - `VITE_API_URL` = Your backend Render URL (e.g., `https://safeher-backend.onrender.com/api`).
5. Deploy. (The `vercel.json` SPA redirection configuration is already bundled inside `frontend/`).

### Backend (Render)
1. Deploy a new Web Service on Render.
2. Link your repository.
3. Configure the Root Directory to `backend`.
4. Set Build Command: `npm install`.
5. Set Start Command: `npm start`.
6. Set environment variables from your `backend/.env` file.
7. Deploy.
