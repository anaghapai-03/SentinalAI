from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import os
from datetime import datetime
import random

app = Flask(__name__)
CORS(app)

# ─────────────────────────────────────────────────────────────
# LOAD MODEL (FIXED PATH)
# ─────────────────────────────────────────────────────────────
try:
    base_dir = os.path.dirname(__file__)  # backend/api
    model_path = os.path.abspath(os.path.join(base_dir, "../model/sentinel_model.pkl"))

    model = joblib.load(model_path)
    print("✅ Model loaded successfully:", model_path)

except Exception as e:
    print("❌ Model not found:", e)
    print("⚠️ Using mock predictions")
    model = None


# ─────────────────────────────────────────────────────────────
# PREDICTION ENDPOINT
# ─────────────────────────────────────────────────────────────
@app.route("/predict", methods=["POST"])
def predict():
    data = request.json

    features = [[
        data.get("time", 12),
        data.get("day", 1),
        data.get("crowd", 50),
        data.get("lighting", 80),
        data.get("incidents", 2)
    ]]

    if model:
        risk = int(model.predict(features)[0])
        confidence = float(max(model.predict_proba(features)[0]))
    else:
        risk = random.randint(0, 100)
        confidence = round(random.uniform(0.7, 0.95), 2)

    return jsonify({
        "risk": risk,
        "threat_level": get_threat_level(risk),
        "confidence": confidence,
        "timestamp": datetime.now().isoformat()
    })


# ─────────────────────────────────────────────────────────────
# HELPER FUNCTION
# ─────────────────────────────────────────────────────────────
def get_threat_level(risk):
    if risk > 70:
        return "HIGH"
    elif risk > 40:
        return "MODERATE"
    return "SAFE"


# ─────────────────────────────────────────────────────────────
# POINT RISK (NOW USING MODEL)
# ─────────────────────────────────────────────────────────────
@app.route("/api/risk/point", methods=["GET"])
def get_point_risk():
    lat = request.args.get("lat", type=float, default=0)
    lng = request.args.get("lng", type=float, default=0)

    # Dummy feature generation (replace with real data later)
    features = [[
        random.randint(0, 23),   # time
        random.randint(1, 7),    # day
        random.randint(0, 100),  # crowd
        random.randint(0, 100),  # lighting
        random.randint(0, 10)    # incidents
    ]]

    if model:
        risk_score = float(model.predict(features)[0])
        confidence = float(max(model.predict_proba(features)[0]))
    else:
        risk_score = random.uniform(0, 100)
        confidence = random.uniform(0.8, 0.99)

    return jsonify({
        "lat": lat,
        "lng": lng,
        "risk_score": round(risk_score, 2),
        "threat_level": get_threat_level(risk_score),
        "confidence": round(confidence, 2),
        "timestamp": datetime.now().isoformat()
    })


# ─────────────────────────────────────────────────────────────
# STATS
# ─────────────────────────────────────────────────────────────
@app.route("/api/risk/stats", methods=["GET"])
def get_risk_stats():
    total = 145
    high = random.randint(5, 15)
    moderate = random.randint(25, 40)
    safe = total - high - moderate

    return jsonify({
        "total_zones": total,
        "high_risk_zones": high,
        "moderate_zones": moderate,
        "safe_zones": safe,
        "timestamp": datetime.now().isoformat()
    })


# ─────────────────────────────────────────────────────────────
# ZONES
# ─────────────────────────────────────────────────────────────
@app.route("/api/risk/zones", methods=["POST"])
def get_risk_zones():
    bounds = request.json

    features = []
    for _ in range(random.randint(5, 15)):
        lat = random.uniform(bounds.get("south", 0), bounds.get("north", 1))
        lng = random.uniform(bounds.get("west", 0), bounds.get("east", 1))

        risk = random.uniform(20, 95)

        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [lng, lat]
            },
            "properties": {
                "risk_score": round(risk, 2),
                "threat_level": get_threat_level(risk)
            }
        })

    return jsonify({
        "type": "FeatureCollection",
        "features": features
    })


# ─────────────────────────────────────────────────────────────
# FORECAST
# ─────────────────────────────────────────────────────────────
@app.route("/api/threat/forecast", methods=["GET"])
def get_threat_forecast():
    lat = request.args.get("lat", type=float, default=0)
    lng = request.args.get("lng", type=float, default=0)

    forecast = []
    base = random.uniform(30, 80)

    for i in range(0, 45, 15):
        risk = base + random.uniform(-10, 10)
        forecast.append({
            "time_offset": i,
            "risk_score": round(risk, 2),
            "threat_level": get_threat_level(risk)
        })

    return jsonify({
        "location": {"lat": lat, "lng": lng},
        "forecast": forecast
    })


# ─────────────────────────────────────────────────────────────
# ROUTES
# ─────────────────────────────────────────────────────────────
@app.route("/api/route/suggest", methods=["POST"])
def suggest_route():
    return jsonify({
        "routes": [
            {"name": "Safe Route", "safety_score": 90},
            {"name": "Fast Route", "safety_score": 60},
            {"name": "Risky Route", "safety_score": 30}
        ]
    })


# ─────────────────────────────────────────────────────────────
# HEALTH CHECK
# ─────────────────────────────────────────────────────────────
@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy",
        "model_loaded": model is not None,
        "timestamp": datetime.now().isoformat()
    })


# ─────────────────────────────────────────────────────────────
# RUN SERVER
# ─────────────────────────────────────────────────────────────
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)