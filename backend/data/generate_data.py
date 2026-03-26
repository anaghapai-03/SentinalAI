import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# Set random seed for reproducibility
np.random.seed(42)

# Generate realistic Bengaluru safety dataset
n_samples = 2000

# Time features (hour: 0-23, day: 0-6)
hours = np.random.choice(range(24), n_samples)
days = np.random.choice(range(7), n_samples)

# Risk factors (0-100 scale)
lighting = np.random.normal(65, 25, n_samples)  # Average 65%, some variance
lighting = np.clip(lighting, 0, 100)

police_presence = np.random.normal(50, 20, n_samples)  # Average 50% coverage
police_presence = np.clip(police_presence, 0, 100)

incidents_24h = np.random.poisson(3, n_samples)  # Average 3 incidents/day
incidents_24h = np.clip(incidents_24h, 0, 20)

crowd_density = np.random.normal(50, 30, n_samples)  # Variable crowd levels
crowd_density = np.clip(crowd_density, 0, 100)

# Geographic features (Bengaluru coordinates)
latitude = np.random.uniform(12.85, 13.15, n_samples)  # Bengaluru bounds
longitude = np.random.uniform(77.45, 77.75, n_samples)

# Journey distance (in km)
distance = np.random.exponential(5, n_samples)
distance = np.clip(distance, 0.5, 30)

# Traffic density (0-100)
traffic_density = np.random.normal(50, 25, n_samples)
traffic_density = np.clip(traffic_density, 0, 100)

# Calculate composite risk score (0-100)
# Risk increases with: darkness, low police, high incidents, high crowd, late night
risk_score = (
    (100 - lighting) * 0.25 +      # Low lighting = high risk
    (100 - police_presence) * 0.20 +  # Low police = high risk
    (incidents_24h / 20) * 100 * 0.20 +  # Incidents = high risk
    (crowd_density) * 0.15 +        # High crowd = moderate risk
    ((23 - hours) / 23 * 100) * 0.20  # Late night = high risk
)
risk_score = np.clip(risk_score, 0, 100)

# Add some noise
risk_score += np.random.normal(0, 5, n_samples)
risk_score = np.clip(risk_score, 0, 100)

# Create DataFrame
df = pd.DataFrame({
    'hour': hours,
    'day': days,
    'lighting': lighting,
    'police_presence': police_presence,
    'incidents_24h': incidents_24h,
    'crowd_density': crowd_density,
    'latitude': latitude,
    'longitude': longitude,
    'distance': distance,
    'traffic_density': traffic_density,
    'risk_score': risk_score
})

# Save to CSV
df.to_csv('backend/data/training_data.csv', index=False)
print(f"✅ Generated {n_samples} training samples")
print(f"Risk score range: {df['risk_score'].min():.1f} - {df['risk_score'].max():.1f}")
print(f"Saved to: backend/data/training_data.csv")
print(f"\nSample data:\n{df.head()}")