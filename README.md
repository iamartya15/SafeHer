# SafeHer AI - Advanced Smart Women Safety Companion

SafeHer AI is a production-ready, full-stack safety web application. It integrates predictive safety logs, geographic incident mapping, automated emergency alerts, and a Gemini-powered safety companion.

---

## 🛡️ Core Features (Implemented)

1. **Authentication Hub**: Secure Register, Login, JWT access tokens, HTTP-only Refresh Tokens, Forgot Password, Reset Password, and Email Verification.
2. **Interactive Map**: OpenStreetMap mapping powered by Leaflet. Toggles localized hazard pins by categories: Harassment, Theft, Stalking, Poor Lighting, Unsafe Area, and Road Issues.
3. **Emergency SOS System**: One-click SOS broadcaster logging user coordinate coordinates, battery telemetry, and client user-agent metrics, with instant Nodemailer dispatches to linked safety guardians.
4. **Guardian Command Center**: Custom panel where guardians can accept ward permissions, audit active SOS alarms, and locate monitored users on live maps.
5. **AI Safety Companion**: Conversational assistant powered by Google Gemini (with pre-programmed local fallback rules in case keys are not set) generating immediate guidance for walking alone or escaping dangerous locations.
6. **Nearby Safe Places**: Direct client queries to the OpenStreetMap Overpass API mapping police shelters, hospitals, pharmacies, and fuel stations within 5km, calculating Haversine distances and linking navigation routes.
7. **Admin Moderation Portal**: Visualizes system registrations and alerts statistics, changes user role authorization, and moderates/deletes fake incident reports.
8. **In-App Notifications**: Internal MongoDB collection recording SOS alerts, guardian request updates, and resolution flags.

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
│   │   ├── components/     # Navbar, Sidebar, Map, and ComingSoonCard
│   │   ├── context/        # Auth Context provider
│   │   ├── hooks/          # useAuth and useGeolocation
│   │   ├── layouts/        # MainLayout and DashboardLayout
│   │   ├── pages/          # Dashboards, Maps, AI chats, and auth screens
│   │   ├── services/       # Axios wrappers and token refresh interceptors
│   │   ├── App.jsx         # App router configurations
│   │   └── index.css       # Tailwind directives and glassmorphic card stylings
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
In the root directory, install all dependencies for both frontend, backend, and root concurrent configurations with a single command:
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
```
*Note: If `GEMINI_API_KEY`, `EMAIL_USER`, or `CLOUDINARY_*` are left blank, SafeHer AI automatically falls back to development simulators (printing emails to the console, saving images locally, and running rule-based keyword safety advisors) so the app remains fully functional.*

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

---

## 🔮 Post-MVP Feature Roadmap (Coming Soon Section)

SafeHer AI includes 15 fully-styled premium preview cards representing upcoming safety tools:
1. **AI Route Safety Prediction**: Analyze paths using lighting and crowd densities.
2. **AI Safety Score Engine**: Predictive safety grades utilizing historical crime records.
3. **Safety Heatmap**: Visual hot-zone hazard grids.
4. **Safe Walk Mode**: Automatic 30s check-ins with warning triggers.
5. **Live Guardian Tracking**: Encrypted live tracking coordinates stream.
6. **Real-time Socket Notifications**: High-speed alarm broadcasts using WebSockets.
7. **Advanced Analytics Dashboard**: Graphical trend metrics chart.
8. **Predictive Crime Detection**: Pre-incident hot-zone ML predictions.
9. **Crowd Density Detection**: Satellite-assisted crowd levels estimates.
10. **Lighting Condition Analysis**: Computer-vision analysis of street light coverage.
11. **Smart Route Comparison**: Side-by-side safe route mapping.
12. **Push Notifications**: Mobile screen emergency push alerts.
13. **Voice Activated SOS**: Hands-free distress-word alarm triggers.
14. **Wearable Device Integration**: Smartwatch panic buttons.
15. **Offline Emergency Mode**: Mesh-network coordinate alerts without internet.
