# 🌟 NearMeet - Real-World Connection & Venue Meetup Platform

<p align="center">
  <img src="./frontend/public/logo.png" alt="NearMeet Logo" width="120" />
</p>

<p align="center">
  <strong>Bridging digital connections with real-world experiences.</strong><br>
  Discover curated cafes, restaurants, lounges, reserve tables, meet compatible people offline, and coordinate seamlessly in real time.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Stack-PERN%20(PostgreSQL%20%7C%20Express%20%7C%20React%20%7C%20Node)-blue?style=for-the-badge" alt="Stack" />
  <img src="https://img.shields.io/badge/Language-JavaScript%20(ESM)-yellow?style=for-the-badge" alt="JavaScript" />
  <img src="https://img.shields.io/badge/RealTime-Socket.IO-black?style=for-the-badge" alt="Socket.IO" />
  <img src="https://img.shields.io/badge/AI-Google%20Gemini-orange?style=for-the-badge" alt="Gemini" />
  <img src="https://img.shields.io/badge/Payments-Stripe-635BFF?style=for-the-badge" alt="Stripe" />
</p>

---

## 📖 Table of Contents

- [About NearMeet](#-about-nearmeet)
- [Key Features](#-key-features)
- [Reservation & Chat Lifecycle](#-reservation--chat-lifecycle)
- [AI Table Matchmaker](#-ai-table-matchmaker)
- [Tech Stack](#-tech-stack)
- [Project Architecture](#-project-architecture)
- [Prerequisites](#-prerequisites)
- [Installation & Quickstart](#-installation--quickstart)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Frontend Setup](#3-frontend-setup)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Socket.IO Events](#-socketio-events)
- [Database Schema](#-database-schema)
- [Available Scripts](#-available-scripts)
- [License](#-license)

---

## ☕ About NearMeet

**NearMeet** is an offline meeting and matchmaking web platform designed to eliminate endless superficial swiping. Instead of staying online, NearMeet facilitates genuine in-person dates and professional meetings at partner venues—such as chic cafes, rooftop lounges, and gourmet bistros.

Users browse verified partner venues, request reservations, complete payments, unlock real-time direct chats with venue concierges, and can even be intelligently paired with other singles or professionals at reserved venue tables through Google Gemini AI.

---

## ✨ Key Features

### 👤 For Guests / Users
* **Venue Discovery**: Explore partner venues filtered by category, price, location, amenities, and user ratings.
* **Interactive Location Maps**: Live visual venue location preview with Geoapify and interactive maps.
* **Onboarding & Smart Profiles**: Set dating intentions, interests, age preference, lifestyle habits (drinking, smoking), and upload photos.
* **Secure Stripe Payments**: Checkout seamlessly using Stripe Checkout for table reservations.
* **Interactive Live Chat**: Unlocked after payment confirmation with one-tap quick replies, emoji reactions, message timestamps, delivery status, and automatic message persistence in PostgreSQL.
* **32 Dynamic DaisyUI Themes**: Custom theme switcher (Cupcake, Luxury, Emerald, Cyberpunk, Dark, Synthwave, etc.) persisted in localStorage.

### 🏪 For Venue Owners / Vendors
* **Dedicated Vendor Portal**: Self-service onboarding for restaurants, cafes, and lounges with business details, GST numbers, operating hours, and photo uploads.
* **Reservation Management**: Real-time review of table requests: Accept (`booked`) or Decline bookings.
* **Table Pairing Dashboard**: View guests checked-in or open to meeting people, assign reserved tables, and initiate matchmaking requests.
* **AI Matchmaker Assistant**: Powered by **Google Gemini 1.5 Flash** to evaluate guest bios, compatibility scores, and suggest icebreakers for table pairings.
* **Direct Guest Concierge Chat**: Live two-way chat with confirmed guests to discuss table location, dietary restrictions, arrival times, and special requests.
* **Performance & Ratings**: Real-time review analytics and customer feedback monitoring.

---

## 🔄 Reservation & Chat Lifecycle

NearMeet enforces a clear, secure 4-stage booking flow:

```mermaid
sequenceDiagram
    autonumber
    actor User as 👤 Guest
    actor Vendor as 🏪 Venue Manager
    participant Stripe as 💳 Stripe Checkout
    participant Socket as 📡 Socket.IO & DB

    User->>Vendor: 1. Request Table Reservation (status: pending)
    Vendor-->>User: 2. Review & Confirm Booking (status: booked)
    User->>Stripe: 3. Complete Reservation Payment
    Stripe-->>User: Redirect with Payment Confirmation (status: paid)
    User->>Socket: 4. Live Chat Unlocked!
    Vendor->>Socket: Join Room & Coordinate Arrival / Reserved Booth
```

1. **Step 1 (`pending`)**: Guest selects a venue, table name, date, and guest count. Status is set to `pending`. Live chat remains locked.
2. **Step 2 (`booked`)**: Venue manager reviews capacity and accepts the request. Status transitions to `booked`.
3. **Step 3 (`paid`)**: Guest is prompted to complete table reservation payment via Stripe Checkout. Upon success, status updates to `paid`.
4. **Step 4 (Chat Unlocked)**: Direct real-time messaging between guest and venue is automatically unlocked.

---

## 🤖 AI Table Matchmaker

NearMeet integrates **Google Gemini 1.5 Flash** directly into the vendor dashboard:
* **Input**: Analyzes profiles of unpaired guests at the venue (interests, dating intention, occupation, lifestyle).
* **Evaluation**: Evaluates conversational synergy and computes a compatibility score (75–99%).
* **Output**:
  * Recommended Pair (Guest 1 & Guest 2)
  * Match rationale (2-sentence explanation)
  * Custom icebreaker tailored to their shared interests
  * Suggested table seating (e.g., *"Table #4 - Window Alcove"*)

---

## 🛠 Tech Stack

### Frontend
* **Core**: React 19, JavaScript (ES Modules), Vite
* **Routing & State**: React Router 7, Redux Toolkit, Zustand
* **Styling**: Tailwind CSS, DaisyUI (32 curated themes), Framer Motion, Lucide React
* **Real-Time & API**: Socket.IO Client, Axios, TanStack React Query
* **Payments**: `@stripe/stripe-js`, `@stripe/react-stripe-js`
* **Maps & Notifications**: Geoapify Maps, React Hot Toast

### Backend
* **Runtime & Framework**: Node.js (v18+ ESM), Express.js
* **Database**: PostgreSQL (`pg` connection pool with automatic schema generation)
* **Real-Time Communication**: Socket.IO (room-based routing with normalized user/vendor IDs)
* **AI & Machine Learning**: Google Generative AI SDK (`@google/generative-ai` Gemini 1.5 Flash)
* **Payments**: Stripe API SDK
* **Media & File Storage**: Cloudinary SDK & Multer disk storage
* **Security & Auth**: JSON Web Tokens (`jsonwebtoken`), Bcrypt password hashing, Cookie-Parser, CORS

---

## 📁 Project Architecture

```
offline_meeting_app/
├── backend/
│   ├── database/
│   │   └── migrations/               # PostgreSQL schema & table migration scripts
│   ├── public/
│   │   └── uploads/                  # Local media uploads directory
│   ├── scripts/
│   │   ├── migrate.js                # Database migration runner
│   │   └── seed.js                   # Seed demo venues, users & tables
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js           # PostgreSQL pool & auto-table init
│   │   │   └── env.js                # Environment variable validation
│   │   ├── controllers/              # Request handlers (Auth, Bookings, Chat, etc.)
│   │   ├── middleware/               # Auth, vendor guard, error & upload handlers
│   │   ├── routes/                   # Modular Express routers (API endpoints)
│   │   ├── services/                 # Database queries & business logic
│   │   ├── socket/
│   │   │   └── socket.js             # Socket.IO connection & messaging engine
│   │   ├── types/                    # Standardized ESM models & helpers
│   │   ├── app.js                    # Express app configuration & middleware
│   │   └── server.js                 # HTTP & WebSocket server bootstrap
│   └── package.json
│
├── frontend/
│   ├── public/                       # Static logos, icons, and venue map assets
│   ├── src/
│   │   ├── components/               # Navbar, VendorNavbar, ChatUI, Modals, etc.
│   │   ├── constants/                # Amenities list & application constants
│   │   ├── context/                  # React context providers
│   │   ├── hooks/                    # Custom authentication & state hooks
│   │   ├── lib/                      # Axios client instance & helper utilities
│   │   ├── pages/                    # 20+ Guest and Vendor application views
│   │   ├── redux/                    # Redux store & user state slices
│   │   ├── store/                    # Zustand persistent theme store
│   │   ├── App.jsx                   # Router & application layout
│   │   ├── index.css                 # Tailwind CSS & theme definitions
│   │   └── main.jsx                  # React DOM entry point
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

---

## 📋 Prerequisites

Ensure you have the following installed on your machine:
* **Node.js**: `v18.0.0` or higher (Node 20+ recommended)
* **npm**: `v9.0.0` or higher
* **PostgreSQL**: `v14` or higher running locally or hosted (e.g. Supabase, Neon, Railway)

---

## 🚀 Installation & Quickstart

### 1. Clone Repository
```bash
git clone https://github.com/your-username/nearmeet.git
cd offline_meeting_app
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

#### Create `.env` in `backend/`:
```env
PORT=5001
NODE_ENV=development

# PostgreSQL Connection String
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/nearmeet

# Authentication Secrets
JWT_SECRET=your_jwt_secret_key_here
VENDOR_JWT_SECRET=your_vendor_secret_key_here

# Stripe Payment Gateway
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key

# Google Gemini AI Matchmaker
GEMINI_API_KEY=your_google_gemini_api_key

# Cloudinary (Optional - For Image Storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# CORS
CORS_ORIGIN=http://localhost:5173
```

#### Initialize Database:
```bash
# Run schema migrations
npm run migrate

# (Optional) Seed demo partner cafes, restaurants & venues
npm run seed
```

#### Start Backend Server:
```bash
# Starts server with automatic hot-reload via nodemon
npm run dev
```
*Server will be live on: `http://localhost:5001`*  
*Health Check: `http://localhost:5001/api/health`*

---

### 3. Frontend Setup

Open a new terminal window:
```bash
cd frontend
npm install
```

#### Create `.env` in `frontend/`:
```env
# Backend API Base URL
VITE_BACKEND_URL=http://localhost:5001

# Geoapify Maps API Key (Optional - for geocoding & maps)
VITE_GEOAPIFY_KEY=your_geoapify_key

# Firebase (Optional - For Social OAuth)
VITE_FIREBASE_API_KEY=your_firebase_api_key
```

#### Start Frontend Client:
```bash
npm run dev
```
*Frontend will be running on: `http://localhost:5173`*

---

## 🔐 Environment Variables

| Variable | Scope | Description | Required |
| :--- | :--- | :--- | :---: |
| `PORT` | Backend | HTTP Port for Express & Socket.IO (`5001`) | Yes |
| `DATABASE_URL` | Backend | PostgreSQL connection URI | Yes |
| `JWT_SECRET` | Backend | Secret key used for signing Guest JWTs | Yes |
| `VENDOR_JWT_SECRET` | Backend | Secret key used for signing Vendor JWTs | Yes |
| `STRIPE_SECRET_KEY` | Backend | Stripe Secret Key for Checkout Sessions | Yes |
| `GEMINI_API_KEY` | Backend | API Key for Gemini 1.5 Flash table matchmaker | Yes |
| `CLOUDINARY_*` | Backend | Cloudinary credentials for photo uploads | Optional |
| `VITE_BACKEND_URL` | Frontend | Backend API endpoint URL | Yes |
| `VITE_GEOAPIFY_KEY` | Frontend | Geoapify key for map rendering | Optional |

---

## 📡 API Reference

### 🔐 Authentication (`/api/auth`)
* `POST /api/auth/signup` - Register a new guest user.
* `POST /api/auth/login` - Authenticate guest user.
* `POST /api/auth/logout` - Clear auth cookies.
* `GET  /api/auth/me` - Fetch authenticated user profile.

### 🏪 Vendors & Venues (`/api/vendors`)
* `POST /api/vendors/signup` - Register a new venue/vendor.
* `POST /api/vendors/login` - Authenticate vendor.
* `GET  /api/vendors` - List all verified partner venues.
* `GET  /api/vendors/:id` - Retrieve venue details, amenities, photos, and menu.
* `PUT  /api/vendors/profile` - Update venue profile, prices, opening hours.
* `DELETE /api/vendors/profile` - Delete vendor account.

### 📅 Bookings & Reservations (`/api/bookings`)
* `POST /api/bookings/book` - Guest submits table reservation (`pending`).
* `GET  /api/bookings/user/:userId` - Retrieve all bookings for a guest.
* `GET  /api/bookings/vendor/:vendorId` - Retrieve all incoming bookings for a venue.
* `POST /api/bookings/requests/:id/accept` - Venue confirms reservation (`booked`).
* `POST /api/bookings/requests/:id/reject` - Venue rejects reservation (`rejected`).
* `POST /api/bookings/:id/pay` - Mark reservation payment confirmed (`paid`).
* `GET  /api/bookings/chat-eligibility/:vendorId` - Verify if guest can chat with venue.
* `GET  /api/bookings/vendor-chat-eligibility/:userId` - Verify if venue can chat with guest.
* `GET  /api/bookings/user-chat-messages/:vendorId` - Fetch persisted chat history for guest.
* `GET  /api/bookings/vendor-chat-messages/:userId` - Fetch persisted chat history for venue.

### 🤖 AI Matchmaking (`/api/ai`)
* `POST /api/ai/ask` - General AI concierge assistant.
* `POST /api/ai/vendor/recommend-pair` - Analyzes checked-in guests and returns AI table recommendation with icebreakers.

### 💳 Payments (`/api/payments`)
* `POST /api/payments/checkout` - Create Stripe Checkout session for table fee.

### ⭐ Reviews (`/api/review`)
* `POST /api/review/vendor/:vendorId` - Submit guest review & 5-star rating.
* `GET  /api/review/vendor/:vendorId` - List all verified reviews for a venue.

### 📸 Media Uploads (`/api/upload`)
* `POST /api/upload/image` - Upload single venue/profile photo.
* `POST /api/upload/multiple` - Batch upload gallery images.

---

## ⚡ Socket.IO Events

Real-time communication is powered by Socket.IO over port `5001`:

| Event Name | Direction | Payload | Description |
| :--- | :--- | :--- | :--- |
| `registerUser` | Client ➔ Server | `userId` | Registers guest presence in memory. |
| `registerVendor` | Client ➔ Server | `vendorId` | Registers venue presence in memory. |
| `joinChat` | Client ➔ Server | `{ userId, vendorId }` | Joins private conversation room `${userId}_${vendorId}`. |
| `sendMessage` | Client ➔ Server | `{ userId, vendorId, sender, text }` | Validates payment status, persists to PostgreSQL, and broadcasts message. |
| `receiveMessage` | Server ➔ Client | `{ id, sender, text, createdAt, ... }` | Emitted to room members when a message is sent. |
| `chatBlocked` | Server ➔ Client | `{ message }` | Triggered if user attempts to send message prior to payment confirmation. |

---

## 🗄 Database Schema

The PostgreSQL database includes the following core relations:

* `users` - Guest accounts (name, email, password hash, role).
* `user_profiles` - Extended bio, location, age, gender, lifestyle habits, avatar.
* `user_preferences` - Dating intentions, age limits, preferred distance.
* `vendors` - Venues (hotel/cafe name, address, price, hours, photos, amenities, ratings).
* `booking_requests` - Table bookings (`status`: `pending`, `booked`, `paid`, `rejected`, `cancelled`).
* `pair_requests` - Offline matchmaking pairings between 2 guests at a specific table.
* `vendor_user_messages` - Persisted chat messages between vendor and guest (`vendor_id`, `user_id`, `sender`, `text`, `created_at`).
* `vendor_reviews` - Customer reviews, comments, and star ratings.
* `notifications` - In-app alerts for accepted bookings, payment updates, and pairings.

---

## 📜 Available Scripts

### Backend (`/backend`)
* `npm run dev` - Starts backend with `nodemon` live-reloading.
* `npm run start` - Runs backend with standard Node.js.
* `npm run migrate` - Executes SQL migrations against PostgreSQL.
* `npm run seed` - Populates sample cafes, restaurants, and demo data.

### Frontend (`/frontend`)
* `npm run dev` - Starts Vite development server at `http://localhost:5173`.
* `npm run build` - Builds production bundle into `dist/`.
* `npm run preview` - Locally previews the production build.
* `npm run lint` - Runs ESLint across all `.js` and `.jsx` files.

---


