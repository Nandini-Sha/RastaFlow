import requests
import time
from datetime import datetime

URL = "https://rastaflow-1.onrender.com/health"

while True:
    try:
        response = requests.get(URL, timeout=10)
        print(f"[{datetime.now()}] Status: {response.status_code}")
    except Exception as e:
        print(f"[{datetime.now()}] Error: {e}")

    # Wait 5 minutes
    time.sleep(300)