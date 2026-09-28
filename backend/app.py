from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
import joblib
import shap
from flask_cors import CORS
from auth import auth_bp, token_required
from history import history_bp, save_prediction

app = Flask(__name__)
CORS(app)
app.register_blueprint(auth_bp)
app.register_blueprint(history_bp)

# Load trained model
model = joblib.load("car_price_model.pkl")

# Get preprocessing and Extra Trees model
preprocessor = model.named_steps["preprocessor"]
regressor = model.named_steps["regressor"]

# Create SHAP explainer
explainer = shap.TreeExplainer(regressor)

numeric_features = [
    "year",
    "mileage_km",
    "engine_size_cc",
    "owner_count",
    "features_count"
]

categorical_features = [
    "brand",
    "model",
    "fuel_type",
    "transmission",
    "condition",
    "service_history",
    "accident_history"
]

nice_names = {
    "year": "Model Year",
    "mileage_km": "Mileage",
    "engine_size_cc": "Engine Size",
    "owner_count": "Previous Owners",
    "features_count": "Features",
    "brand": "Brand",
    "model": "Model",
    "fuel_type": "Fuel Type",
    "transmission": "Transmission",
    "condition": "Vehicle Condition",
    "service_history": "Service History",
    "accident_history": "Accident History"
}


def get_explanations(input_data, top_n=5):

    # Transform customer input
    transformed = preprocessor.transform(input_data)

    if hasattr(transformed, "toarray"):
        transformed = transformed.toarray()

    # Get transformed feature names
    feature_names = preprocessor.get_feature_names_out()

    # Calculate SHAP values
    shap_values = explainer.shap_values(transformed)
    shap_values = np.array(shap_values).reshape(-1)

    grouped = {}

    # Combine one-hot encoded features back
    # into their original features
    for feature, shap_value in zip(feature_names, shap_values):

        clean_name = (
            feature
            .replace("num__", "")
            .replace("cat__", "")
        )

        original_feature = None

        # Numeric feature
        if clean_name in numeric_features:
            original_feature = clean_name

        # Categorical feature
        else:
            for column in categorical_features:
                if clean_name.startswith(column + "_"):
                    original_feature = column
                    break

        if original_feature:
            grouped[original_feature] = (
                grouped.get(original_feature, 0)
                + float(shap_value)
            )

    # Select 5 strongest factors
    top_features = sorted(
        grouped.items(),
        key=lambda item: abs(item[1]),
        reverse=True
    )[:top_n]

    explanations = []

    for feature, impact in top_features:

        value = input_data.iloc[0][feature]

        # Convert numpy values to normal Python values
        if isinstance(value, np.generic):
            value = value.item()

        if impact > 0:
            direction = "increased"
            message = "Increased the estimated value"
        else:
            direction = "decreased"
            message = "Reduced the estimated value"

        explanations.append({
            "feature": nice_names.get(feature, feature),
            "value": value,
            "direction": direction,
            "message": message
        })

    return explanations


@app.route("/")
def home():
    return "AI Car Price Predictor Backend is Running! Model and SHAP Loaded Successfully!"


@app.route("/predict", methods=["POST"])
@token_required
def predict(current_user_id):

    try:
        data = request.get_json()

        car_data = {
            "brand": data["brand"],
            "model": data["model"],
            "year": float(data["year"]),
            "mileage_km": float(data["mileage_km"]),
            "engine_size_cc": float(data["engine_size_cc"]),
            "fuel_type": data["fuel_type"],
            "transmission": data["transmission"],
            "owner_count": float(data["owner_count"]),
            "condition": data["condition"],
            "service_history": data["service_history"],
            "accident_history": data["accident_history"],
            "features_count": float(data["features_count"])
        }

        input_data = pd.DataFrame([car_data])

        # Predict price
        prediction = model.predict(input_data)[0]

        # Generate SHAP explanation
        explanations = get_explanations(input_data)
        
        # Save prediction to user's history
        save_prediction(current_user_id, data, float(prediction))

        return jsonify({
            "predicted_price": round(float(prediction), 2),
            "explanations": explanations
        })

    except Exception as error:

        return jsonify({
            "error": str(error)
        }), 500


if __name__ == "__main__":
    app.run(debug=True)