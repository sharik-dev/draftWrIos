
# 🎮 Wild Rift Draft Tool (Dockerized + React)

<div align="center">

![React](https://img.shields.io/badge/React-18-blue.svg)
![Vite](https://img.shields.io/badge/Vite-5.0-purple.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-teal.svg)
![Docker](https://img.shields.io/badge/Docker-Enabled-blue.svg)

**The ultimate AI-powered draft tool for Wild Rift.**
Now with a modern React frontend and fully containerized with Docker.

</div>

---

## 🚀 Quick Start (Recommended)

The easiest way to run the project. You only need **Docker** installed.

### 1. Run the magic command
```bash
./start-docker.sh
```

That's it! The app will be available at:
- 🎯 **Frontend:** http://localhost:3000
- 📖 **API Docs:** http://localhost:8000/docs

---

## 🛠️ Architecture

The project has been modernized and split into microservices:

### 🐳 Services
- **Backend**: Python FastAPI (Port 8000)
- **Frontend**: React + Vite (Port 3000)

### 📂 Directory Structure
```
draftingWr/
├── backend/             # FastAPI App
│   ├── api.py
│   └── draft_engine.py
├── frontend-react/      # React App
│   ├── src/
│   ├── public/
│   └── package.json
├── data/                # Shared Data (JSON)
├── docker-compose.yml   # Orchestration
├── backend.Dockerfile   # Backend Image
└── frontend.Dockerfile  # Frontend Image
```

---

## 💻 Manual Setup (Without Docker)

If you prefer to run it manually on your machine:

### Backend
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd backend
uvicorn api:app --reload
```

### Frontend
```bash
cd frontend-react
npm install
npm run dev
```

---

## ✨ Features

- **AI Recommendations**: Based on kit synergies & counters
- **Modern UI**: React 18 with beautiful glassmorphism design
- **Fast**: Vite powered frontend, FastAPI backend
- **Easy**: Single command deployment via Docker

---

## 📝 Credits

Built for Epitech Project 2026.
Based on the original kit-based analysis engine.
