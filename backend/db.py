"""
db.py — MongoDB connection helper.

Creates a single shared MongoDB client using the connection string from
your .env file, and exposes the collections the app needs. Import
`users_collection` and `predictions_collection` wherever you need them.
"""

import os
from pymongo import MongoClient, ASCENDING
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("MONGO_DB_NAME", "car_price_predictor")

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

users_collection = db["users"]
predictions_collection = db["predictions"]

# Ensure emails are unique at the database level, not just in app code.
users_collection.create_index([("email", ASCENDING)], unique=True)
