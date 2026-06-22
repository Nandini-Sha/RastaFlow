import pandas as pd

df = pd.read_csv("../../dataset/original.csv")

unique_event_types = (
    df["event_type"]
    .dropna()
    .astype(str)
    .str.strip()
    .unique()
)

pd.DataFrame(unique_event_types, columns=["event_type"]).to_csv(
    "event_types.csv",
    index=False
)

print(f"Found {len(unique_event_types)} unique event types")