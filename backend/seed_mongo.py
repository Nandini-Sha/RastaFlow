import asyncio
from database import incident_collection

mock_incidents = [
    { "incident_id": "INC-901", "type": "Vehicle Breakdown", "location": "Tumkur Road", "severity": "High", "time": "10 mins ago", "status": "Active" },
    { "incident_id": "INC-902", "type": "Water Logging", "location": "ORR East 1", "severity": "Medium", "time": "45 mins ago", "status": "Active" },
    { "incident_id": "INC-903", "type": "Accident", "location": "Hosur Road", "severity": "Critical", "time": "5 mins ago", "status": "Active" },
    { "incident_id": "INC-889", "type": "Tree Fall", "location": "Old Madras Road", "severity": "High", "time": "2 hours ago", "status": "Resolved" },
    { "incident_id": "INC-885", "type": "Congestion", "location": "CBD 1", "severity": "Medium", "time": "5 hours ago", "status": "Resolved" },
    { "incident_id": "INC-880", "type": "VIP Movement", "location": "Airport New South Road", "severity": "Low", "time": "1 day ago", "status": "Resolved" },
    { "incident_id": "INC-876", "type": "Protest", "location": "Magadi Road", "severity": "High", "time": "2 days ago", "status": "Resolved" },
]

async def seed_db():
    print("Clearing old data...")
    await incident_collection.delete_many({})
    print("Inserting mock data...")
    await incident_collection.insert_many(mock_incidents)
    print("Done!")

if __name__ == "__main__":
    asyncio.run(seed_db())
