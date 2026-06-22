import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import { CORRIDOR_COORDS } from "../utils/corridorCoords";
import { Fragment } from "react";

type CorridorRoute = {
  corridor: string;
  score?: number;
};

type Props = {
  latitude: number;
  longitude: number;
  severity: string;
  riskLevel: string;
  diversion?: {
    required: boolean;
    priority: string;
    routes?: CorridorRoute[];
  };
};

export default function TrafficMap({
  latitude,
  longitude,
  severity,
  riskLevel,
  diversion,
}: Props) {
  // -----------------------------
  // SAFETY CHECK
  // -----------------------------
  if (
    latitude == null ||
    longitude == null ||
    isNaN(latitude) ||
    isNaN(longitude)
  ) {
    return (
      <div className="h-full flex items-center justify-center">
        No location available
      </div>
    );
  }

  const center: [number, number] = [latitude, longitude];

  // -----------------------------
  // DEBUGGING
  // -----------------------------
  console.log("TrafficMap diversion:", diversion);

  const routeCoords =
    diversion?.routes?.map((r) => ({
      corridor: r.corridor,
      coord: CORRIDOR_COORDS[r.corridor],
    })) || [];

  console.log("EXTRACTED ROUTE COORDS:", routeCoords);

  // -----------------------------
  // COLOR LOGIC
  // -----------------------------
  const getColor = (priority?: string) => {
    switch ((priority || "").toLowerCase()) {
      case "high":
        return "red";
      case "moderate":
        return "orange";
      case "low":
        return "green";
      default:
        return "blue";
    }
  };

  const routeColor = getColor(diversion?.priority);

  // -----------------------------
  // ROUTES
  // -----------------------------
  const routes: CorridorRoute[] =
  diversion?.required
    ? diversion?.routes ?? []
    : [];

  console.log("ROUTES RECEIVED:", routes);

  return (
    <div className="h-[500px] w-full rounded-xl overflow-hidden border border-gray-300">
      <MapContainer
        center={center}
        zoom={13}
        className="h-full w-full"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* INCIDENT */}
        <Marker position={center}>
          <Popup>
            <div>
              <strong>Traffic Incident</strong>
              <br />
              Severity: {severity}
              <br />
              Risk Level: {riskLevel}
              <br />
              Lat: {latitude.toFixed(5)}
              <br />
              Lon: {longitude.toFixed(5)}
            </div>
          </Popup>
        </Marker>

        {/* DIVERSION ROUTES */}
        {routes.map((r, idx) => {
          const coord = CORRIDOR_COORDS[r.corridor];

          console.log(
            "Corridor:",
            r.corridor,
            "Coordinates:",
            coord
          );

          if (!coord) {
            console.error(
              "Missing coordinates for corridor:",
              r.corridor
            );
            return null;
          }

          return (
            <Fragment key={`${r.corridor}-${idx}`}>
              {/* Incident → Corridor */}
              <Polyline
                key={`line-${idx}`}
                positions={[center, coord]}
                pathOptions={{
                  color:
                    idx === 0
                      ? routeColor
                      : "blue",
                  weight:
                    idx === 0
                      ? 6
                      : 4,
                  opacity:
                    idx === 0
                      ? 1
                      : 0.6,
                  dashArray:
                    idx === 0
                      ? undefined
                      : "8,8",
                }}
              />

              {/* Corridor Marker */}
              <Marker
                key={`marker-${idx}`}
                position={coord}
              >
                <Popup>
                  <div>
                    <strong>{r.corridor}</strong>
                    <br />
                    Score: {r.score ?? "N/A"}
                  </div>
                </Popup>
              </Marker>
            </Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
}