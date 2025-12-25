# RehabTracer 🏥

RehabTracer is a comprehensive web application designed to bridge the gap between patients and doctors during the rehabilitation process. It features real-time progress tracking, task management, and direct communication.

## 🌟 Features

*   **Patient Dashboard**: Track daily exercises, view progress charts, and log pain levels.
*   **Doctor Dashboard**: Manage patients, assign recovery plans, and monitor patient adherence.
*   **Secure Authentication**: Role-based access for Doctors and Patients.
*   **Real-time Chat**: Direct messaging between connected patients and doctors.
*   **Contact Form**: Users can reach out to support via email (powered by Nodemailer).

---

## 🚀 Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

Ensure you have the following installed:

1.  **Node.js** (v18 or higher) - [Download Here](https://nodejs.org/)
2.  **MongoDB** - You need a running MongoDB instance.
    *   **Option A**: [Install MongoDB Community Server](https://www.mongodb.com/try/download/community) locally.
    *   **Option B**: Create a free cloud database on [MongoDB Atlas](https://www.mongodb.com/atlas).

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/RehabTracer.git
cd RehabTracer
```

### 2️⃣ Backend Setup

Navigate to the backend folder and install dependencies:

```bash
cd backend
npm install
```

#### Environment Variables (.env)

You **MUST** create a `.env` file in the `backend` directory to run the server.

1.  Create a file named `.env` inside the `backend/` folder.
2.  Copy and paste the following content into it:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/rehabtracer
JWT_SECRET=your_super_secret_jwt_key_here

# 📧 Email Configuration (Required for Contact Form)
# If using Gmail, you MUST use an App Password, not your normal password.
# 1. Turn on 2-Step Verification in Google Account -> Security.
# 2. Search for "App passwords" and create one.
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_char_app_password
```

*   **Note**: If you are using MongoDB Atlas, replace the `MONGO_URI` value with your connection string.

#### Start the Backend Server

```bash
npm start
```

You should see:
> Server running on port 5000
> MongoDB Connected Successfully

---

### 3️⃣ Frontend Setup

Open a new terminal window, navigate to the frontend folder, and install dependencies:

```bash
cd frontend
npm install
```

#### Start the Frontend Development Server

```bash
npm run dev
```

You should see:
> VITE vX.X.X  ready in X ms
> Local:   http://localhost:5173/

---

### ✅ Deployment Checklist

Before pushing to GitHub or deploying:
1.  **Do NOT push `.env` files.** The `.gitignore` is already set up to exclude them.
2.  **Do NOT push `node_modules`.**
3.  Ensure your `MONGO_URI` in production points to a secure database (like Atlas), not localhost.

### 🛠️ Built With

*   **Frontend**: React, Vite, TailwindCSS, Framer Motion
*   **Backend**: Node.js, Express, MongoDB, Mongoose, Socket.io, Nodemailer

---

### 🤝 Contributing

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.
