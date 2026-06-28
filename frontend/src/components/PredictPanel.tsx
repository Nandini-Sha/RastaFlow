import { predictPriority } from "../services/api";
import ResultScreen from "./ResultScreen";
import { useState } from "react";



export default function PredictPanel() {
  const [screen, setScreen] = useState<"form" | "result">("form");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const [formData, setFormData] = useState({
    event_type: "",
    event_cause: "",
    corridor: "",
    veh_type: "",
    requires_road_closure: false,
  });

  // -------------------------
  // HANDLE INPUT CHANGE
  // -------------------------
  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // -------------------------
  // SUBMIT
  // -------------------------
  const handleSubmit = async () => {
    try {
      setLoading(true);

      const res = await predictPriority(formData);
      if (
        !formData.event_type ||
        !formData.event_cause ||
        !formData.corridor ||
        !formData.veh_type
      ) {
        alert("Please fill all fields");
        return;
      }

      console.log("FULL RESPONSE:", res);
      console.log("RESPONSE DATA:", res.data);


      setResult(res.data);

      // 👉 SWITCH SCREEN
      setScreen("result");

    } catch (err) {
      console.error("Prediction Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // RESULT SCREEN
  // -------------------------
  if (screen === "result") {
    return (
      <ResultScreen
        result={result}
        onReset={() => setScreen("form")}
      />
    );
  }

  // -------------------------
  // FORM SCREEN
  // -------------------------
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center gap-6 p-6">
      <div className="hidden lg:block">
  {/* <div className="bg-white border border-gray-200 shadow-xl rounded-2xl p-4"> */}
        {/* <div className="w-full max-w-lg h-[650px] bg-white border border-gray-200 shadow-lg rounded-2xl p-6 overflow-y-auto"> */}
        <div className="w-[850px] h-[650px] bg-white border border-gray-200 shadow-lg rounded-2xl p-6 overflow-y-auto">
          
          <div className="mb-3">
            <h2 className="text-xl font-bold text-yellow-600">
              Historical Incident Hotspots
            </h2>

            <p className="text-sm text-gray-500">
              Historical traffic event density map
            </p>
          </div>

          <div className="w-[800px] h-[500px] rounded-xl overflow-hidden border">
            <iframe
              src="/traffic_hotspots.html"
              title="Traffic Hotspots"
              className="w-full h-full border-0"
            />
          </div>

        </div>
      </div>
      {/* <div className="w-full h-[500] max-w-lg bg-white border border-gray-200 shadow-lg rounded-2xl p-6"> */}
      {/* <div className="w-full max-w-lg bg-white border border-gray-200 shadow-lg rounded-2xl p-6"> */}
      {/* <div className="w-full max-w-lg h-[600px] bg-white border border-gray-200 shadow-lg rounded-2xl p-6 overflow-y-auto"> */}
      <div className="w-full max-w-lg h-[650px] bg-white border border-gray-200 shadow-lg rounded-2xl p-6 overflow-y-auto">

        {/* TITLE */}
        <h1 className="text-3xl font-bold text-yellow-500 text-center mb-6">
          Predict Event Priority
        </h1>
        <div className="space-y-4">

          {/* Event Type */}
          <select
            name="event_type"
            onChange={handleChange}
            className="w-full p-2 bg-gray-50 border border-gray-300 rounded text-gray-900 focus:border-yellow-400 outline-none"
          >
            <option value="">Select Event Type</option>
            <option value="unplanned">Unplanned</option>
            <option value="planned">Planned</option>
          </select>

          {/* Event Cause */}
          <select
            name="event_cause"
            onChange={handleChange}
            className="w-full p-2 bg-gray-50 border border-gray-300 rounded text-gray-900 focus:border-yellow-400 outline-none"
          >
            <option value="">Select Event Cause</option>

            <option value="vehicle_breakdown">Vehicle Breakdown</option>
            <option value="tree_fall">Tree Fall</option>
            <option value="accident">Accident</option>
            <option value="public_event">Public Event</option>
            <option value="water_logging">Water Logging</option>
            <option value="pot_holes">Pot Holes</option>
            <option value="congestion">Congestion</option>
            <option value="construction">Construction</option>
            <option value="road_conditions">Road Conditions</option>
            <option value="vip_movement">VIP Movement</option>
            <option value="procession">Procession</option>
            <option value="protest">Protest</option>
            <option value="debris">Debris</option>
            <option value="Fog / Low Visibility">Fog / Low Visibility</option>
            <option value="test_demo">Test Demo</option>
            <option value="others">Others</option>
          </select>
          {/* Corridor */}
          <select
            name="corridor"
            onChange={handleChange}
            className="w-full p-2 bg-gray-50 border border-gray-300 rounded text-gray-900 focus:border-yellow-400 outline-none"
          >
            <option value="">Select Corridor</option>
            <option value="Tumkur Road">Tumkur Road</option>
            <option value="ORR East 1">ORR East 1</option>
            <option value="CBD 2">CBD 2</option>
            <option value="ORR East 2">ORR East 2</option>
            <option value="ORR North 1">ORR North 1</option>
            <option value="ORR West 1">ORR West 1</option>
            <option value="Old Madras Road">Old Madras Road</option>
            <option value="Bellary Road 2">Bellary Road 2</option>
            <option value="Bellary Road 1">Bellary Road 1</option>
            <option value="Hosur Road">Hosur Road</option>
            <option value="Bannerghata Road">Bannerghata Road</option>
            <option value="ORR North 2">ORR North 2</option>
            <option value="Magadi Road">Magadi Road</option>
            <option value="IRR(Thanisandra road)">IRR(Thanisandra road)</option>
            <option value="Mysore Road">Mysore Road</option>
            <option value="West of Chord Road">West of Chord Road</option>
            <option value="CBD 1">CBD 1</option>
            <option value="Old Airport Road">Old Airport Road</option>
            <option value="Hennur Main Road">Hennur Main Road</option>
            <option value="Airport New South Road">Airport New South Road</option>
            <option value="Varthur Road">Varthur Road</option>
            <option value="Non-corridor">Non-corridor</option>
          </select>

          {/* Vehicle Type */}
          <select
            name="veh_type"
            onChange={handleChange}
            className="w-full p-2 bg-gray-50 border border-gray-300 rounded text-gray-900 focus:border-yellow-400 outline-none"
          >
            <option value="">Vehicle Type</option>
            <option value="lcv">lcv</option>
            <option value="heavy_vehicle">heavy_vehicle</option>
            <option value="private_bus">private_bus</option>
            <option value="bmtc_bus">bmtc_bus</option>
            <option value="private_car">private_car</option>
            <option value="ksrtc_bus">ksrtc_bus</option>
            <option value="truck">truck</option>
            <option value="auto">auto</option>
            <option value="taxi">taxi</option>
            <option value="others">others</option>
          </select>

          {/* Checkbox */}
          <label className="flex items-center gap-2 text-gray-700">
            <input
              type="checkbox"
              name="requires_road_closure"
              onChange={handleChange}
              className="accent-yellow-500"
            />
            Requires Road Closure
          </label>

          <div className="bg-gray-50 border rounded-xl p-4">
            <h3 className="font-bold text-yellow-600 mb-2">
              Live Incident Preview
            </h3>

            <div className="space-y-1 text-sm">
              <p>
                <strong>Type:</strong>{" "}
                {formData.event_type || "-"}
              </p>

              <p>
                <strong>Cause:</strong>{" "}
                {formData.event_cause || "-"}
              </p>

              <p>
                <strong>Corridor:</strong>{" "}
                {formData.corridor || "-"}
              </p>

              <p>
                <strong>Vehicle:</strong>{" "}
                {formData.veh_type || "-"}
              </p>

              <p>
                <strong>Road Closure:</strong>{" "}
                {formData.requires_road_closure
                  ? "Yes"
                  : "No"}
              </p>
            </div>
          </div>
    
          {/* BUTTON */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black p-2 rounded font-semibold transition"
          >
            {loading
              ? "🚦 Predicting Incident Impact..."
              : "Run AI Prediction"}
          </button>

        </div>
      </div>
    </div>
  );
}