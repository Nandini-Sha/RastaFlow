from collections import deque
from ml.corridor_graph import CORRIDOR_GRAPH


# -----------------------------
# GET NEIGHBORS (BFS EXPANSION)
# -----------------------------
def get_alternate_corridors(start, max_depth=2):
    visited = set()
    queue = deque([(start, 0)])
    result = set()

    while queue:
        node, depth = queue.popleft()

        if depth >= max_depth:
            continue

        neighbors = CORRIDOR_GRAPH.get(node, [])

        for n in neighbors:
            if n not in visited and n != start:
                visited.add(n)
                result.add(n)
                queue.append((n, depth + 1))

    return list(result)


# -----------------------------
# SIMPLE RISK SCORING
# -----------------------------
def score_route(risk_level, clearance, road_closure):
    score = 0

    if risk_level == "High":
        score += 50
    elif risk_level == "Moderate":
        score += 30
    else:
        score += 10

    if clearance == "High":
        score -= 20
    elif clearance == "Moderate":
        score -= 10

    if road_closure:
        score += 20

    return score


# -----------------------------
# MAIN FUNCTION
# -----------------------------
def recommend_diversion(corridor, risk_level, road_closure, clearance):

    neighbors = get_alternate_corridors(corridor)

    if not neighbors:
        return {
            "required": False,
            "priority": "None",
            "routes": []
        }

    scored = []

    for n in neighbors:
        score = score_route(risk_level, clearance, road_closure)
        scored.append((n, score))

    # sort best corridors first
    scored.sort(key=lambda x: x[1])

    best_routes = [
        {
            "corridor": n,
            "score": s
        }
        for n, s in scored[:3]
    ]

    return {
        "required": risk_level in ["High", "Moderate"],
        "priority": risk_level,
        "routes": best_routes
    }