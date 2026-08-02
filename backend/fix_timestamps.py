from pymongo import MongoClient
import os
from datetime import timedelta

mongo_url = os.getenv("MONGODB_URL", "mongodb+srv://admin:Wolverine%401904@cluster0.khh2ldk.mongodb.net/?appName=Cluster0")
client = MongoClient(mongo_url)
db = client["rastaflow"]
collection = db["incidents"]

resolved_incidents = collection.find({"status": "Resolved"})
count = 0
for inc in resolved_incidents:
    if "resolved_at" not in inc:
        # Create a resolved_at timestamp 45 minutes after it was created
        created_time = inc["_id"].generation_time
        resolved_time = created_time + timedelta(minutes=45)
        collection.update_one({"_id": inc["_id"]}, {"$set": {"resolved_at": resolved_time.isoformat()}})
        count += 1

print(f"Updated {count} resolved incidents with a resolved_at timestamp.")
