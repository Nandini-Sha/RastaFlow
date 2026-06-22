import pandas as pd
import math
from collections import defaultdict

# =========================
# Distance (Haversine)
# =========================
def haversine(lat1, lon1, lat2, lon2):
    R = 6371  # km

    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)

    a = (
        math.sin(dlat / 2) ** 2 +
        math.cos(math.radians(lat1)) *
        math.cos(math.radians(lat2)) *
        math.sin(dlon / 2) ** 2
    )

    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


# =========================
# Load dataset
# =========================
df = pd.read_csv("../../dataset/original.csv")

# clean
df = df.dropna(subset=["corridor", "latitude", "longitude"])

# remove duplicates per corridor (important)
df = df.groupby("corridor").agg({
    "latitude": "mean",
    "longitude": "mean"
}).reset_index()


# =========================
# Build KNN Graph
# =========================
K = 3  # you can tune this (2–5 is ideal)

graph = defaultdict(list)

corridors = df["corridor"].tolist()

for i in range(len(df)):
    c1 = df.iloc[i]["corridor"]
    lat1 = df.iloc[i]["latitude"]
    lon1 = df.iloc[i]["longitude"]

    distances = []

    for j in range(len(df)):
        if i == j:
            continue

        c2 = df.iloc[j]["corridor"]
        lat2 = df.iloc[j]["latitude"]
        lon2 = df.iloc[j]["longitude"]

        dist = haversine(lat1, lon1, lat2, lon2)
        distances.append((c2, dist))

    # sort by nearest
    distances.sort(key=lambda x: x[1])

    # take K nearest
    neighbors = [x[0] for x in distances[:K]]

    graph[c1] = neighbors


# =========================
# Make graph bidirectional
# =========================
for node, neighbors in graph.items():
    for n in neighbors:
        if node not in graph[n]:
            graph[n].append(node)


# =========================
# Final CORRIDOR_GRAPH
# =========================
CORRIDOR_GRAPH = dict(graph)

print(CORRIDOR_GRAPH)