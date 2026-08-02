from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_DETAILS = os.getenv("MONGODB_URL", "mongodb://localhost:27017")

client = AsyncIOMotorClient(MONGO_DETAILS)
database = client.rastaflow
incident_collection = database.get_collection("incidents")

# Helper to format MongoDB document (convert _id to id)
def incident_helper(incident) -> dict:
    return {
        "id": str(incident["_id"]),
        "incident_id": incident.get("incident_id", "INC-000"),
        "type": incident.get("type", ""),
        "location": incident.get("location", ""),
        "description": incident.get("description", ""),
        "severity": incident.get("severity", ""),
        "time": incident.get("time", ""),
        "status": incident.get("status", "Active"),
        "image_url": incident.get("image_url", None),
        "created_at": incident["_id"].generation_time.isoformat(),
        "resolved_at": incident.get("resolved_at", None),
    }
