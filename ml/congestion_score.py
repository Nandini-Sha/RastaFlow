# congestion_score.py

def calculate_congestion_score(
    severity,
    clearance,
    road_closure,
    veh_type,
    incident_distance=None
):

    score = 0

    # =========================
    # Severity Weight
    # =========================

    severity_weights = {

        "Low": 20,

        "High": 45
    }

    score += severity_weights.get(
        severity,
        20
    )

    # =========================
    # Clearance Weight
    # =========================

    clearance_weights = {

        "Quick": 5,

        "Moderate": 15,

        "Long": 30,

        "Critical": 45
    }

    score += clearance_weights.get(
        clearance,
        0
    )

    # =========================
    # Road Closure Weight
    # =========================

    if str(
        road_closure
    ).lower() == "true":

        score += 20

    # =========================
    # Vehicle Weight
    # =========================

    heavy_vehicles = [

        "truck",

        "heavy_vehicle",

        "private_bus",

        "ksrtc_bus",

        "bmtc_bus",

        "lcv"
    ]

    if veh_type in heavy_vehicles:

        score += 10

    # =========================
    # Incident Distance
    # =========================

    if incident_distance is not None:

        if incident_distance > 0.05:

            score += 5

        if incident_distance > 0.10:

            score += 5

    # =========================
    # Normalize
    # =========================

    score = min(
        round(score),
        100
    )

    # =========================
    # Risk Classification
    # =========================

    if score >= 85:

        risk = "Critical"

    elif score >= 65:

        risk = "High"

    elif score >= 35:

        risk = "Moderate"

    else:

        risk = "Low"

    return {

        "score": score,

        "risk_level": risk
    }