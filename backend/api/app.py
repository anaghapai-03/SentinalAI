from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import os
import numpy as np
from datetime import datetime
import random
import openrouteservice

app = Flask(__name__)
CORS(app)

# ─────────────────────────────────────────────────────────────
# 🔑 ADD YOUR API KEY HERE
# ─────────────────────────────────────────────────────────────
client = openrouteservice.Client(key="YOUR_API_KEY")

# ─────────────────────────────────────────────────────────────
# LOAD MODELS
# ─────────────────────────────────────────────────────────────
try:
    base_dir = os.path.dirname(__file__)
    model_dir = os.path.abspath(os.path.join(base_dir, "../model"))
    
    risk_model = joblib.load(os.path.join(model_dir, "risk_model.pkl"))
    route_model = joblib.load(os.path.join(model_dir, "route_model.pkl"))

    print("✅ Models loaded successfully")

except Exception as e:
    print(f"❌ Model load error: {e}")
    risk_model = None
    route_model = None

# ─────────────────────────────────────────────────────────────
# HELPER FUNCTIONS
# ─────────────────────────────────────────────────────────────
def get_threat_level(score):
    if score >= 70:
        return "HIGH"
    elif score >= 40:
        return "MODERATE"
    return "SAFE"


def calculate_route_risk(coords):
    risks = []

    for coord in coords[::10]:  # sample points
        lat, lng = coord[1], coord[0]

        hour = datetime.now().hour
        day = datetime.now().weekday()

        lighting = random.uniform(40, 90)
        police_presence = random.uniform(30, 80)
        incidents = np.random.poisson(3)
        crowd = random.uniform(20, 80)
        traffic = random.uniform(30, 90)

        features = np.array([[ 
            hour, day, lighting, police_presence,
            incidents, crowd, lat, lng, traffic
        ]])

        if risk_model:
            risk = float(risk_model.predict(features)[0])
        else:
            risk = random.uniform(20, 80)

        risks.append(risk)

    return sum(risks) / len(risks)

# ─────────────────────────────────────────────────────────────
# 📍 POINT RISK
# ─────────────────────────────────────────────────────────────
@app.route("/api/risk/point", methods=["GET"])
def get_point_risk():
    lat = request.args.get("lat", type=float, default=12.9716)
    lng = request.args.get("lng", type=float, default=77.5946)

    hour = datetime.now().hour
    day = datetime.now().weekday()

    lighting = random.uniform(40, 90)
    police = random.uniform(30, 80)
    incidents = np.random.poisson(3)
    crowd = random.uniform(20, 80)
    traffic = random.uniform(30, 90)

    features = np.array([[ 
        hour, day, lighting, police, incidents,
        crowd, lat, lng, traffic
    ]])

    if risk_model:
        risk_score = float(risk_model.predict(features)[0])
    else:
        risk_score = random.uniform(20, 80)

    return jsonify({
        "lat": lat,
        "lng": lng,
        "risk_score": round(risk_score, 2),
        "threat_level": get_threat_level(risk_score)
    })

# ─────────────────────────────────────────────────────────────
# 🗺️ ROUTE SUGGESTION (REAL)
# ─────────────────────────────────────────────────────────────
@app.route("/api/route/suggest", methods=["POST"])
def suggest_route():
    data = request.json or {}

    start = data.get("start")   # [lng, lat]
    end = data.get("end")

    if not start or not end:
        return jsonify({"error": "Start and End required"}), 400

    try:
        routes_data = client.directions(
            coordinates=[start, end],
            profile='driving-car',
            format='geojson',
            alternative_routes=True
        )

        routes = []

        for idx, route in enumerate(routes_data['features']):
            coords = route['geometry']['coordinates']

            distance = route['properties']['summary']['distance'] / 1000
            duration = route['properties']['summary']['duration'] / 60

            risk_score = calculate_route_risk(coords)

            routes.append({
                "id": f"route_{idx}",
                "coords": coords,
                "distance": round(distance, 2),
                "time": round(duration),
                "risk_score": round(risk_score, 2)
            })

        shortest = min(routes, key=lambda x: x["distance"])
        safest = min(routes, key=lambda x: x["risk_score"])

        return jsonify({
            "shortest": shortest,
            "safest": safest,
            "all_routes": routes
        })

    except Exception as e:
        return jsonify({"error": str(e)})

# ─────────────────────────────────────────────────────────────
# 📊 STATS
# ─────────────────────────────────────────────────────────────
@app.route("/api/risk/stats", methods=["GET"])
def stats():
    return jsonify({
        "city_risk": random.uniform(30, 70),
        "incidents_24h": random.randint(10, 40)
    })

# ─────────────────────────────────────────────────────────────
# ❤️ HEALTH
# ─────────────────────────────────────────────────────────────
@app.route("/health")
def health():
    return jsonify({
        "status": "running",
        "model_loaded": risk_model is not None
    })

# ─────────────────────────────────────────────────────────────
# RUN
# ─────────────────────────────────────────────────────────────
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)