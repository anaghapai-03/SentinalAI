import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
import joblib

# 1. Load dataset
df = pd.read_csv("../data/dataset.csv")

# 2. Features & target
X = df[['time','day','crowd','lighting','incidents']]
y = df['risk']

# 3. Train-test split (IMPORTANT: fix randomness)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# 4. Create model
model = RandomForestClassifier(n_estimators=100, random_state=42)

# 5. Train model
model.fit(X_train, y_train)

# 6. Evaluate
accuracy = model.score(X_test, y_test)
print("✅ Accuracy:", accuracy)

# 7. Save model
joblib.dump(model, "sentinel_model.pkl")

print("✅ Model saved successfully")