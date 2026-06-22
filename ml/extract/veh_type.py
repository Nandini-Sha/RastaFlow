import pandas as pd

df = pd.read_csv("../../dataset/original.csv")

unique_vehicle_types = (
    df["veh_type"]
    .dropna()
    .astype(str)
    .str.strip()
    .unique()
)

pd.DataFrame(unique_vehicle_types, columns=["veh_type"]).to_csv(
    "vehicle_types.csv",
    index=False
)

print(f"Found {len(unique_vehicle_types)} unique vehicle types")