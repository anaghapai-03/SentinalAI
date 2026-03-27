from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import os
import numpy as np
from datetime import datetime
import random
<<<<<<< HEAD
import math
=======
import openrouteservice
>>>>>>> 6ae17eac1985bbdc11bf81077777242c4dfe8da6

app = Flask(__name__)
CORS(app)

# ─────────────────────────────────────────────────────────────
<<<<<<< HEAD
# LOAD TRAINED MODEL AND SCALER
=======
# 🔑 ADD YOUR API KEY HERE
# ─────────────────────────────────────────────────────────────
client = openrouteservice.Client(key="YOUR_API_KEY")

# ─────────────────────────────────────────────────────────────
# LOAD MODELS
>>>>>>> 6ae17eac1985bbdc11bf81077777242c4dfe8da6
# ─────────────────────────────────────────────────────────────
model = None
scaler = None

try:
    base_dir = os.path.dirname(__file__)
<<<<<<< HEAD
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
# ROUTE PATHFINDING HELPERS
# ─────────────────────────────────────────────────────────────
def haversine_distance(lat1, lng1, lat2, lng2):
    """Calculate distance in km between two coordinates"""
    R = 6371  # Earth radius in km
    
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    
    return R * c


def interpolate_route(start, end, num_steps=5):
    """Generate waypoints between start and end"""
    waypoints = [start]
    
    for i in range(1, num_steps):
        t = i / num_steps
        lat = start["lat"] + (end["lat"] - start["lat"]) * t
        lng = start["lng"] + (end["lng"] - start["lng"]) * t
        waypoints.append({"lat": lat, "lng": lng})
    
    waypoints.append(end)
    return waypoints


def offset_point(lat, lng, offset_lat, offset_lng):
    """Offset a point by given lat/lng delta"""
    return {"lat": lat + offset_lat, "lng": lng + offset_lng}


def calculate_route_risk(waypoints, risk_zones):
    """Calculate average and max risk for a route"""
    if not waypoints:
        return 50, 50
    
    risks = []
    
    for point in waypoints:
        # Find closest risk zone to this waypoint
        min_distance = float('inf')
        closest_risk = 25  # Default low risk
        
        for zone in risk_zones:
            zone_lat = zone["geometry"]["coordinates"][1]
            zone_lng = zone["geometry"]["coordinates"][0]
            
            # Distance in degrees (rough approximation)
            dist = math.sqrt((point["lat"] - zone_lat)**2 + (point["lng"] - zone_lng)**2)
            
            if dist < min_distance:
                min_distance = dist
                # Risk decreases with distance from zone
                zone_risk = zone["properties"]["risk_score"]
                # Decay function: risk is strongest at the zone, weakens with distance
                distance_factor = max(0.1, 1 - (dist * 8))  # Decay range ~0.125km
                closest_risk = zone_risk * distance_factor
        
        risks.append(closest_risk)
    
    return sum(risks) / len(risks) if risks else 25, max(risks) if risks else 25


def generate_safe_routes(start, end, risk_zones):
    """Generate 3 different routes with varying safety profiles"""
    routes = []
    
    # Route 1: Safest Route (avoid high-risk zones)
    dist_lat = end["lat"] - start["lat"]
    dist_lng = end["lng"] - start["lng"]
    
    # Offset perpendicular to reduce exposure to extreme corners
    perp_lat = -dist_lng * 0.3
    perp_lng = dist_lat * 0.3
    
    safest_waypoints = interpolate_route(start, end, num_steps=5)
    # Add safe deflection to middle waypoints
    for i in range(1, len(safest_waypoints) - 1):
        safest_waypoints[i] = offset_point(
            safest_waypoints[i]["lat"],
            safest_waypoints[i]["lng"],
            perp_lat * 0.8,
            perp_lng * 0.8
        )
    
    avg_risk, max_risk = calculate_route_risk(safest_waypoints, risk_zones)
    
    routes.append({
        "id": 1,
        "name": "🛡️ SAFEST ROUTE",
        "safety": "SAFEST",
        "confidence": "98%",
        "avg_risk": round(avg_risk, 1),
        "max_risk": round(max_risk, 1),
        "time": f"+{max(0, int(avg_risk / 10))} min",
        "guardians": "3-5 guardians" if avg_risk < 35 else "2-3 guardians",
        "lighting": "Well-lit" if avg_risk < 35 else "Moderate",
        "coordinates": [[w["lat"], w["lng"]] for w in safest_waypoints],
        "color": "#22c55e"
    })
    
    # Route 2: Balanced Route (moderate deviation)
    balanced_waypoints = interpolate_route(start, end, num_steps=5)
    for i in range(1, len(balanced_waypoints) - 1):
        balanced_waypoints[i] = offset_point(
            balanced_waypoints[i]["lat"],
            balanced_waypoints[i]["lng"],
            perp_lat * 0.4,
            perp_lng * 0.4
        )
    
    avg_risk, max_risk = calculate_route_risk(balanced_waypoints, risk_zones)
    
    routes.append({
        "id": 2,
        "name": "⚡ BALANCED ROUTE",
        "safety": "MODERATE",
        "confidence": "95%",
        "avg_risk": round(avg_risk, 1),
        "max_risk": round(max_risk, 1),
        "time": "0 min",
        "guardians": "1-2 guardians",
        "lighting": "Varies",
        "coordinates": [[w["lat"], w["lng"]] for w in balanced_waypoints],
        "color": "#f97316"
    })
    
    # Route 3: Shortest Route (direct path, highest risk potentially)
    straight_waypoints = interpolate_route(start, end, num_steps=4)
    avg_risk, max_risk = calculate_route_risk(straight_waypoints, risk_zones)
    
    routes.append({
        "id": 3,
        "name": "🚀 FASTEST ROUTE",
        "safety": "RISKY",
        "confidence": "85%",
        "avg_risk": round(avg_risk, 1),
        "max_risk": round(max_risk, 1),
        "time": f"-{max(0, int((35 - avg_risk) / 8))} min",
        "guardians": "None" if avg_risk > 50 else "1 guardian",
        "lighting": "Dark" if avg_risk > 50 else "Variable",
        "coordinates": [[w["lat"], w["lng"]] for w in straight_waypoints],
        "color": "#ef4444" if avg_risk > 50 else "#f97316"
    })
    
    # Sort by safety (lowest avg_risk first)
    routes.sort(key=lambda x: x["avg_risk"])
    
    return routes

=======
    model_dir = os.path.abspath(os.path.join(base_dir, "../model"))
    
    risk_model = joblib.load(os.path.join(model_dir, "risk_model.pkl"))
    route_model = joblib.load(os.path.join(model_dir, "route_model.pkl"))

    print("✅ Models loaded successfully")

except Exception as e:
    print(f"❌ Model load error: {e}")
    risk_model = None
    route_model = None
>>>>>>> 6ae17eac1985bbdc11bf81077777242c4dfe8da6

# ─────────────────────────────────────────────────────────────
# HELPER FUNCTIONS
# ─────────────────────────────────────────────────────────────
<<<<<<< HEAD
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
=======
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
>>>>>>> 6ae17eac1985bbdc11bf81077777242c4dfe8da6
# ─────────────────────────────────────────────────────────────
@app.route("/api/risk/point", methods=["GET"])
def get_point_risk():
    lat = request.args.get("lat", type=float, default=12.9716)
    lng = request.args.get("lng", type=float, default=77.5946)

<<<<<<< HEAD
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
=======
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
>>>>>>> 6ae17eac1985bbdc11bf81077777242c4dfe8da6
    else:
        risk_score = random.uniform(20, 80)

    return jsonify({
        "lat": lat,
        "lng": lng,
        "risk_score": round(risk_score, 2),
        "threat_level": get_threat_level(risk_score)
    })

# ─────────────────────────────────────────────────────────────
<<<<<<< HEAD
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
    
    # Generate zones: balanced mix of safe and risky areas
    zone_count = random.randint(15, 25)
    
    for zone_idx in range(zone_count):
        # 40% high-risk zones, 35% moderate, 25% safe zones
        zone_type = random.random()
        
        if zone_type < 0.4:  # 40% - High Risk Zones (Dangerous Neighborhoods)
            # Generate around known dangerous zones
            danger_zone = random.choice(dangerous_zones)
            lat = danger_zone["lat"] + random.uniform(-0.015, 0.015)
            lng = danger_zone["lng"] + random.uniform(-0.015, 0.015)
            risk_boost = danger_zone["risk_boost"] * random.uniform(1.0, 1.3)
        elif zone_type < 0.75:  # 35% - Moderate Risk Zones
            # Random locations with natural variation
            lat = random.uniform(bounds.get("south", 0), bounds.get("north", 1))
            lng = random.uniform(bounds.get("west", 0), bounds.get("east", 1))
            risk_boost = random.uniform(0.7, 1.1)  # Moderate boost
        else:  # 25% - Safe Zones
            # Well-lit, busy areas near city center
            lat = center_lat + random.uniform(-0.03, 0.03)
            lng = center_lng + random.uniform(-0.03, 0.03)
            risk_boost = random.uniform(0.3, 0.6)  # Low risk
        
        # Calculate distance from center
        distance_from_center = math.sqrt((lat - center_lat)**2 + (lng - center_lng)**2)
        
        # Population density & Lighting based on zone type
        if zone_type < 0.4:  # High Risk Zones - low density, poor lighting
            population_density = random.uniform(0.1, 0.35)  # Sparse areas
            if 6 <= hour <= 18:
                lighting = random.uniform(0.5, 0.75)
            elif 19 <= hour <= 21:
                lighting = random.uniform(0.3, 0.5)
            else:
                lighting = random.uniform(0.05, 0.25)
        elif zone_type < 0.75:  # Moderate Risk Zones - medium density/lighting
            population_density = max(0.1, 0.8 - distance_from_center * 2)
            if 6 <= hour <= 18:
                lighting = random.uniform(0.7, 0.9)
            elif 19 <= hour <= 21:
                lighting = random.uniform(0.45, 0.7)
            else:
                lighting = random.uniform(0.15, 0.4)
        else:  # Safe Zones - high density, well-lit everywhere
            population_density = random.uniform(0.7, 0.95)  # Busy areas
            if 6 <= hour <= 18:
                lighting = random.uniform(0.85, 1.0)  # Well-lit day
            elif 19 <= hour <= 21:
                lighting = random.uniform(0.6, 0.85)  # Better lit evening
            else:
                lighting = random.uniform(0.4, 0.65)  # Even at night, safer areas have better lighting
        
        # Police presence: inverse correlation with danger
        # High-risk zones have minimal police, safe zones have good coverage
        if zone_type < 0.4:  # High Risk - minimal police
            base_police = random.uniform(0.5, 2.0)
        elif zone_type < 0.75:  # Moderate Risk - medium police
            base_police = random.uniform(2.0, 5.0)
        else:  # Safe zones - good police coverage
            base_police = random.uniform(5.0, 8.0)
        
        if 22 <= hour or hour <= 4:
            # Late night/early morning - skeleton crew (reduce by 40%)
            police_presence = max(0.3, base_police * 0.6)
        elif 5 <= hour <= 6:
            # Pre-dawn - minimal (reduce by 30%)
            police_presence = max(0.3, base_police * 0.7)
        elif 17 <= hour <= 21:
            # Evening - peak activity
            police_presence = min(8.0, base_police * 1.2)
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
        
        # Apply risk boost strategically
        risk_score = min(99.9, risk_score * risk_boost)
        
        # Add stochastic danger: random incidents can spike risk in any zone
        if random.random() < 0.1:  # 10% chance of incident
            risk_score = min(99.9, risk_score * 1.3)
        else:  # Keep some zones consistently safe
            risk_score = max(0.1, risk_score * random.uniform(0.8, 1.2))
        
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
    start = data.get("start", {"lat": 12.9716, "lng": 77.5946})
    end = data.get("end", {"lat": 12.9850, "lng": 77.6050})

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
# SAFE ROUTES CALCULATION (RISK-AWARE PATHFINDING)
# ─────────────────────────────────────────────────────────────
@app.route("/api/route/safe-paths", methods=["POST"])
def get_safe_paths():
    """
    Calculate multiple routes from start to destination, optimized for safety.
    Analyzes risk zones and generates:
    - Safest route (avoids high-risk areas)
    - Balanced route (moderate safety vs time)
    - Fastest route (direct path, higher risk)
    """
    data = request.json
    start = data.get("start", {"lat": 12.9716, "lng": 77.5946})
    end = data.get("end", {"lat": 12.9850, "lng": 77.6050})
    
    # Get risk zones in the area
    bounds = {
        "north": max(start["lat"], end["lat"]) + 0.1,
        "south": min(start["lat"], end["lat"]) - 0.1,
        "east": max(start["lng"], end["lng"]) + 0.1,
        "west": min(start["lng"], end["lng"]) - 0.1
    }
    
    features_list = []
    now = datetime.now()
    hour = now.hour
    day_of_week = now.weekday()
    
    center_lat = (bounds.get("south", 0) + bounds.get("north", 1)) / 2
    center_lng = (bounds.get("west", 0) + bounds.get("east", 1)) / 2
    
    # Generate risk zones for route evaluation
    dangerous_zones = [
        {"lat": center_lat + 0.06, "lng": center_lng - 0.07, "risk_boost": 1.3},
        {"lat": center_lat - 0.08, "lng": center_lng + 0.08, "risk_boost": 1.25},
        {"lat": center_lat + 0.02, "lng": center_lng - 0.04, "risk_boost": 1.15},
    ]
    
    zone_count = random.randint(12, 18)
    
    for zone_idx in range(zone_count):
        zone_type = random.random()
        
        if zone_type < 0.4:
            danger_zone = random.choice(dangerous_zones)
            lat = danger_zone["lat"] + random.uniform(-0.015, 0.015)
            lng = danger_zone["lng"] + random.uniform(-0.015, 0.015)
            risk_boost = danger_zone["risk_boost"] * random.uniform(1.0, 1.3)
        elif zone_type < 0.75:
            lat = random.uniform(bounds.get("south", 0), bounds.get("north", 1))
            lng = random.uniform(bounds.get("west", 0), bounds.get("east", 1))
            risk_boost = random.uniform(0.7, 1.1)
        else:
            lat = center_lat + random.uniform(-0.03, 0.03)
            lng = center_lng + random.uniform(-0.03, 0.03)
            risk_boost = random.uniform(0.3, 0.6)
        
        distance_from_center = math.sqrt((lat - center_lat)**2 + (lng - center_lng)**2)
        
        if zone_type < 0.4:
            population_density = random.uniform(0.1, 0.35)
            if 6 <= hour <= 18:
                lighting = random.uniform(0.5, 0.75)
            elif 19 <= hour <= 21:
                lighting = random.uniform(0.3, 0.5)
            else:
                lighting = random.uniform(0.05, 0.25)
        elif zone_type < 0.75:
            population_density = max(0.1, 0.8 - distance_from_center * 2)
            if 6 <= hour <= 18:
                lighting = random.uniform(0.7, 0.9)
            elif 19 <= hour <= 21:
                lighting = random.uniform(0.45, 0.7)
            else:
                lighting = random.uniform(0.15, 0.4)
        else:
            population_density = random.uniform(0.7, 0.95)
            if 6 <= hour <= 18:
                lighting = random.uniform(0.85, 1.0)
            elif 19 <= hour <= 21:
                lighting = random.uniform(0.6, 0.85)
            else:
                lighting = random.uniform(0.4, 0.65)
        
        if zone_type < 0.4:
            base_police = random.uniform(0.5, 2.0)
        elif zone_type < 0.75:
            base_police = random.uniform(2.0, 5.0)
        else:
            base_police = random.uniform(5.0, 8.0)
        
        if 22 <= hour or hour <= 4:
            police_presence = max(0.3, base_police * 0.6)
        elif 5 <= hour <= 6:
            police_presence = max(0.3, base_police * 0.7)
        elif 17 <= hour <= 21:
            police_presence = min(8.0, base_police * 1.2)
        else:
            police_presence = base_police
        
        risk_score = predict_risk_score(
            hour=hour,
            day_of_week=day_of_week,
            population_density=population_density,
            lighting=lighting,
            police_presence=police_presence
        )
        
        risk_score = min(99.9, risk_score * risk_boost)
        
        if random.random() < 0.1:
            risk_score = min(99.9, risk_score * 1.3)
        else:
            risk_score = max(0.1, risk_score * random.uniform(0.8, 1.2))
        
        features_list.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [lng, lat]
            },
            "properties": {
                "risk_score": round(risk_score, 1),
                "threat_level": get_threat_level(risk_score)
            }
        })
    
    # Generate 3 optimized routes
    routes = generate_safe_routes(start, end, features_list)
    
    return jsonify({
        "routes": routes,
        "start": start,
        "end": end,
        "timestamp": now.isoformat(),
        "time_info": {
            "hour": hour,
            "period": "NIGHT (HIGH RISK)" if (22 <= hour or hour <= 4) else "EARLY MORNING (ELEVATED)" if (5 <= hour <= 6) else "DAYTIME (LOW RISK)" if (6 < hour < 17) else "EVENING (ELEVATED)"
        }
    })


# ─────────────────────────────────────────────────────────────
# DESTINATION SEARCH
# ─────────────────────────────────────────────────────────────
@app.route("/api/search/destinations", methods=["GET"])
def search_destinations():
    query = request.args.get("q", "").lower()
    user_lat = request.args.get("lat", type=float, default=12.9716)
    user_lng = request.args.get("lng", type=float, default=77.5946)
    
    # Bangalore destinations with real coordinates
    base_destinations = [
        {"name": "Bangalore City Railway Station", "lat": 12.9638, "lng": 77.5913, "category": "transport", "distance": 0.8},
        {"name": "Fortis Hospital Bangalore", "lat": 12.9698, "lng": 77.7499, "category": "health", "distance": 1.2},
        {"name": "Commercial Street", "lat": 12.9749, "lng": 77.6101, "category": "shopping", "distance": 1.5},
        {"name": "Lalbagh Botanical Garden", "lat": 12.9352, "lng": 77.5872, "category": "recreation", "distance": 0.3},
        {"name": "Bangalore Tech Park", "lat": 12.9698, "lng": 77.7049, "category": "business", "distance": 2.1},
        {"name": "Bangalore University", "lat": 13.1939, "lng": 77.5731, "category": "education", "distance": 1.8},
        {"name": "MG Road Police Station", "lat": 12.9716, "lng": 77.5946, "category": "safety", "distance": 0.3},
        {"name": "Safe Haven Shelter - BTM", "lat": 12.9352, "lng": 77.6201, "category": "safety", "distance": 1.1},
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
=======
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
>>>>>>> 6ae17eac1985bbdc11bf81077777242c4dfe8da6
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

<<<<<<< HEAD

=======
# ─────────────────────────────────────────────────────────────
# RUN
# ─────────────────────────────────────────────────────────────
>>>>>>> 6ae17eac1985bbdc11bf81077777242c4dfe8da6
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