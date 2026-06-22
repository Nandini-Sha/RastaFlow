import sys
import os

ROOT_DIR = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__),
        ".."
    )
)

sys.path.append(ROOT_DIR)

import joblib
import pandas as pd

from ml.resource_engine import recommend_resources
from ml.congestion_score import calculate_congestion_score
from ml.diversion_engine import recommend_diversion

# =========================
# Paths
# =========================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(BASE_DIR)

MODEL_DIR = os.path.join(ROOT_DIR, "ml", "models")

# =========================
# Models
# =========================

severity_model = joblib.load(os.path.join(MODEL_DIR, "severity_catboost.pkl"))
clearance_model = joblib.load(os.path.join(MODEL_DIR, "clearance.pkl"))

severity_features = joblib.load(os.path.join(MODEL_DIR, "severity_features.pkl"))
clearance_features = joblib.load(os.path.join(MODEL_DIR, "clearance_features.pkl"))

location_cluster_model = joblib.load(os.path.join(MODEL_DIR, "location_cluster.pkl"))

# =========================
# Lookup Files
# =========================

corridor_lookup = pd.read_csv(
    os.path.join(MODEL_DIR, "corridor_lookup.csv")
)

# =========================
# Corridor Features
# =========================

def get_corridor_features(corridor):

    row = corridor_lookup[
        corridor_lookup["corridor"] == corridor
    ]

    if row.empty:
        return {
            "location_cluster": 0,
            "incident_distance": 0.0,
            "latitude": 12.9716,
            "longitude": 77.5946
        }

    lat = float(row.iloc[0]["latitude"])
    lon = float(row.iloc[0]["longitude"])
    incident_distance = float(row.iloc[0]["incident_distance"])

    cluster = int(
        location_cluster_model.predict([[lat, lon, lat, lon]])[0]
    )

    return {
        "location_cluster": cluster,
        "incident_distance": incident_distance,
        "latitude": lat,
        "longitude": lon
    }

# =========================
# Main Prediction
# =========================

def predict_event(event):

    # =========================
    # Safe input extraction
    # =========================

    corridor = event.get("corridor", "Non-corridor")
    veh_type = event.get("veh_type", "others")
    event_cause = event.get("event_cause", "unknown")
    road_closure = event.get("requires_road_closure", False)

    # =========================
    # Auto Generate Location Data
    # =========================

    location_data = get_corridor_features(corridor)

    event["location_cluster"] = location_data["location_cluster"]
    event["incident_distance"] = location_data["incident_distance"]
    event["latitude"] = location_data["latitude"]
    event["longitude"] = location_data["longitude"]

    # =========================
    # Create Input DF
    # =========================

    input_df = pd.DataFrame([event])

    print("\nInput Columns:")
    print(input_df.columns.tolist())

    # =========================
    # Severity Prediction
    # =========================

    severity_input = input_df[severity_features]

    severity = str(
        severity_model.predict(severity_input).flatten()[0]
    )

    # =========================
    # Clearance Prediction
    # =========================

    clearance_input = input_df[clearance_features]

    clearance = str(
        clearance_model.predict(clearance_input).flatten()[0]
    )

    # =========================
    # Resources
    # =========================

    resources = recommend_resources(
        severity=severity,
        clearance=clearance,
        veh_type=veh_type,
        road_closure=road_closure,
        event_cause=event_cause
    )

    # =========================
    # Congestion Score
    # =========================

    risk = calculate_congestion_score(
        severity=severity,
        clearance=clearance,
        road_closure=road_closure,
        veh_type=veh_type
    )

    # =========================
    # Diversion
    # =========================

    diversion = recommend_diversion(
        corridor=corridor,
        risk_level=risk["risk_level"],
        road_closure=road_closure,
        clearance=clearance
    )

    # =========================
    # Sync resource flag with diversion engine
    # =========================

    resources["diversion_required"] = diversion.get(
        "required",
        False
    )

    print("DIVERSION REQUIRED =", diversion.get("required"))
    print("RESOURCE FLAG =", resources.get("diversion_required"))

    # =========================
    # Final Response
    # =========================

    print("\n===== DEBUG =====")
    print("Resources:", resources)
    print("Diversion:", diversion)
    print("=================\n")
    return {
        "severity": severity,
        "clearance": clearance,
        "risk_score": risk["score"],
        "risk_level": risk["risk_level"],

        "resources": resources,

        # SAFE DIVERSION FORMAT FOR FRONTEND
        "diversion": {
            "required": diversion.get("required", False),
            "priority": diversion.get("priority", "None"),
            "routes": diversion.get("routes", [])
        },

        "location_cluster": event["location_cluster"],
        "incident_distance": event["incident_distance"],

        # SAFE MAP COORDINATES (NO NaN CRASH)
        "latitude": event.get("latitude", 12.9716),
        "longitude": event.get("longitude", 77.5946)
    }