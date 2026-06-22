import os
import joblib
import pandas as pd
import numpy as np

from sklearn.cluster import KMeans

# =========================
# Create Models Directory
# =========================

os.makedirs("models", exist_ok=True)

# =========================
# Load Dataset
# =========================

df = pd.read_csv("../dataset/original.csv")

# =========================
# Datetime Conversion
# =========================

df["start_datetime"] = pd.to_datetime(
    df["start_datetime"],
    format="mixed",
    utc=True
)

df["modified_datetime"] = pd.to_datetime(
    df["modified_datetime"],
    format="mixed",
    utc=True
)

# =========================
# Resolution Time
# =========================

df["resolution_minutes"] = (
    df["modified_datetime"] - df["start_datetime"]
).dt.total_seconds() / 60

df = df[df["resolution_minutes"] >= 0]
df = df.dropna(subset=["priority"])

# =========================
# Time Features
# =========================

df["hour"] = df["start_datetime"].dt.hour
df["day_of_week"] = df["start_datetime"].dt.dayofweek
df["month"] = df["start_datetime"].dt.month

# =========================
# Convert coordinates
# =========================

coord_cols = [
    "latitude", "longitude",
    "endlatitude", "endlongitude"
]

for col in coord_cols:
    df[col] = pd.to_numeric(df[col], errors="coerce")

    df[col] = df[col].fillna(df[col].median())

# =========================
# NEW FEATURE: Incident distance
# =========================

df["incident_distance"] = np.sqrt(
    (df["endlatitude"] - df["latitude"]) ** 2 +
    (df["endlongitude"] - df["longitude"]) ** 2
)

# =========================
# Location Clustering (IMPROVED)
# =========================

coords = df[
    ["latitude", "longitude", "endlatitude", "endlongitude"]
]

n_clusters = 40   # upgraded from 20

kmeans = KMeans(
    n_clusters=n_clusters,
    random_state=42,
    n_init=10
)

df["location_cluster"] = kmeans.fit_predict(coords)

joblib.dump(kmeans, "models/location_cluster.pkl")

# =========================
# Save lookup (debug + mapping)
# =========================

df[[
    "event_type",
    "event_cause",
    "latitude",
    "longitude",
    "location_cluster"
]].to_csv("models/location_lookup.csv", index=False)

# =========================
# Feature Selection (CatBoost READY)
# =========================

features = [
    "event_type",
    "event_cause",
    "veh_type",
    "requires_road_closure",
    "hour",
    "day_of_week",
    "month",
    "location_cluster",
    "incident_distance"
]

target = "priority"

X = df[features].copy()
y = df[target].copy()

# =========================
# Handle Missing Values (ONLY categorical)
# =========================

categorical_cols = [
    "event_type",
    "event_cause",
    "veh_type",
    "requires_road_closure"
]

for col in categorical_cols:
    X[col] = X[col].fillna("Unknown").astype(str)

# =========================
# Save target encoder info (optional debugging)
# =========================

joblib.dump(sorted(y.unique()), "models/severity_classes.pkl")

# =========================
# Debug Output
# =========================

print("\nTarget Classes:", sorted(y.unique()))
print("\nTarget Distribution:\n", y.value_counts())

print("\nDataset Shape:", df.shape)
print("\nFeature Matrix Shape:", X.shape)

print("\nEncoded Features Preview:")
print(X.head())

# =========================
# Save processed dataset
# =========================

processed_df = X.copy()
processed_df["priority"] = y
processed_df["resolution_minutes"] = df["resolution_minutes"].values
processed_df["latitude"] = df["latitude"]
processed_df["longitude"] = df["longitude"]
processed_df.to_csv("../dataset/processed_data.csv", index=False)

# =========================
# Corridor Lookup
# =========================

corridor_lookup = (
    df.groupby("corridor")
    .agg({
        "latitude": "mean",
        "longitude": "mean",
        "incident_distance": "mean"
    })
    .reset_index()
)

corridor_lookup.to_csv(
    "models/corridor_lookup.csv",
    index=False
)

print("\nCorridor lookup saved!")

# =========================
# Save metadata
# =========================

joblib.dump(categorical_cols, "models/categorical_cols.pkl")

print("\nProcessed data saved successfully!")
print("Location model saved!")
print("Categorical config saved!")