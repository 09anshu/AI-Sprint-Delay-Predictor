# 🚀 AI Sprint Delay Predictor

A full-stack SaaS application that predicts whether an agile sprint will be **delayed or on-time** using Machine Learning. Built with React, Node.js, Flask, and MongoDB.

![Tech Stack](https://img.shields.io/badge/React-19-blue?logo=react)
![Tech Stack](https://img.shields.io/badge/Node.js-Express-green?logo=node.js)
![Tech Stack](https://img.shields.io/badge/Python-Flask-yellow?logo=python)
![Tech Stack](https://img.shields.io/badge/MongoDB-Mongoose-darkgreen?logo=mongodb)
![Tech Stack](https://img.shields.io/badge/ML-Scikit--Learn-orange?logo=scikit-learn)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [Admin Panel](#-admin-panel)
- [ML Model](#-ml-model)
- [Screenshots](#-screenshots)

---

## ✨ Features

### User App (Port 5173)
- 🔐 User authentication (Register / Login with JWT)
- 📁 Create and manage software projects
- ⚡ Create sprints with metrics (story points, bugs, dependencies)
- 🤖 AI-powered sprint delay prediction
- 📊 Dashboard with analytics charts
- 🎨 Modern glassmorphic dark UI

### Admin Panel (Port 5174)
- 🔒 Separate admin login with role-based access
- 📊 Dashboard with 5 KPI cards and 3 charts
- 👥 Full user management (CRUD, block/unblock)
- 📁 Project management across all users
- 🚀 Sprint management with status filtering
- 🤖 Prediction monitoring with accuracy tracking
- 📈 Advanced analytics (delay trends, bug correlation, team performance)
- 🗄️ Raw database viewer (spreadsheet-style)
- ⚙️ System settings display
- 📜 Activity logs with filters
- 🌙 Light / Dark mode toggle

### ML Service (Port 5001)
- 🧠 Random Forest classifier trained on 4000+ project records
- 📉 Predicts delay probability with confidence score
- 🎯 Risk severity classification (Low / Medium / High)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, Tailwind CSS, Recharts, React Router |
| **Admin Panel** | React 19, Vite, Tailwind CSS (light/dark), Recharts |
| **Backend** | Node.js, Express.js, Mongoose, JWT, bcrypt |
| **ML Service** | Python, Flask, Scikit-Learn, Pandas, NumPy |
| **Database** | MongoDB (local or Atlas) |

---

## 📂 Project Structure

```
ai-sprint-predictor/
│
├── frontend/              # User-facing React app (port 5173)
│   ├── src/
│   │   ├── components/    # Navbar, Sidebar, PredictionResult, SeverityMeter
│   │   ├── pages/         # Dashboard, Login, Register, Projects, SprintDetails
│   │   ├── context/       # AuthContext
│   │   └── api/           # Axios client
│   └── package.json
│
├── admin/                 # Admin panel React app (port 5174)
│   ├── src/
│   │   ├── components/    # Sidebar, Navbar, DataTable, KPICard, Modal, ConfirmDialog
│   │   ├── pages/         # Login, Dashboard, Users, Projects, Sprints,
│   │   │                  # Predictions, Analytics, Database, Settings, Logs
│   │   └── context/       # AuthContext, ThemeContext
│   └── package.json
│
├── backend/               # Node.js + Express API (port 5000)
│   ├── models/            # User, Project, Sprint, ActivityLog
│   ├── routes/            # auth, projects, sprints, admin
│   ├── middleware/        # auth, adminAuth
│   ├── config/            # db.js
│   ├── seed-admin.js      # Create default admin account
│   ├── server.js
│   └── .env
│
├── ml-service/            # Python Flask ML API (port 5001)
│   ├── app.py             # Flask prediction endpoint
│   ├── train_model.py     # Model training script
│   ├── model.pkl          # Trained Random Forest model
│   ├── features.pkl       # Feature configuration
│   ├── label_encoder.pkl  # Label encoder
│   └── requirements.txt
│
├── project_risk_raw_dataset.csv   # Training dataset
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18+)
- **Python** (v3.9+)
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd ai-sprint-predictor
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ai-sprint-predictor
JWT_SECRET=your_secret_key_here
ML_SERVICE_URL=http://localhost:5001
```

Seed the admin account:

```bash
node seed-admin.js
```

Start the backend:

```bash
npm run dev
```

### 3. Setup ML Service

```bash
cd ml-service
pip install -r requirements.txt
python app.py
```

### 4. Setup User Frontend

```bash
cd frontend
npm install
npm run dev
```

Opens at → **http://localhost:5173**

### 5. Setup Admin Panel

```bash
cd admin
npm install
npm run dev
```

Opens at → **http://localhost:5174**

---

## 🔑 Environment Variables

Create `backend/.env` with the following:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/ai-sprint-predictor` |
| `JWT_SECRET` | Secret key for JWT tokens | — |
| `ML_SERVICE_URL` | URL of the Flask ML service | `http://localhost:5001` |

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |

### Projects (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | Get user's projects |
| POST | `/api/projects` | Create project |
| DELETE | `/api/projects/:id` | Delete project |

### Sprints (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sprints/:projectId` | Get project sprints |
| POST | `/api/sprints` | Create sprint |
| POST | `/api/sprints/predict` | Run ML prediction |
| GET | `/api/sprints/stats/dashboard` | Dashboard stats |

### Admin (Admin Only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/login` | Admin login |
| GET | `/api/admin/dashboard` | Admin dashboard stats |
| GET/POST/PUT/DELETE | `/api/admin/users` | User management |
| GET/PUT/DELETE | `/api/admin/projects` | Project management |
| GET/PUT/DELETE | `/api/admin/sprints` | Sprint management |
| GET | `/api/admin/predictions` | Prediction monitoring |
| GET | `/api/admin/analytics` | Advanced analytics |
| GET/PUT/DELETE | `/api/admin/database/:collection` | Database CRUD |
| GET | `/api/admin/logs` | Activity logs |
| GET | `/api/admin/settings` | System settings |

### ML Service
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/predict` | Predict sprint delay |
| GET | `/health` | Health check |

---

## 🔐 Admin Panel

### Default Admin Credentials

```
Email:    admin@sprint.com
Password: admin123
```

> ⚠️ **Change the default credentials in production!**

### Admin Screens

| # | Screen | Description |
|---|--------|-------------|
| 1 | Login | Secure admin-only login |
| 2 | Dashboard | KPIs, charts, activity feed |
| 3 | Users | Full CRUD, block/unblock |
| 4 | Projects | All projects, edit/delete |
| 5 | Sprints | All sprints, status filter |
| 6 | Predictions | Accuracy tracking, history |
| 7 | Analytics | Trends, correlations, team performance |
| 8 | Database | Raw spreadsheet view of all collections |
| 9 | Settings | System config, roles |
| 10 | Logs | Timestamped activity feed |

---

## 🧠 ML Model

- **Algorithm:** Random Forest Classifier
- **Dataset:** 4000+ project risk records
- **Features:** Team size, sprint duration, story points, bugs, risk level, dependencies
- **Output:** Delayed / Not Delayed with confidence score and severity level

### Retrain the Model

```bash
cd ml-service
python train_model.py
```

---

## 🖥️ Running All Services

Open **4 terminals** and run:

| Terminal | Command | Port |
|----------|---------|------|
| 1 | `cd backend && npm run dev` | 5000 |
| 2 | `cd ml-service && python app.py` | 5001 |
| 3 | `cd frontend && npm run dev` | 5173 |
| 4 | `cd admin && npm run dev` | 5174 |

---

## 📄 License

This project is for educational purposes.

---

<p align="center">Built with ❤️ using React, Node.js, Python & MongoDB</p>
