"""
Sentinel AI Risk Prediction Model Training Script

This script trains an SGDClassifier to predict high-risk areas based on:
- hour: Current hour (0-23)
- day_of_week: Day of week (0=Monday, 6=Sunday)
- population_density: Area population density (0.0-1.0)
- lighting: Lighting conditions (0.0=dark, 1.0=well-lit)
- police_presence: Number of police units in area (0-10)

Target: risk_category (0=safe/low-risk, 1=high-risk/incident area)
"""
import pandas as pd
import numpy as np
<<<<<<< HEAD
from sklearn.linear_model import SGDClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
=======
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_absolute_error
>>>>>>> 6ae17eac1985bbdc11bf81077777242c4dfe8da6
import joblib
import os

<<<<<<< HEAD
# ─────────────────────────────────────────────────────────────
# 1. GENERATE REALISTIC TRAINING DATASET
# ─────────────────────────────────────────────────────────────
print("📊 Generating synthetic training dataset...")

np.random.seed(42)
n_samples = 500

# Generate features
hours = np.random.randint(0, 24, n_samples)
days = np.random.randint(0, 7, n_samples)
densities = np.random.uniform(0.2, 0.95, n_samples)
lighting = np.random.uniform(0.1, 1.0, n_samples)
police = np.random.uniform(1, 10, n_samples)

# Generate risk labels based on realistic patterns
# Higher risk at night, low density areas, poor lighting, low police
risk_scores = []
for i in range(n_samples):
    # Base risk factors
    hour_factor = 1.0 if (hours[i] >= 22 or hours[i] <= 5) else 0.5  # Night = 2x risk
    density_factor = 0.5 if densities[i] > 0.7 else 1.0  # Busy areas safer
    lighting_factor = (1.0 - lighting[i]) * 0.5  # Poor lighting = more risk
    police_factor = (10 - police[i]) / 10  # Low police presence = more risk
    
    # Combine factors
    final_risk = (hour_factor * 0.4 + density_factor * 0.3 + 
                 lighting_factor * 0.2 + police_factor * 0.1)
    
    # Probabilistic threshold: probability of being high-risk
    is_high_risk = 1 if np.random.random() < final_risk else 0
    risk_scores.append(is_high_risk)

# Create DataFrame
df = pd.DataFrame({
    'hour': hours,
    'day_of_week': days,
    'population_density': densities,
    'lighting': lighting,
    'police_presence': police,
    'risk_category': risk_scores
})

print(f"✅ Generated {len(df)} training samples")
print(f"   - High-risk incidents: {df['risk_category'].sum()} ({df['risk_category'].mean()*100:.1f}%)")
print(f"   - Low-risk areas: {len(df) - df['risk_category'].sum()} ({(1-df['risk_category'].mean())*100:.1f}%)")

# ─────────────────────────────────────────────────────────────
# 2. PREPARE FEATURES AND TARGET
# ─────────────────────────────────────────────────────────────
print("\n📋 Preparing features...")

X = df[['hour', 'day_of_week', 'population_density', 'lighting', 'police_presence']]
y = df['risk_category']

print(f"✅ Features shape: {X.shape}")
print(f"   Features: {list(X.columns)}")
print(f"✅ Target shape: {y.shape}")

# ─────────────────────────────────────────────────────────────
# 3. SPLIT DATA
# ─────────────────────────────────────────────────────────────
print("\n🔀 Splitting data...")

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print(f"✅ Training set: {X_train.shape[0]} samples")
print(f"✅ Test set: {X_test.shape[0]} samples")

# ─────────────────────────────────────────────────────────────
# 4. SCALE FEATURES (CRITICAL FOR SGDClassifier)
# ─────────────────────────────────────────────────────────────
print("\n⚖️ Scaling features...")

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

print(f"✅ Scaler fitted on training data")
print(f"   Feature means: {scaler.mean_}")
print(f"   Feature stds: {scaler.scale_}")

# ─────────────────────────────────────────────────────────────
# 5. TRAIN SGDClassifier
# ─────────────────────────────────────────────────────────────
print("\n🤖 Training SGDClassifier...")

model = SGDClassifier(
    loss='log_loss',  # Logistic regression
    max_iter=1000,
    random_state=42,
    verbose=0
)

model.fit(X_train_scaled, y_train)
print(f"✅ Model trained successfully")

# ─────────────────────────────────────────────────────────────
# 6. EVALUATE MODEL
# ─────────────────────────────────────────────────────────────
print("\n📊 Evaluating model...\n")

# Predictions
y_pred_train = model.predict(X_train_scaled)
y_pred_test = model.predict(X_test_scaled)

# Accuracy
train_accuracy = accuracy_score(y_train, y_pred_train)
test_accuracy = accuracy_score(y_test, y_pred_test)

print(f"Training Accuracy: {train_accuracy:.4f} ({train_accuracy*100:.2f}%)")
print(f"Test Accuracy: {test_accuracy:.4f} ({test_accuracy*100:.2f}%)")

# Detailed report
print("\n--- Test Set Classification Report ---")
print(classification_report(y_test, y_pred_test, 
                           target_names=['Low-Risk', 'High-Risk']))

print("\n--- Confusion Matrix (Test Set) ---")
print(confusion_matrix(y_test, y_pred_test))

# ─────────────────────────────────────────────────────────────
# 7. SAVE MODEL AND SCALER
# ─────────────────────────────────────────────────────────────
print("\n💾 Saving model and scaler...\n")

current_dir = os.path.dirname(os.path.abspath(__file__))

model_path = os.path.join(current_dir, "sentinel_model.pkl")
scaler_path = os.path.join(current_dir, "scaler.pkl")

joblib.dump(model, model_path)
joblib.dump(scaler, scaler_path)

print(f"✅ Model saved to: {model_path}")
print(f"   Size: {os.path.getsize(model_path)} bytes")
print(f"✅ Scaler saved to: {scaler_path}")
print(f"   Size: {os.path.getsize(scaler_path)} bytes")

# ─────────────────────────────────────────────────────────────
# 8. VERIFICATION TEST
# ─────────────────────────────────────────────────────────────
print("\n🧪 Verification test - Loading saved model...\n")

loaded_model = joblib.load(model_path)
loaded_scaler = joblib.load(scaler_path)

# Test prediction with sample data
sample_data = np.array([[14, 3, 0.7, 0.8, 8]])  # 2pm, Wednesday, busy area, well-lit, good police
sample_scaled = loaded_scaler.transform(sample_data)
prediction = loaded_model.predict_proba(sample_scaled)

print(f"Sample Prediction (14:00, busy area, well-lit):")
print(f"  - Low-Risk: {prediction[0][0]*100:.1f}%")
print(f"  - High-Risk: {prediction[0][1]*100:.1f}%")

sample_data_night = np.array([[2, 3, 0.3, 0.2, 2]])  # 2am, sparse area, poor lighting, no cops
sample_scaled_night = loaded_scaler.transform(sample_data_night)
prediction_night = loaded_model.predict_proba(sample_scaled_night)

print(f"\nSample Prediction (02:00, sparse area, poor lighting):")
print(f"  - Low-Risk: {prediction_night[0][0]*100:.1f}%")
print(f"  - High-Risk: {prediction_night[0][1]*100:.1f}%")

print("\n✅ Model training completed successfully!")
print("   The model is now ready for the Sentinel AI dashboard.")
=======
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
>>>>>>> 6ae17eac1985bbdc11bf81077777242c4dfe8da6
