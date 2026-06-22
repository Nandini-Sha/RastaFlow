import pandas as pd
import json

# =========================
# LOAD DATASET
# =========================
df = pd.read_csv("../../dataset/original.csv")

# =========================
# CLEAN DATA
# =========================
df = df.dropna(subset=["corridor", "latitude", "longitude"])

df["latitude"] = pd.to_numeric(df["latitude"], errors="coerce")
df["longitude"] = pd.to_numeric(df["longitude"], errors="coerce")

df = df.dropna(subset=["latitude", "longitude"])

# =========================
# GROUP BY CORRIDOR
# =========================
corridor_coords = {}

grouped = df.groupby("corridor")

for corridor, group in grouped:
    lat = group["latitude"].mean()
    lon = group["longitude"].mean()

    corridor_coords[corridor] = [round(lat, 6), round(lon, 6)]

# =========================
# PRINT RESULT
# =========================
print("\nCORRIDOR_COORDS = {\n")

for k, v in corridor_coords.items():
    print(f'    "{k}": {v},')

print("}\n")

# =========================
# SAVE AS JSON FILE (optional)
# =========================
with open("corridor_coords.json", "w") as f:
    json.dump(corridor_coords, f, indent=4)

print("Saved to corridor_coords.json")