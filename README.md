# 🩸 Blood Donation MERN

A full-stack blood donation platform connecting voluntary blood donors with recipients in urgent need.

## 📋 Features (Week 1)
- ✅ User registration & JWT authentication
- ✅ Email verification & password reset flow
- ✅ Blood request posts with search & filters (blood group, district, urgency)
- ✅ Real-time public and private chat with Socket.io
- ✅ Donation history & certificate generator
- ✅ 90-day eligibility tracker with real-time countdown timer
- ✅ Badge system (`Bronze` → `Silver` → `Gold` → `Platinum`)
- ✅ Leaderboard with podium rankings (All-Time & Monthly)
- ✅ SOS emergency button with real-time socket alerts, sound & vibration
- ✅ Rate limiting, security headers & global error boundary / 404 handler

## 🛠 Tech Stack
- **Backend:** Node.js, Express, MongoDB (Mongoose), Socket.io, JWT, bcryptjs, Nodemailer
- **Frontend:** React, Vite, React Router, Axios, Socket.io-client, react-hot-toast

<<<<<<< HEAD
## 🚀 Quick Start
=======

![image alt](https://github.com/kayumsntx/BloodDonationMERN/blob/68b8643570c53eccf0c08c901f76478bb18ec88c/Screenshot%202026-10-16%20122345.png)

![image alt](https://github.com/kayumsntx/BloodDonationMERN/blob/b80ab799664b5c82223e9d5a6c7d88ae87b67889/Screenshot%202026-10-16%20122500.png)

## ✨ Features

- 🔐 **User Authentication** - Register/Login with JWT
- 🩸 **Blood Requests** - Create, view, and manage blood requests
- 🎯 **Donor Matching** - Smart matching based on blood group & location
- 💬 **Real-time Chat** - Instant messaging with Socket.io
- 🔔 **Emergency Alerts** - Urgent request notifications
- 📱 **Mobile Responsive** - Works on all devices
- 🔍 **Search & Filter** - Find donors by blood group, location, urgency
- 👤 **User Profiles** - Manage profile, donation history, availability

---

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Socket.io** - Real-time communication
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend
- **React** - UI library
- **Vite** - Build tool
- **Socket.io-client** - Real-time client
- **Axios** - HTTP client
- **React Router** - Navigation

---

## 📁 Project Structure

# BloodDonationMERN

```text
BloodDonationMERN/
├── server/
│   ├── config/
│   │   └── db.js
│   ├── models/
│   │   ├── User.js
│   │   ├── BloodRequest.js
│   │   └── Message.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── requests.js
│   │   └── messages.js
│   ├── socket/
│   │   └── socketHandler.js
│   ├── .env
│   └── server.js
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── .gitignore
└── README.md
```

## 🚀 Getting Started
>>>>>>> ac3e75e9bfb00a13ddaa8e3ee88d9d0e627863c1

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Server Setup
```bash
cd server
npm install
cp .env.example .env
# Configure .env with your MongoDB URI, JWT secret, and email credentials
npm run seed     # (optional) seed 5 sample users
npm run dev
```

### Client Setup
```bash
cd client
npm install
cp .env.example .env
npm run dev
```

### URLs
- **Client:** `http://localhost:5173`
- **API:** `http://localhost:5000/api`
- **Health Check:** `http://localhost:5000/api/health`

---

## 📚 API Endpoints

| Group | Endpoints |
| :--- | :--- |
| **Auth** | `/api/auth/register`, `/api/auth/login`, `/api/auth/forgot-password`, `/api/auth/reset-password/:token`, `/api/auth/verify-email/:token`, `/api/auth/resend-verification`, `/api/auth/me` |
| **Users** | `/api/users`, `/api/users/:id`, `/api/users/profile`, `/api/users/profile-pic`, `/api/users/donor-status`, `/api/users/eligibility`, `/api/users/donors/search`, `/api/users/eligible-now` |
| **Requests** | `/api/requests`, `/api/requests/:id`, `/api/requests/my` |
| **Donations** | `/api/donations`, `/api/donations/my`, `/api/donations/stats`, `/api/donations/:id` |
| **Badges** | `/api/badges/my`, `/api/badges/user/:userId`, `/api/badges/milestones`, `/api/badges/all` |
| **Leaderboard** | `/api/leaderboard/all-time`, `/api/leaderboard/monthly`, `/api/leaderboard/district/:district`, `/api/leaderboard/blood-group/:group` |
| **SOS** | `/api/sos`, `/api/sos/active`, `/api/sos/my`, `/api/sos/:id`, `/api/sos/:id/respond`, `/api/sos/:id/fulfill`, `/api/sos/:id/cancel` |
| **Health** | `/api/health` |

---

## 🔐 Environment Variables

### Server (`server/.env`)
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/bloodDonation
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
NODE_ENV=development
```

### Client (`client/.env`)
```env
VITE_API_URL=http://localhost:5000
```

---

## 👨‍💻 Developed By
- **[ASMA Computer and IT Solutions](https://www.facebook.com/asmatechsolutions)**
  - 🌐 [Website](#) *(Coming Soon)*
  - 💼 [LinkedIn](https://www.linkedin.com/company/itasma)
  - 📘 [FaceBook](https://www.facebook.com/asmatechsolutions)

---

## 📝 License
MIT
