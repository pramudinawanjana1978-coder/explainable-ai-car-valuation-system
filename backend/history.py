"""
history.py — prediction history, kept separate from your ML code.

save_prediction(...) is called from your existing /predict route (see
the integration snippet) right after you compute a prediction, so each
logged-in user's requests get recorded.

GET /history returns only the calling user's own predictions, newest
first. It requires a valid token, via the same token_required decorator
used on /predict.
"""

import datetime

from flask import Blueprint, jsonify
from bson.objectid import ObjectId

from db import predictions_collection
from auth import token_required

history_bp = Blueprint("history", __name__)


def save_prediction(user_id, car_data, predicted_price):
    """Call this from app.py after a successful prediction.

    car_data is the same dict you already receive in /predict
    (brand, model, year, mileage_km, etc.) — only the fields useful for
    a history list are stored, nothing extra.
    """
    predictions_collection.insert_one(
        {
            "user_id": ObjectId(user_id),
            "brand": car_data.get("brand"),
            "model": car_data.get("model"),
            "year": car_data.get("year"),
            "mileage_km": car_data.get("mileage_km"),
            "predicted_price": predicted_price,
            "created_at": datetime.datetime.utcnow(),
        }
    )


@history_bp.route("/history", methods=["GET"])
@token_required
def get_history(current_user_id):
    records = predictions_collection.find(
        {"user_id": ObjectId(current_user_id)}
    ).sort("created_at", -1)

    return jsonify(
        [
            {
                "id": str(r["_id"]),
                "brand": r["brand"],
                "model": r["model"],
                "year": r["year"],
                "mileage_km": r["mileage_km"],
                "predicted_price": r["predicted_price"],
                "created_at": r["created_at"].isoformat() + "Z",
            }
            for r in records
        ]
    )
