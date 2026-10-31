# 🌿 Smart Food Waste Management

> **"Save Food. Reduce Waste. Feed the Future."**

A modern, full-stack web application designed to combat food waste by connecting restaurants, supermarkets, hostels, event organizers, and households with NGOs, volunteers, and distribution networks.

![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=flat&logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-WebGL-black?style=flat&logo=three.js&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Auth_&_Firestore-FFCA28?style=flat&logo=firebase&logoColor=black)

---

## 🌟 Key Features

- **🌐 Interactive 3D WebGL Landing Page**: Three.js Earth globe with orbiting donation boxes, fruits, leaves, and ambient particle clouds.
- **🔐 Multi-Role Authentication**: Firebase Auth supporting Email/Password and Google SSO with roles for:
  - Restaurants
  - Supermarkets
  - Households
  - NGOs & Shelters
  - Volunteers
  - Platform Administrators
- **📊 Real-Time Analytics & Impact Dashboard**: Recharts-powered analytics displaying food rescued (kg), carbon footprint offset, and community reach.
- **🍱 Food Donation Module**: Easy surplus food listing with batch QR code generation, dietary tags, and pickup scheduling.
- **📦 Smart Inventory Management**: Real-time search, category & expiry filters, inventory status tracking, and stock management.
- **🚚 Distribution & Logistics Pipeline**: Claim surplus donations, manage dispatch workflows, assign delivery volunteers, and track route statuses.
- **📱 Fully Responsive**: Optimized for desktop, tablet, and mobile devices with a dark neon glassmorphism UI.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite
- **Styling**: Tailwind CSS, Glassmorphism, CSS Animations
- **3D Visuals**: Three.js (WebGL), Canvas Particles
- **Icons**: Lucide React
- **Data Visualization**: Recharts
- **Backend / Authentication**: Firebase Auth, Cloud Firestore
- **Utilities**: `qrcode.react`, `canvas-confetti`

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` or `pnpm` / `yarn`

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Abhiram-638/smart-food-waste.git
   cd smart-food-waste
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Add your Firebase configuration credentials in `.env`:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```
   *(Note: The application includes an automatic offline demo fallback if Firebase is not yet configured).*

4. **Run Development Server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

5. **Build for Production:**
   ```bash
   npm run build
   ```

---

## 📁 Project Structure

```
smart-food-waste/
├── src/
│   ├── components/
│   │   ├── 3d/
│   │   │   ├── Hero3DCanvas.jsx        # Three.js 3D Earth & orbiting assets
│   │   │   └── FoodParticleCanvas.jsx  # Floating ambient particles
│   │   ├── Navbar.jsx                  # Sticky navbar with scroll-spy & active indicator
│   │   ├── Footer.jsx                  # Footer with navigation and newsletter
│   │   ├── ProtectedRoute.jsx          # Route guard for authenticated views
│   │   ├── QRCodeModal.jsx             # QR batch code generator & scanner
│   │   └── Toast.jsx                   # Toast alert notification system
│   ├── config/
│   │   └── firebase.js                 # Firebase initialization & auth methods
│   ├── context/
│   │   ├── AuthContext.jsx             # Authentication & user profile management
│   │   └── FoodContext.jsx             # Food listings, donations, & claims state
│   ├── data/
│   │   └── mockData.js                 # Sample datasets & test profiles
│   ├── pages/
│   │   ├── LandingPage.jsx             # 3D Hero, 5-step workflow, features, analytics
│   │   ├── LoginPage.jsx               # Split 2-column login with role selectors
│   │   ├── SignupPage.jsx              # Account creation with role types
│   │   ├── DashboardPage.jsx           # Overview metrics & quick action tiles
│   │   ├── DonatePage.jsx              # Surplus food registration & QR generator
│   │   ├── InventoryPage.jsx           # Real-time stock search, filters, & edit modal
│   │   ├── DistributionPage.jsx        # Claims pipeline & delivery coordinator
│   │   ├── AnalyticsPage.jsx           # Detailed carbon offset & rescue graphs
│   │   └── ProfilePage.jsx             # User badges, sustainability tier, & settings
│   ├── App.jsx                         # Main layout & router
│   ├── main.jsx                        # React root entry
│   └── index.css                       # Global styles & glassmorphic utility classes
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---

## 📄 License

This project is licensed under the MIT License - feel free to use and modify for your own sustainability initiatives!
