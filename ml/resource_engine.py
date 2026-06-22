def recommend_resources(
    severity,
    clearance,
    veh_type,
    road_closure,
    event_cause
):

    officers = 1
    barricades = 0

    tow_truck = False
    diversion_required = False

    # =========================
    # Severity Impact
    # =========================

    if severity == "High":

        officers += 2
        barricades += 1

    # =========================
    # Clearance Impact
    # =========================

    if clearance == "Long":

        officers += 1
        barricades += 1

    elif clearance == "Critical":

        officers += 3
        barricades += 2

        diversion_required = True

    # =========================
    # Vehicle Impact
    # =========================

    heavy_vehicles = [

        "truck",

        "heavy_vehicle",

        "lcv",

        "private_bus",

        "ksrtc_bus",

        "bmtc_bus"
    ]

    if veh_type in heavy_vehicles:

        officers += 1

        tow_truck = True

    # =========================
    # Road Closure Impact
    # =========================

    if str(road_closure).lower() == "true":

        diversion_required = True

        barricades += 2

    # =========================
    # Event Cause Impact
    # =========================

    if event_cause in [

        "vehicle_breakdown",

        "accident"

    ]:

        tow_truck = True

    # =========================
    # Response Priority
    # =========================

    if officers >= 6:

        response_priority = "Immediate"

    elif officers >= 4:

        response_priority = "High"

    else:

        response_priority = "Normal"

    return {

        "officers": officers,

        "barricades": barricades,

        "tow_truck": tow_truck,

        "diversion_required":
        diversion_required,

        "response_priority":
        response_priority
    }