# SentinalAI
# 🚀 SENTINEL – Smart Safety & Risk Prediction System

## 📌 Overview

SENTINEL is an intelligent safety system that predicts risk levels and suggests safer routes using Machine Learning and spatial algorithms.

It combines:

* 🤖 **Risk Prediction Model (ML)**
* 🗺️ **Real-time Risk Map Visualization**
* 🚦 **Safe Route Recommendation Engine**

---

## 🧠 Features

### 🔹 Risk Prediction

* Predicts safety risk using features:

  * Time of day
  * Day of week
  * Crowd density
  * Lighting conditions
  * Past incidents
* Outputs:

  * Risk score (0–100)
  * Threat level (SAFE / MODERATE / HIGH)
  * Confidence score

---

### 🔹 Interactive Risk Map

* Displays risk zones on a live map
* Color-coded markers:

  * 🟢 Safe
  * 🟠 Moderate
  * 🔴 High Risk
* Built using React + Leaflet

---

### 🔹 Safe Route Suggestion

* Uses graph-based pathfinding (A*)
* Avoids high-risk areas
* Suggests safest route between two points

---

### 🔹 Additional APIs

* 📍 Point risk prediction
* 📊 Risk statistics
* 🔮 Threat forecasting
* 👮 Guardian alert system
* 💡 Infrastructure control simulation

---

## 🏗️ Project Structure

```
backend/
│
├── api/
│   └── app.py                # Flask API server
│
├── model/
│   ├── train_model.py       # ML training script
│   ├── sentinel_model.pkl   # Trained model
│   └── route_model.py       # Pathfinding engine
│
├── data/
│   └── dataset.csv          # Training dataset
│
frontend/
│
├── src/
│   ├── App.jsx
│   └── MapView.jsx          # Map visualization
│
├── index.html
├── package.json
└── vite.config.js

mobile/                      # (Optional React Native app)
```

---

## ⚙️ Installation

### 1️⃣ Backend Setup

```bash
cd backend
pip install -r requirements.txt
python model/train_model.py   # Train model
python api/app.py             # Start server
```

---

### 2️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open:

```
http://localhost:5173
```

---

## 🔗 API Endpoints

### 🧠 Prediction

```
POST /predict
```

### 📍 Risk at Location

```
GET /api/risk/point
```

### 🗺️ Risk Zones (Map)

```
POST /api/risk/zones
```

### 🚦 Route Suggestion

```
POST /api/route/suggest
```

### 🔮 Forecast

```
GET /api/threat/forecast
```

### ❤️ Health Check

```
GET /health
```

---

## 🧪 Example Request

```json
POST /predict

{
  "time": 22,
  "day": 6,
  "crowd": 90,
  "lighting": 20,
  "incidents": 3
}
```

---

## 🛠️ Tech Stack

* **Backend:** Flask, Python
* **Machine Learning:** Scikit-learn (RandomForest)
* **Frontend:** React (Vite)
* **Maps:** Leaflet.js
* **Routing Engine:** NetworkX

---

## 🚀 Future Improvements

* 🌍 Real-world GPS integration
* 📡 Live data ingestion (CCTV / IoT)
* 📊 Heatmap visualization
* 🚗 Traffic-aware routing
* 📱 Full mobile deployment

---

## 👨‍💻 Author

Developed as a smart safety system project for real-time risk analysis and route optimization.

---

## ⭐ Contribution

Feel free to fork, improve, and build on top of this system!

---

## 📄 License

MIT License
