import { predictPriority } from "../services/api";
import ResultScreen from "./ResultScreen";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Zap, AlertCircle, MapPin, Truck, ShieldAlert } from "lucide-react";

export default function PredictPanel() {
  const location = useLocation();
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

  // Handle incoming data from Live Command deep link
  useEffect(() => {
    if (location.state?.incident) {
      const incomingData = location.state.incident;
      
      // Attempt to match exact options in our selects, fallback to defaults if they don't match
      const mapCause = (cause: string) => {
        const c = cause.toLowerCase();
        if (c.includes("breakdown")) return "vehicle_breakdown";
        if (c.includes("tree")) return "tree_fall";
        if (c.includes("water") || c.includes("log")) return "water_logging";
        if (c.includes("pot") || c.includes("hole")) return "pot_holes";
        if (c.includes("accident")) return "accident";
        return "others";
      };

      const newData = {
        event_type: incomingData.event_type || "unplanned",
        event_cause: mapCause(incomingData.event_cause),
        corridor: incomingData.corridor,
        veh_type: incomingData.veh_type || "others",
        requires_road_closure: incomingData.requires_road_closure || false,
      };

      setFormData(newData);

      // Auto-submit if requested
      if (location.state.autoSubmit) {
        // We use a small timeout to let state settle and UI render before kicking off the prediction
        setTimeout(() => {
          runPrediction(newData);
        }, 500);
      }
    }
  }, [location]);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const runPrediction = async (dataToSubmit: any) => {
    try {
      if (!dataToSubmit.event_type || !dataToSubmit.event_cause || !dataToSubmit.corridor || !dataToSubmit.veh_type) {
        alert("Please fill all fields");
        return;
      }
      setLoading(true);
      const res = await predictPriority(dataToSubmit);
      setResult(res.data);
      setScreen("result");
    } catch (err) {
      console.error("Prediction Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runPrediction(formData);
  };

  if (screen === "result") {
    return <ResultScreen 
      result={result} 
      onReset={() => setScreen("form")} 
      imageUrl={location.state?.incident?.image_url}
    />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      {/* Map Panel */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-6 h-6 text-blue-500" />
            Historical Hotspots Map
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real-time geospatial intelligence overlay
          </p>
        </div>
        <div className="flex-1 bg-gray-100 dark:bg-gray-900 min-h-[500px] relative">
          <iframe
            src="/traffic_hotspots.html"
            title="Traffic Hotspots"
            className="absolute inset-0 w-full h-full border-0"
          />
        </div>
      </div>

      {/* Prediction Form Panel */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="p-6 relative z-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-500" />
            AI Impact Predictor
          </h2>

          {location.state?.incident?.image_url && (
            <div className="mb-6 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 relative shadow-md">
              <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-xs font-bold text-white flex items-center gap-1.5 border border-white/10">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                LIVE FEED
              </div>
              <img 
                src={location.state.incident.image_url} 
                alt="Live Incident" 
                className="w-full h-48 object-cover"
              />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Event Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Event Scope</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ShieldAlert className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  name="event_type"
                  value={formData.event_type}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                  required
                >
                  <option value="" disabled>Select Scope</option>
                  <option value="unplanned">Unplanned (Emergency)</option>
                  <option value="planned">Planned (Scheduled)</option>
                </select>
              </div>
            </div>

            {/* Event Cause */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Root Cause</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <AlertCircle className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  name="event_cause"
                  value={formData.event_cause}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                  required
                >
                  <option value="" disabled>Select Root Cause</option>
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
              </div>
            </div>

            {/* Corridor */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Corridor Location</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  name="corridor"
                  value={formData.corridor}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                  required
                >
                  <option value="" disabled>Select Corridor</option>
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
              </div>
            </div>

            {/* Vehicle Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Primary Vehicle Involved</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Truck className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  name="veh_type"
                  value={formData.veh_type}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                  required
                >
                  <option value="" disabled>Select Vehicle</option>
                  <option value="lcv">Light Commercial Vehicle (LCV)</option>
                  <option value="heavy_vehicle">Heavy Vehicle</option>
                  <option value="private_bus">Private Bus</option>
                  <option value="bmtc_bus">BMTC Bus</option>
                  <option value="private_car">Private Car</option>
                  <option value="ksrtc_bus">KSRTC Bus</option>
                  <option value="truck">Truck</option>
                  <option value="auto">Auto Rickshaw</option>
                  <option value="taxi">Taxi</option>
                  <option value="others">Others</option>
                </select>
              </div>
            </div>

            {/* Requires Road Closure Checkbox */}
            <div className="pt-2">
              <label className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    name="requires_road_closure"
                    checked={formData.requires_road_closure}
                    onChange={handleChange}
                    className="w-5 h-5 border-2 border-gray-300 rounded text-red-500 focus:ring-red-500 focus:ring-offset-0 bg-transparent transition-all"
                  />
                </div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">Requires Complete Road Closure</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white p-4 rounded-xl font-bold shadow-lg shadow-red-500/30 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Analyzing Impact...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Run AI Prediction Engine
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}