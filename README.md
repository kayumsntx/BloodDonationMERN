# 🩸 Blood Donation MERN

A full-stack blood donation management system built with the MERN stack (MongoDB, Express.js, React, Node.js). Connect donors and recipients in real-time with emergency alerts and instant messaging.

![MERN Stack](https://img.shields.io/badge/MERN-Stack-green)
![License](https://img.shields.io/badge/License-MIT-blue)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)

---

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

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/siteserv/BloodDonationMERN.git
   cd BloodDonationMERN
   ```

2. **Install server dependencies**

   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**

   ```bash
   cd ../client
   npm install
   ```

4. **Configure environment variables**

   Create `.env` file in the `server` folder:

   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_key
   ```

5. **Run the application**

   **Terminal 1 (Server):**

   ```bash
   cd server
   npm run dev
   ```

   Server runs on: `http://localhost:5000`

   **Terminal 2 (Client):**

   ```bash
   cd client
   npm run dev
   ```

   Client runs on: `http://localhost:5173`

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/users` | Get all users |
| PUT | `/api/users/profile` | Update profile |
| POST | `/api/requests` | Create blood request |
| GET | `/api/requests` | Get all requests |
| PUT | `/api/requests/:id` | Update request |
| GET | `/api/messages/public` | Get public messages |

## 🔮 Future Features

- [ ] Mobile App (React Native)
- [ ] Push Notifications
- [ ] SMS Alerts
- [ ] Location-based donor matching
- [ ] Blood bank integration
- [ ] Donation history tracking
- [ ] Admin dashboard
- [ ] Email verification

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request



## Acknowledgments

- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) - Cloud database
- [Socket.io](https://socket.io/) - Real-time communication
- [UI Avatars](https://ui-avatars.com/) - Avatar generation
