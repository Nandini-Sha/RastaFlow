from fastapi import FastAPI, UploadFile, File, Form, Request
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Response
from fastapi.staticfiles import StaticFiles
import uuid
import os
import logging
from datetime import datetime
from bson import ObjectId
import httpx
import base64

from predictor import predict_event
from database import incident_collection, incident_helper

app = FastAPI(title="RastaFlow")

# -----------------------
# CORS FIX
# -----------------------
app.add_middleware(
    CORSMiddleware,
    #allow_origins=["http://localhost:5173"],
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------
# STATIC FILES
# -----------------------
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# -----------------------
# INPUT MODEL
# -----------------------
class EventRequest(BaseModel):
    event_type: str
    event_cause: str
    corridor: str
    veh_type: str
    requires_road_closure: bool

    # optional (we will auto-fill if missing)
    hour: int | None = None
    day_of_week: int | None = None
    month: int | None = None




logger = logging.getLogger(__name__)

@app.api_route("/health", methods=["GET", "HEAD"])
async def health():
    logger.info(f"Health check received at {datetime.now()}")
    return {"status": "healthy"}
# HOME ROUTE
# -----------------------
@app.get("/")
def home():
    return {"message": "RastaFlow AI Backend Running"}

# -----------------------
# INCIDENTS ROUTES
# -----------------------
class IncidentModel(BaseModel):
    incident_id: str
    type: str
    location: str
    description: str | None = None
    severity: str
    time: str
    status: str

@app.get("/incidents")
async def get_incidents():
    incidents = []
    async for incident in incident_collection.find():
        incidents.append(incident_helper(incident))
    return incidents

@app.post("/incidents")
async def create_incident(incident: IncidentModel):
    incident_data = incident.model_dump()
    new_incident = await incident_collection.insert_one(incident_data)
    created_incident = await incident_collection.find_one({"_id": new_incident.inserted_id})
    return incident_helper(created_incident)

@app.delete("/incidents/{id}")
async def delete_incident(id: str):
    result = await incident_collection.delete_one({"_id": ObjectId(id)})
    if result.deleted_count == 1:
        return {"message": "Incident deleted successfully"}
    return {"message": "Incident not found"}

@app.patch("/incidents/{id}/resolve")
async def resolve_incident(id: str):
    from datetime import datetime
    result = await incident_collection.update_one(
        {"_id": ObjectId(id)},
        {"$set": {
            "status": "Resolved", 
            "resolved_at": datetime.utcnow().isoformat()
        }}
    )
    if result.modified_count == 1:
        return {"message": "Incident marked as Resolved"}
    return {"message": "Incident not found or already resolved"}

@app.post("/report-incident")
async def report_incident(
    request: Request,
    type: str = Form(...),
    location: str = Form(...),
    description: str = Form(...),
    image: UploadFile = File(None)
):
    image_url = None
    if image:
        image_data = await image.read()
        
        # Try ImgBB first
        imgbb_api_key = os.getenv("IMGBB_API_KEY")
        if imgbb_api_key:
            try:
                encoded_image = base64.b64encode(image_data).decode('utf-8')
                async with httpx.AsyncClient() as client:
                    response = await client.post(
                        "https://api.imgbb.com/1/upload",
                        data={
                            "key": imgbb_api_key,
                            "image": encoded_image
                        },
                        timeout=15.0
                    )
                    if response.status_code == 200:
                        image_url = response.json()["data"]["url"]
                    else:
                        logging.error(f"ImgBB upload failed: {response.text}")
            except Exception as e:
                logging.error(f"ImgBB request exception: {e}")
        else:
            logging.error("IMGBB_API_KEY is not set in environment variables.")

        # Fallback to local storage
        if not image_url:
            file_extension = image.filename.split(".")[-1] if (image.filename and "." in image.filename) else "jpg"
            file_name = f"{uuid.uuid4().hex}.{file_extension}"
            file_path = os.path.join("uploads", file_name)
            with open(file_path, "wb") as f:
                f.write(image_data)
            
            # Use request.base_url to form the absolute URL
            base_url = str(request.base_url).rstrip("/")
            image_url = f"{base_url}/uploads/{file_name}"

    severity = "Medium" # Default fallback
    try:
        now = datetime.now()
        ml_input = {
            "event_type": type,
            "event_cause": "unknown",
            "corridor": location,
            "veh_type": "others",
            "requires_road_closure": False,
            "hour": now.hour,
            "day_of_week": now.weekday(),
            "month": now.month
        }
        # predict_event is imported at top of file
        prediction = predict_event(ml_input)
        if "severity" in prediction:
            severity = prediction["severity"]
    except Exception as e:
        logging.error(f"Failed to predict severity: {e}")

    incident_data = {
        "incident_id": f"INC-{str(uuid.uuid4().int)[:4]}",
        "type": type,
        "location": location,
        "description": description,
        "severity": severity,
        "time": "Just now",
        "status": "Active",
        "image_url": image_url
    }

    new_incident = await incident_collection.insert_one(incident_data)
    created_incident = await incident_collection.find_one({"_id": new_incident.inserted_id})
    
    # We add image_url to the helper manually for this return
    result = incident_helper(created_incident)
    result["image_url"] = created_incident.get("image_url")
    return result



# -----------------------
# PREDICT ROUTE
# -----------------------
@app.post("/predict")
def predict(event: EventRequest):

    # -----------------------
    # AUTO-FILL TIME FEATURES
    # -----------------------
    now = datetime.now()

    data = event.model_dump()

    data["hour"] = data["hour"] if data["hour"] is not None else now.hour
    data["day_of_week"] = data["day_of_week"] if data["day_of_week"] is not None else now.weekday()
    data["month"] = data["month"] if data["month"] is not None else now.month

    # -----------------------
    # CALL ML MODEL
    # -----------------------
    result = predict_event(data)

    return result