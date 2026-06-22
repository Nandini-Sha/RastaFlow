import pandas as pd

df = pd.read_csv("../../dataset/original.csv")

unique_corridors = (
    df["corridor"]
    .dropna()
    .astype(str)
    .str.strip()
    .unique()
)

pd.DataFrame(unique_corridors, columns=["corridor"]).to_csv(
    "corridors.csv",
    index=False
)

print(f"Found {len(unique_corridors)} unique corridors")