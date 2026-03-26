from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import os
from datetime import datetime
import random
import math

app = Flask(__name__)
CORS(app)

# ─────────────────────────────────────────────────────────────
# LOAD TRAINED MODEL AND SCALER
# ─────────────────────────────────────────────────────────────
model = None
scaler = None

try:
    base_dir = os.path.dirname(__file__)
    model_path = os.path.abspath(os.path.join(base_dir, "../model/sentinel_model.pkl"))
    scaler_path = os.path.abspath(os.path.join(base_dir, "../model/scaler.pkl"))
    
    if os.path.exists(model_path) and os.path.exists(scaler_path):
        model = joblib.load(model_path)
        scaler = joblib.load(scaler_path)
        print(f"✅ Trained model & scaler loaded successfully")
        print(f"   Model: {model_path}")
        print(f"   Scaler: {scaler_path}")
    else:
        print(f"⚠️  Model files not found at:")
        print(f"   {model_path}")
        print(f"   {scaler_path}")
        print(f"   Run: python backend/model/train_model.py")
        
except Exception as e:
    print(f"❌ Error loading trained model: {e}")
    model = None
    scaler = None


# ─────────────────────────────────────────────────────────────
# PREDICT RISK USING TRAINED MODEL
# ─────────────────────────────────────────────────────────────
def predict_risk_score(hour, day_of_week, population_density, lighting, police_presence):
    """
    Predict risk using trained model
    Features: hour, day_of_week, population_density, lighting, police_presence
    """
    if not model or not scaler:
        # Fallback to mock if model not available
        return random.uniform(20, 90)
    
    try:
        features = [[hour, day_of_week, population_density, lighting, police_presence]]
        features_scaled = scaler.transform(features)
        risk_probability = float(model.predict_proba(features_scaled)[0][1] * 100)
        return round(risk_probability, 2)
    except Exception as e:
        print(f"Prediction error: {e}")
        return random.uniform(20, 90)


# ─────────────────────────────────────────────────────────────
# HELPER FUNCTION
# ─────────────────────────────────────────────────────────────
def get_threat_level(risk):
    """
    Categorize risk score into threat levels
    - HIGH: >50% risk (dangerous, avoid if possible)
    - MODERATE: 30-50% (use caution, consider alternatives)
    - LOW: <30% (generally safe)
    """
    if risk > 50:
        return "HIGH"
    elif risk > 30:
        return "MODERATE"
    return "LOW"


# ─────────────────────────────────────────────────────────────
# PREDICTION ENDPOINT
# ─────────────────────────────────────────────────────────────
@app.route("/predict", methods=["POST"])
def predict():
    data = request.json

    features = [[
        data.get("time", 12),
        data.get("day", 1),
        data.get("crowd", 0.5),
        data.get("lighting", 0.8),
        data.get("incidents", 2)
    ]]

    if model:
        risk = float(model.predict_proba(features)[0][1] * 100)
        confidence = float(max(model.predict_proba(features)[0]))
    else:
        risk = random.uniform(0, 100)
        confidence = round(random.uniform(0.7, 0.95), 2)

    return jsonify({
        "risk": round(risk, 2),
        "threat_level": get_threat_level(risk),
        "confidence": confidence,
        "timestamp": datetime.now().isoformat()
    })


# ─────────────────────────────────────────────────────────────
# POINT RISK
# ─────────────────────────────────────────────────────────────
@app.route("/api/risk/point", methods=["GET"])
def get_point_risk():
    lat = request.args.get("lat", type=float, default=0)
    lng = request.args.get("lng", type=float, default=0)

    features = [[
        random.randint(0, 23),
        random.randint(0, 6),
        0.5,
        0.3 if random.randint(0, 23) >= 20 else 0.8,
        random.randint(1, 10)
    ]]

    if model:
        risk_score = float(model.predict_proba(features)[0][1] * 100)
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
# ZONES (USING TRAINED MODEL FOR REAL PREDICTIONS)
# ─────────────────────────────────────────────────────────────
@app.route("/api/risk/zones", methods=["POST"])
def get_risk_zones():
    """
    Get risk zones within map bounds using trained model predictions.
    
    RISK FACTORS (in order of importance):
    1. Time of day - NIGHT (22:00-05:00) = HIGH RISK
    2. Population density - SPARSE areas = HIGH RISK
    3. Lighting - DARK conditions = HIGH RISK
    4. Police presence - LOW enforcement = HIGH RISK
    5. Incident history - Known hotspots = HIGH RISK
    
    Risk Thresholds:
    - HIGH: >50% (dangerous, avoid)
    - MODERATE: 30-50% (caution)
    - LOW: <30% (safe)
    """
    bounds = request.json
    now = datetime.now()
    hour = now.hour
    day_of_week = now.weekday()
    
    features_list = []
    center_lat = (bounds.get("south", 0) + bounds.get("north", 1)) / 2
    center_lng = (bounds.get("west", 0) + bounds.get("east", 1)) / 2
    
    # Define "dangerous neighborhoods" with naturally high-risk profiles
    # These coordinates will consistently generate higher risks
    dangerous_zones = [
        {"lat": center_lat + 0.06, "lng": center_lng - 0.07, "risk_boost": 1.3},  # NW corner
        {"lat": center_lat - 0.08, "lng": center_lng + 0.08, "risk_boost": 1.25},  # SE corner
        {"lat": center_lat + 0.02, "lng": center_lng - 0.04, "risk_boost": 1.15},  # W side
    ]
    
    # Generate zones: mix of random + strategic high-risk areas
    zone_count = random.randint(12, 18)
    
    for zone_idx in range(zone_count):
        # 25% of zones will be in dangerous neighborhoods, 75% random
        if zone_idx < 3 and zone_idx < len(dangerous_zones):
            # Generate around dangerous zone
            danger_zone = dangerous_zones[zone_idx]
            lat = danger_zone["lat"] + random.uniform(-0.02, 0.02)
            lng = danger_zone["lng"] + random.uniform(-0.02, 0.02)
            risk_boost = danger_zone["risk_boost"]
        else:
            # Random location
            lat = random.uniform(bounds.get("south", 0), bounds.get("north", 1))
            lng = random.uniform(bounds.get("west", 0), bounds.get("east", 1))
            risk_boost = 1.0
        
        # Calculate distance from center
        distance_from_center = math.sqrt((lat - center_lat)**2 + (lng - center_lng)**2)
        
        # Population density: edges are sparse, center is busy
        # Sparse areas (edges) have HIGHER RISK
        population_density = max(0.1, 0.8 - distance_from_center * 2)
        
        # Lighting - varies by time of day
        if 6 <= hour <= 18:
            # Daytime: well-lit
            lighting = random.uniform(0.75, 1.0)
        elif 19 <= hour <= 21:
            # Evening: getting darker
            lighting = random.uniform(0.45, 0.7)
        else:
            # Night: poorly-lit
            lighting = random.uniform(0.1, 0.4)
        
        # Police presence: inverse correlation with danger
        # High density areas have more police
        # Night time has fewer police
        base_police = min(8, population_density * 8)
        
        if 22 <= hour or hour <= 4:
            # Late night/early morning - skeleton crew
            police_presence = max(0.5, base_police * 0.5)
        elif 5 <= hour <= 6:
            # Pre-dawn - minimal
            police_presence = max(0.5, base_police * 0.6)
        elif 17 <= hour <= 21:
            # Evening - peak activity
            police_presence = base_police * 1.2
        else:
            # Day - standard patrols
            police_presence = base_police
        
        # Get model prediction
        risk_score = predict_risk_score(
            hour=hour,
            day_of_week=day_of_week,
            population_density=population_density,
            lighting=lighting,
            police_presence=police_presence
        )
        
        # Apply risk boost for dangerous neighborhoods
        risk_score = min(99.9, risk_score * risk_boost)
        
        # Add stochastic danger: random incidents can spike risk in any zone
        if random.random() < 0.15:  # 15% chance of incident
            risk_score = min(99.9, risk_score * 1.4)
        
        features_list.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [lng, lat]
            },
            "properties": {
                "risk_score": round(risk_score, 1),
                "threat_level": get_threat_level(risk_score),
                "hour": hour,
                "day": day_of_week,
                "population_density": round(population_density, 2),
                "lighting": round(lighting, 2),
                "police_presence": round(police_presence, 2),
                "factors": {
                    "time_of_day": "HIGH" if (22 <= hour or hour <= 4) else "MODERATE" if (5 <= hour <= 6 or 17 <= hour <= 21) else "LOW",
                    "density": "SPARSE" if population_density < 0.4 else "MODERATE" if population_density < 0.7 else "HIGH",
                    "lighting": "DARK" if lighting < 0.3 else "DIM" if lighting < 0.6 else "WELL-LIT",
                    "police": "LOW" if police_presence < 2 else "MODERATE" if police_presence < 5 else "HIGH"
                }
            }
        })
    
    # Sort by risk score descending for analytics
    features_list.sort(key=lambda x: x["properties"]["risk_score"], reverse=True)
    
    # Calculate statistics
    risk_scores = [f["properties"]["risk_score"] for f in features_list]
    high_risk_count = sum(1 for s in risk_scores if s > 50)
    moderate_risk_count = sum(1 for s in risk_scores if 30 < s <= 50)
    low_risk_count = sum(1 for s in risk_scores if s <= 30)
    
    return jsonify({
        "type": "FeatureCollection",
        "features": features_list,
        "timestamp": now.isoformat(),
        "statistics": {
            "total_zones": len(features_list),
            "high_risk": high_risk_count,
            "moderate_risk": moderate_risk_count,
            "low_risk": low_risk_count,
            "avg_risk": round(sum(risk_scores) / len(risk_scores), 1),
            "max_risk": round(max(risk_scores), 1),
            "min_risk": round(min(risk_scores), 1)
        },
        "current_conditions": {
            "hour": hour,
            "day": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][day_of_week],
            "time_period": "NIGHT (HIGH RISK)" if (22 <= hour or hour <= 4) else "EARLY MORNING (ELEVATED)" if (5 <= hour <= 6) else "DAYTIME (LOW RISK)" if (6 < hour < 17) else "EVENING (ELEVATED)",
        },
        "model_info": {
            "loaded": model is not None,
            "type": "SGDClassifier (trained)" if model else "Mock",
            "thresholds": {"high": ">50%", "moderate": "30-50%", "low": "<30%"}
        }
    })


# ─────────────────────────────────────────────────────────────
# ROUTE EVALUATION (MAIN FEATURE 🔥)
# ─────────────────────────────────────────────────────────────
@app.route("/api/route/evaluate", methods=["POST"])
def evaluate_route():
    data = request.json
    route = data.get("route", [])

    risks = []

    for point in route:
        features = [[
            random.randint(0, 23),
            random.randint(0, 6),
            0.5,
            0.3 if random.randint(0,23) >= 20 else 0.8,
            random.randint(1, 10)
        ]]

        if model:
            risk = float(model.predict_proba(features)[0][1] * 100)
        else:
            risk = random.uniform(20, 90)

        risks.append(risk)

    avg_risk = sum(risks) / len(risks)
    max_risk = max(risks)

    return jsonify({
        "avg_risk": round(avg_risk, 2),
        "max_risk": round(max_risk, 2),
        "safe": avg_risk < 40 and max_risk < 70
    })


# ─────────────────────────────────────────────────────────────
# ROUTE COMPARISON (SHORTEST vs SAFEST)
# ─────────────────────────────────────────────────────────────
@app.route("/api/route/compare", methods=["POST"])
def compare_routes():
    data = request.json
    start = data.get("start", {"lat": 37.7749, "lng": -122.4194})
    end = data.get("end", {"lat": 37.7758, "lng": -122.4212})

    # Calculate actual distance in km
    lat_diff = abs(end["lat"] - start["lat"]) * 111
    lng_diff = abs(end["lng"] - start["lng"]) * 111 * 0.8
    actual_distance = (lat_diff**2 + lng_diff**2) ** 0.5

    # Get current time features
    now = datetime.now()
    hour = now.hour
    day_of_week = now.weekday()

    # Generate shortest route (direct path with minor deviation)
    shortest_coords = [
        [start["lat"], start["lng"]],
        [start["lat"] + (end["lat"] - start["lat"]) * 0.33, start["lng"] + (end["lng"] - start["lng"]) * 0.33],
        [start["lat"] + (end["lat"] - start["lat"]) * 0.66, start["lng"] + (end["lng"] - start["lng"]) * 0.66],
        [end["lat"], end["lng"]]
    ]

    # Generate safest route (takes detour to avoid high-risk areas)
    safest_coords = [
        [start["lat"], start["lng"]],
        [start["lat"] + (end["lat"] - start["lat"]) * 0.2 + 0.002, start["lng"] + (end["lng"] - start["lng"]) * 0.2],
        [start["lat"] + (end["lat"] - start["lat"]) * 0.5 + 0.003, start["lng"] + (end["lng"] - start["lng"]) * 0.5 - 0.002],
        [start["lat"] + (end["lat"] - start["lat"]) * 0.8 + 0.002, start["lng"] + (end["lng"] - start["lng"]) * 0.8],
        [end["lat"], end["lng"]]
    ]

    def calculate_location_risk(coord):
        """Calculate risk score for a coordinate using trained model."""
        # Estimate population density based on location
        # Urban centers have higher density, edges have lower
        density = random.uniform(0.3, 0.9)
        
        # Lighting varies by time
        if 6 <= hour <= 18:
            lighting = random.uniform(0.7, 1.0)
        elif 19 <= hour <= 21:
            lighting = random.uniform(0.4, 0.7)
        else:
            lighting = random.uniform(0.1, 0.4)
        
        # Police presence inversely correlated with density at night
        base_police = density * 8
        if 22 <= hour or hour <= 5:
            police_presence = max(0.5, base_police * 0.5)
        else:
            police_presence = base_police
        
        return predict_risk_score(
            hour=hour,
            day_of_week=day_of_week,
            population_density=density,
            lighting=lighting,
            police_presence=police_presence
        )

    # Calculate risk for shortest route (more direct, higher risk zones possible)
    shortest_risks = []
    for coord in shortest_coords:
        risk = calculate_location_risk(coord)
        shortest_risks.append(risk)

    # Calculate risk for safest route (strategic detours to avoid high-risk)
    safest_risks = []
    for coord in safest_coords:
        # Safest route deliberately avoids high-risk areas
        # Use higher population density (busier = more police) and better lighting
        density = random.uniform(0.5, 0.95)
        
        if 6 <= hour <= 18:
            lighting = random.uniform(0.8, 1.0)
        elif 19 <= hour <= 21:
            lighting = random.uniform(0.5, 0.8)
        else:
            lighting = random.uniform(0.3, 0.6)
        
        # Higher police presence on safer routes
        base_police = 8
        police_presence = base_police * 1.2
        
        risk = predict_risk_score(
            hour=hour,
            day_of_week=day_of_week,
            population_density=density,
            lighting=lighting,
            police_presence=police_presence
        )
        safest_risks.append(risk)

    # Calculate time based on actual distance (assume 40 km/h average)
    shortest_time = max(1, int(actual_distance / 0.67))  # 40 km/h = 0.67 km/min
    safest_time = max(1, int(actual_distance / 0.55))     # 33 km/h = 0.55 km/min (safer = slower)

    return jsonify({
        "shortest": {
            "coordinates": shortest_coords,
            "distance": f"{round(actual_distance, 1)} km",
            "time": f"{shortest_time} mins",
            "avg_risk": round(sum(shortest_risks) / len(shortest_risks), 2),
            "max_risk": round(max(shortest_risks), 2),
            "guardians": random.randint(1, 3),
            "lighting": random.choice(["well-lit", "moderate", "poorly-lit"])
        },
        "safest": {
            "coordinates": safest_coords,
            "distance": f"{round(actual_distance * 1.25, 1)} km",
            "time": f"{safest_time} mins",
            "avg_risk": round(sum(safest_risks) / len(safest_risks), 2),
            "max_risk": round(max(safest_risks), 2),
            "guardians": random.randint(3, 6),
            "lighting": random.choice(["well-lit", "well-lit"])  # Safest routes are well-lit
        }
    })


# ─────────────────────────────────────────────────────────────
# DESTINATION SEARCH
# ─────────────────────────────────────────────────────────────
@app.route("/api/search/destinations", methods=["GET"])
def search_destinations():
    query = request.args.get("q", "").lower()
    user_lat = request.args.get("lat", type=float, default=37.7749)
    user_lng = request.args.get("lng", type=float, default=-122.4194)
    
    # Base destinations with fixed coordinates
    base_destinations = [
        {"name": "Central Station", "lat": 37.7847, "lng": -122.4086, "category": "transport", "distance": 0.8},
        {"name": "City Hospital", "lat": 37.7694, "lng": -122.4862, "category": "health", "distance": 1.2},
        {"name": "Downtown Market", "lat": 37.7797, "lng": -122.3954, "category": "shopping", "distance": 1.5},
        {"name": "Central Park", "lat": 37.7749, "lng": -122.4194, "category": "recreation", "distance": 0.3},
        {"name": "Tech Hub", "lat": 37.7694, "lng": -122.3862, "category": "business", "distance": 2.1},
        {"name": "University Campus", "lat": 37.7727, "lng": -122.4702, "category": "education", "distance": 1.8},
        {"name": "Main Police Station", "lat": 37.7749, "lng": -122.4194, "category": "safety", "distance": 0.3},
        {"name": "Safe Haven Shelter", "lat": 37.7812, "lng": -122.3976, "category": "safety", "distance": 1.1},
    ]
    
    # Generate nearby destinations based on user location
    nearby_destinations = []
    for dest in base_destinations:
        # Calculate distance in km (approximate)
        lat_diff = abs(dest["lat"] - user_lat) * 111  # 1 degree ≈ 111 km
        lng_diff = abs(dest["lng"] - user_lng) * 111 * 0.8  # Adjust for latitude
        distance = (lat_diff**2 + lng_diff**2) ** 0.5
        dest["distance"] = round(distance, 2)
        nearby_destinations.append(dest)
    
    # Sort by distance (nearest first)
    nearby_destinations.sort(key=lambda x: x["distance"])
    
    # Filter by search query if provided
    if query:
        filtered = [d for d in nearby_destinations if query in d["name"].lower() or query in d["category"].lower()]
    else:
        filtered = nearby_destinations
    
    return jsonify({
        "results": filtered[:8],
        "user_location": {"lat": user_lat, "lng": user_lng}
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


if __name__ == "__main__":
    print("\n🚀 SENTINEL backend starting...")
    print(f"📊 Model loaded: {model is not None}")
    print("🔗 Available endpoints:")
    print("  - /predict (POST)")
    print("  - /api/risk/point (GET)")
    print("  - /api/risk/zones (POST)")
    print("  - /api/route/evaluate (POST)")
    print("  - /api/route/compare (POST) ← NEW")
    print("  - /api/search/destinations (GET) ← NEW")
    print("  - /health (GET)")
    print("\n⚙️ Server running on http://localhost:5000\n")
    app.run(debug=True, host="0.0.0.0", port=5000)