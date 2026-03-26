import pandas as pd
import numpy as np
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_absolute_error
import joblib

print("🔄 Loading training data...")
df = pd.read_csv("../data/training_data.csv")

# Features for risk model
risk_features = ['hour', 'day', 'lighting', 'police_presence', 'incidents_24h', 
                 'crowd_density', 'latitude', 'longitude', 'traffic_density']
X_risk = df[risk_features]
y_risk = df['risk_score']

# Split data
X_train_risk, X_test_risk, y_train_risk, y_test_risk = train_test_split(
    X_risk, y_risk, test_size=0.2, random_state=42
)

print("\n✅ TRAINING RISK SCORE MODEL (0-100)...")
risk_model = GradientBoostingRegressor(
    n_estimators=200,
    learning_rate=0.1,
    max_depth=5,
    random_state=42
)
risk_model.fit(X_train_risk, y_train_risk)

# Evaluate risk model
y_pred_risk = risk_model.predict(X_test_risk)
r2_risk = r2_score(y_test_risk, y_pred_risk)
mae_risk = mean_absolute_error(y_test_risk, y_pred_risk)

print(f"  R² Score: {r2_risk:.3f}")
print(f"  MAE: {mae_risk:.2f} points")
print(f"  Model captures {r2_risk*100:.1f}% of variance")

# Save risk model
joblib.dump(risk_model, "risk_model.pkl")
joblib.dump(risk_features, "risk_features.pkl")
print("  ✅ Saved: risk_model.pkl, risk_features.pkl")

# For route model, use aggregated features (route characteristics)
# Routes have: total distance, avg lighting on route, avg police, total incidents in corridor
route_features_list = ['distance', 'lighting', 'police_presence', 'incidents_24h', 'traffic_density', 'crowd_density']
X_route = df[route_features_list]

# Route safety score (inverse of risk, scaled 0-100)
y_route = 100 - y_risk  # High risk = low safety, and vice versa

X_train_route, X_test_route, y_train_route, y_test_route = train_test_split(
    X_route, y_route, test_size=0.2, random_state=42
)

print("\n✅ TRAINING ROUTE SAFETY MODEL (0-100)...")
route_model = RandomForestRegressor(
    n_estimators=150,
    max_depth=8,
    random_state=42
)
route_model.fit(X_train_route, y_train_route)

# Evaluate route model
y_pred_route = route_model.predict(X_test_route)
r2_route = r2_score(y_test_route, y_pred_route)
mae_route = mean_absolute_error(y_test_route, y_pred_route)

print(f"  R² Score: {r2_route:.3f}")
print(f"  MAE: {mae_route:.2f} points")
print(f"  Model captures {r2_route*100:.1f}% of variance")

# Save route model
joblib.dump(route_model, "route_model.pkl")
joblib.dump(route_features_list, "route_features.pkl")
print("  ✅ Saved: route_model.pkl, route_features.pkl")

print("\n" + "="*50)
print("✨ ALL MODELS TRAINED SUCCESSFULLY")
print("="*50)