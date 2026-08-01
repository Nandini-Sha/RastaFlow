import TrafficMap from "./TrafficMap";
import RiskGauge from "./RiskGauge";
import { AlertTriangle, Clock, ShieldAlert, ArrowLeft, Users, Shield, Truck, Navigation, Activity } from "lucide-react";

type Props = {
  result: any;
  onReset: () => void;
  imageUrl?: string;
};

export default function ResultScreen({ result, onReset, imageUrl }: Props) {
  const severity = result?.severity?.toLowerCase();

  let severityBadge;
  let glowColor;

  if (severity === "high" || severity === "critical") {
    glowColor = "bg-red-500/10";
    severityBadge = (
      <span className="flex items-center gap-2 text-red-500 font-bold text-xl uppercase px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl">
        <AlertTriangle className="w-6 h-6" /> HIGH PRIORITY
      </span>
    );
  } else if (severity === "medium") {
    glowColor = "bg-yellow-500/10";
    severityBadge = (
      <span className="flex items-center gap-2 text-yellow-500 font-bold text-xl uppercase px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
        <Activity className="w-6 h-6" /> MEDIUM PRIORITY
      </span>
    );
  } else if (severity === "low") {
    glowColor = "bg-green-500/10";
    severityBadge = (
      <span className="flex items-center gap-2 text-green-500 font-bold text-xl uppercase px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl">
        <Shield className="w-6 h-6" /> LOW PRIORITY
      </span>
    );
  } else {
    glowColor = "bg-gray-500/10";
    severityBadge = (
      <span className="flex items-center gap-2 text-gray-500 font-bold text-xl uppercase px-4 py-2 bg-gray-500/10 border border-gray-500/20 rounded-xl">
        UNKNOWN PRIORITY
      </span>
    );
  }

  return (
    <div className="w-full">
      {/* HEADER CARD */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl p-6 mb-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between">
        <div className={`absolute -right-32 -top-32 w-96 h-96 rounded-full blur-3xl pointer-events-none ${glowColor}`}></div>
        
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-blue-500" />
            AI Prediction Result
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Generated operational response strategy based on live models.
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 relative z-10">
          {severityBadge}
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-8">



          {/* PREDICTIONS CARD */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-3">
              Impact Analysis
            </h3>

            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex justify-between items-center">
                <p className="text-gray-500 dark:text-gray-400 font-medium">Severity</p>
                <p className="font-bold text-lg text-gray-900 dark:text-white capitalize">{result?.severity}</p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex justify-between items-center">
                <p className="text-gray-500 dark:text-gray-400 font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Clearance Time
                </p>
                <p className="font-bold text-lg text-gray-900 dark:text-white">{result?.clearance}</p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex justify-between items-center">
                <p className="text-gray-500 dark:text-gray-400 font-medium">Risk Level</p>
                <p className="font-bold text-lg text-gray-900 dark:text-white capitalize">{result?.risk_level}</p>
              </div>
            </div>

            <div className="mt-8 h-[220px] w-full flex items-center justify-center relative">
              {/* Note: Assuming RiskGauge is compatible, otherwise wrap it */}
              <RiskGauge score={result?.risk_score ?? 0} />
            </div>
          </div>

          {/* RESOURCES CARD */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-3">
              Recommended Resources
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300 font-medium">
                  <Users className="w-5 h-5 text-blue-500" /> Police Officers
                </div>
                <span className="font-bold text-lg text-gray-900 dark:text-white bg-blue-100 dark:bg-blue-900/40 px-3 py-1 rounded-md">
                  {result?.resources?.officers}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300 font-medium">
                  <Shield className="w-5 h-5 text-yellow-500" /> Barricades
                </div>
                <span className="font-bold text-lg text-gray-900 dark:text-white bg-yellow-100 dark:bg-yellow-900/40 px-3 py-1 rounded-md">
                  {result?.resources?.barricades}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300 font-medium">
                  <Truck className="w-5 h-5 text-red-500" /> Tow Truck
                </div>
                <span className={`font-bold text-md px-3 py-1 rounded-md ${result?.resources?.tow_truck ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                  {result?.resources?.tow_truck ? "Required" : "Not Required"}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300 font-medium">
                  <Navigation className="w-5 h-5 text-purple-500" /> Diversion
                </div>
                <span className={`font-bold text-md px-3 py-1 rounded-md ${result?.resources?.diversion_required ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                  {result?.resources?.diversion_required ? "Required" : "Not Required"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (MAP & DIVERSION) */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl p-6 overflow-hidden flex flex-col">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-3 flex items-center gap-2">
              <Navigation className="w-6 h-6 text-blue-500" /> Diversion Routing Map
            </h3>

            <div className="h-[500px] w-full rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <TrafficMap
                latitude={result?.latitude}
                longitude={result?.longitude}
                severity={result?.severity}
                riskLevel={result?.risk_level}
                diversion={result?.diversion}
              />
            </div>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-3">
              Alternative Corridors
            </h3>

            {result?.diversion?.required && result?.diversion?.routes?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.diversion.routes.map((route: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                        {idx + 1}
                      </div>
                      <p className="font-semibold text-gray-900 dark:text-white">{route.corridor}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-blue-600 dark:text-blue-400">{route.score}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Viability Score</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
                <Navigation className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <p className="font-medium text-lg">No diversion required</p>
                <p className="text-sm">Traffic flow is optimal through the current corridor.</p>
              </div>
            )}
          </div>

          {/* UPLOADED IMAGE CARD (LANDSCAPE) */}
          {imageUrl && (
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl overflow-hidden relative group p-2">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 px-4 pt-4 flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                Live Field Evidence
              </h3>
              <div className="bg-gray-900 rounded-xl overflow-hidden relative">
                <img 
                  src={imageUrl} 
                  alt="Field Evidence" 
                  className="w-full max-h-[500px] object-contain"
                />
              </div>
            </div>
          )}

          <div className="flex justify-start">
            <button
              onClick={onReset}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-xl font-semibold shadow-sm transition-all"
            >
              <ArrowLeft className="w-5 h-5" /> Run New Prediction
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}