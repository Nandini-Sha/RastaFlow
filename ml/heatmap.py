import pandas as pd
import folium
import joblib

from folium.plugins import HeatMap

# =========================
# Load Dataset
# =========================

df = pd.read_csv(
    "../dataset/processed_data.csv"
)

# =========================
# Load Models
# =========================

severity_model = joblib.load(
    "models/severity_catboost.pkl"
)

clearance_model = joblib.load(
    "models/clearance.pkl"
)

severity_features = joblib.load(
    "models/severity_features.pkl"
)

clearance_features = joblib.load(
    "models/clearance_features.pkl"
)

# =========================
# Clean Coordinates
# =========================

df["latitude"] = pd.to_numeric(
    df["latitude"],
    errors="coerce"
)

df["longitude"] = pd.to_numeric(
    df["longitude"],
    errors="coerce"
)

df = df.dropna(
    subset=[
        "latitude",
        "longitude"
    ]
)

# =========================
# Prepare Model Inputs
# =========================

severity_input = df[
    severity_features
].copy()

clearance_input = df[
    clearance_features
].copy()

# =========================
# Predict Severity
# =========================

severity_preds = severity_model.predict(
    severity_input
).flatten()

df["predicted_severity"] = severity_preds

# =========================
# Predict Clearance
# =========================
clearance_preds = clearance_model.predict(
    clearance_input
).flatten()
print(type(clearance_preds))
print(clearance_preds.shape)
df["predicted_clearance"] = clearance_preds

# =========================
# Generate Weights
# =========================

def calculate_weight(row):

    weight = 1

    # Severity Weight

    if str(row["predicted_severity"]).lower() == "high":

        weight += 3

    # Clearance Weight

    clearance = str(
        row["predicted_clearance"]
    )

    if clearance == "Moderate":

        weight += 1

    elif clearance == "Long":

        weight += 2

    elif clearance == "Critical":

        weight += 3

    return weight


df["heat_weight"] = df.apply(
    calculate_weight,
    axis=1
)

# =========================
# Statistics
# =========================

print(
    "\nTotal Incidents:",
    len(df)
)

print(
    "High Severity Predictions:",
    (
        df["predicted_severity"]
        .astype(str)
        .str.lower()
        .eq("high")
        .sum()
    )
)

print(
    "\nAverage Heat Weight:",
    round(
        df["heat_weight"].mean(),
        2
    )
)

# =========================
# Create Map
# =========================

traffic_map = folium.Map(

    location=[

        df["latitude"].mean(),

        df["longitude"].mean()
    ],

    zoom_start=11,

    control_scale=True
)

# =========================
# Weighted Heatmap
# =========================

heat_data = [

    [
        row["latitude"],
        row["longitude"],
        row["heat_weight"]
    ]

    for _, row in df.iterrows()
]

HeatMap(

    heat_data,

    radius=18,

    blur=14,

    min_opacity=0.4,

    max_zoom=13

).add_to(
    traffic_map
)

# =========================
# Add Incident Markers
# =========================

for _, row in df.iterrows():

    popup_text = f"""
    <b>Event Type:</b> {row.get('event_type', 'Unknown')}<br>
    <b>Cause:</b> {row.get('event_cause', 'Unknown')}<br>
    <b>Vehicle:</b> {row.get('veh_type', 'Unknown')}<br>
    <b>Severity:</b> {row.get('predicted_severity', 'Unknown')}<br>
    <b>Clearance:</b> {row.get('predicted_clearance', 'Unknown')}<br>
    <b>Weight:</b> {row.get('heat_weight', 0)}
    """

    folium.CircleMarker(

        location=[

            row["latitude"],
            row["longitude"]
        ],

        radius=3,

        weight=1,

        fill=True,

        popup=folium.Popup(
            popup_text,
            max_width=300
        )

    ).add_to(
        traffic_map
    )

# =========================
# Save Map
# =========================

output_file = (
    "../dataset/traffic_hotspots.html"
)

traffic_map.save(
    output_file
)

# =========================
# Complete
# =========================

print(
    f"\nHeatmap saved to: {output_file}"
)

print(
    "\nTraffic hotspot analysis completed successfully!"
)