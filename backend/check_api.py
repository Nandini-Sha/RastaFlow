import requests

try:
    response = requests.get("https://rastaflow-1.onrender.com/incidents")
    incidents = response.json()
    for inc in incidents:
        if inc.get("incident_id") == "INC-3290":
            print("Found INC-3290:", inc)
            break
    else:
        print("INC-3290 not found.")
        print("Sample of first incident:", incidents[0] if incidents else "No incidents")
except Exception as e:
    print("Error:", e)
