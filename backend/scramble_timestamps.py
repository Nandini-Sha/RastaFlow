from pymongo import MongoClient
import os
import random
from datetime import timedelta

mongo_url = os.getenv("MONGODB_URL", "mongodb+srv://admin:Wolverine%401904@cluster0.khh2ldk.mongodb.net/?appName=Cluster0")
client = MongoClient(mongo_url)
db = client["rastaflow"]
collection = db["incidents"]

resolved_incidents = collection.find({"status": "Resolved"})
for inc in resolved_incidents:
    # Give them random clearance times between 15 mins and 3 hours
    random_minutes = random.randint(15, 180)
    created_time = inc["_id"].generation_time
    resolved_time = created_time + timedelta(minutes=random_minutes)
    collection.update_one({"_id": inc["_id"]}, {"$set": {"resolved_at": resolved_time.isoformat()}})

print("Scrambled the resolved timestamps!")
