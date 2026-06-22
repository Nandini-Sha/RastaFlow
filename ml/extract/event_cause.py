import pandas as pd

df = pd.read_csv("../../dataset/original.csv")

unique_event_causes = (
    df["event_cause"]
    .dropna()
    .astype(str)
    .str.strip()
    .unique()
)

pd.DataFrame(unique_event_causes, columns=["event_cause"]).to_csv(
    "event_causes.csv",
    index=False
)

print(f"Found {len(unique_event_causes)} unique event causes")