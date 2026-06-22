from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

from predictor import predict_event

app = FastAPI(title="RastaFlow")

# -----------------------
# CORS FIX
# -----------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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


# -----------------------
# HOME ROUTE
# -----------------------
@app.get("/")
def home():
    return {"message": "RastaFlow AI Backend Running"}


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