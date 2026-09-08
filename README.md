# QueueLess

A modern full-stack queue management system designed to make waiting more organized, transparent, and efficient.

QueueLess allows customers to generate and track queue tokens while providing administrators with tools to manage counters, monitor queues, and handle customer flow in real time.

## 🚀 Features

### 👤 Customer Portal

* Generate queue tokens
* View token status
* Track queue position
* Check currently served tokens
* Access a live token pass

### 🛠️ Admin Portal

* Secure admin authentication
* Manage service counters
* Monitor active queues
* Call and manage tokens
* View queue-related information and analytics

### 📺 Public Display

* Live queue display for customers
* Lounge/TV display interface
* Shows currently served tokens and queue information

### ⚡ Real-Time Updates

* Real-time queue updates
* Socket-based communication
* Synchronized queue and counter information

## 🧑‍💻 Tech Stack

### Frontend

* React
* TypeScript
* Tailwind CSS
* Vite
* React Context API

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* Socket.IO

### Development Tools

* Git
* GitHub
* VS Code
* ESLint / Oxlint

## 📁 Project Structure

```text
QueueLess/
│
├── public/
│
├── src/
│   ├── components/
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── common/
│   │   ├── customer/
│   │   ├── public/
│   │   └── simulation/
│   │
│   ├── context/
│   ├── services/
│   ├── types/
│   ├── App.tsx
│   ├── App.css
│   └── main.tsx
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── server.js
│
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

## ⚙️ Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/Shivanshi-04/Queueless.git
```

### 2. Navigate to the project

```bash
cd Queueless
```

### 3. Install frontend dependencies

```bash
npm install
```

### 4. Install backend dependencies

```bash
cd server
npm install
```

### 5. Configure environment variables

Create a `.env` file inside the `server` directory.

Example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

> Never commit your actual `.env` file or secret keys to GitHub.

### 6. Start the backend

From the `server` directory:

```bash
npm start
```

### 7. Start the frontend

Open another terminal in the project root:

```bash
npm run dev
```

The application will then be available through the local development URL provided by Vite.

## 🔐 Environment Variables

The backend uses environment variables for sensitive configuration such as:

* MongoDB connection string
* JWT secret
* Server port
* Other private configuration values

For security, `.env` files are excluded from version control.

## 🔄 Application Flow

```text
Customer
   │
   ▼
Generate Token
   │
   ▼
Join Queue
   │
   ▼
Track Queue Status
   │
   ▼
Admin Manages Queue
   │
   ▼
Counter Calls Token
   │
   ▼
Customer Gets Served
```

## 🎯 Purpose

Traditional queues can lead to long waiting times, crowded spaces, and poor visibility into service progress.

QueueLess aims to provide a digital solution where customers can monitor their queue status while administrators can efficiently manage customer flow from a centralized interface.

## 📌 Future Improvements

* Online appointment scheduling
* SMS/email notifications
* Advanced analytics dashboard
* Multi-branch support
* Improved role-based access control
* Cloud deployment and production optimization

## 👩‍💻 Author

**Shivanshi Dhiman**

GitHub: [Shivanshi-04](https://github.com/Shivanshi-04)

---

⭐ If you find this project useful, consider giving it a star!
