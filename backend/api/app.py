from flask import Flask, request, jsonify
import joblib

app = Flask(__name__)

model = joblib.load("../model/sentinel_model.pkl")

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json

    features = [[
        data["time"],
        data["day"],
        data["crowd"],
        data["lighting"],
        data["incidents"]
    ]]

    risk = model.predict(features)[0]

    return jsonify({"risk": int(risk)})

if __name__ == "__main__":
    app.run(debug=True)