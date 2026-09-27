"""
auth.py — authentication, kept separate from your ML/prediction code.

Provides:
- POST /register
- POST /login
- token_required: a decorator you put on any route that should only
  be reachable by a logged-in user (used on /predict and /history).

Passwords are hashed with Werkzeug's generate_password_hash /
check_password_hash — the plain-text password is never stored.

Sessions are handled with a JWT (JSON Web Token). On login, the server
signs a token containing the user's id and a 24-hour expiry. The React
app stores this token and sends it back on every protected request as:

    Authorization: Bearer <token>
"""

import os
import re
import datetime
from functools import wraps

import jwt
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from bson.objectid import ObjectId

from db import users_collection

auth_bp = Blueprint("auth", __name__)

JWT_SECRET = os.getenv("JWT_SECRET_KEY")
if not JWT_SECRET:
    raise RuntimeError(
        "JWT_SECRET_KEY is not set. Add it to your .env file before starting the server."
    )
JWT_ALGORITHM = "HS256"
TOKEN_EXPIRY_HOURS = 24

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _issue_token(user_id):
    payload = {
        "sub": str(user_id),
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=TOKEN_EXPIRY_HOURS),
        "iat": datetime.datetime.utcnow(),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def token_required(f):
    """Protect a route: rejects the request unless a valid Bearer token
    is present, and passes the authenticated user's id in as
    current_user_id."""

    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Missing or invalid Authorization header"}), 401

        token = auth_header.split(" ", 1)[1]
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Session expired, please log in again"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid authentication token"}), 401

        return f(current_user_id=payload["sub"], *args, **kwargs)

    return decorated


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}
    full_name = (data.get("full_name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not full_name or not email or not password:
        return jsonify({"error": "Full name, email and password are all required"}), 400

    if not EMAIL_RE.match(email):
        return jsonify({"error": "Enter a valid email address"}), 400

    if len(password) < 8:
        return jsonify({"error": "Password must be at least 8 characters"}), 400

    if users_collection.find_one({"email": email}):
        return jsonify({"error": "An account with this email already exists"}), 409

    password_hash = generate_password_hash(password)

    result = users_collection.insert_one(
        {
            "full_name": full_name,
            "email": email,
            "password_hash": password_hash,
            "created_at": datetime.datetime.utcnow(),
        }
    )

    token = _issue_token(result.inserted_id)
    return (
        jsonify(
            {
                "token": token,
                "user": {"id": str(result.inserted_id), "full_name": full_name, "email": email},
            }
        ),
        201,
    )


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = users_collection.find_one({"email": email})
    if not user or not check_password_hash(user["password_hash"], password):
        return jsonify({"error": "Incorrect email or password"}), 401

    token = _issue_token(user["_id"])
    return jsonify(
        {
            "token": token,
            "user": {
                "id": str(user["_id"]),
                "full_name": user["full_name"],
                "email": user["email"],
            },
        }
    )
