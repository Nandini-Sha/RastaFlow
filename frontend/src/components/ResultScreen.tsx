import TrafficMap from "./TrafficMap";
import RiskGauge from "./RiskGauge";

type Props = {
  result: any;
  onReset: () => void;
};

export default function ResultScreen({
  result,
  onReset,
}: Props) {
  const severity = result?.severity?.toLowerCase();

  let severityBadge;

  if (severity === "high") {
    severityBadge = (
      <span className="text-red-500 font-bold text-xl">
        🔴 HIGH PRIORITY
      </span>
    );
  } else if (severity === "medium") {
    severityBadge = (
      <span className="text-yellow-500 font-bold text-xl">
        🟡 MEDIUM PRIORITY
      </span>
    );
  } else if (severity === "low") {
    severityBadge = (
      <span className="text-green-500 font-bold text-xl">
        🟢 LOW PRIORITY
      </span>
    );
  } else {
    severityBadge = (
      <span className="text-gray-500 font-bold text-xl">
        Unknown Priority
      </span>
    );
  }
  console.log(result.diversion.routes)
  console.log("DIVERSION:", result.diversion);
console.log("RESOURCE FLAG:", result.resources?.diversion_required);
  return (
    <div className="min-h-screen bg-gray-100 p-6">

    <div className="max-w-7xl mx-auto">

        {/* TITLE */}
        <div className="bg-white border border-gray-200 shadow-lg rounded-2xl p-6 mb-6">

          <h2 className="text-3xl font-bold text-center text-yellow-500">
            Prediction Result
          </h2>

          <div className="text-center mt-4">
            {severityBadge}
          </div>

        </div>

        {/* MAIN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT SIDE */}
          <div className="flex flex-col gap-6">

            {/* PREDICTIONS CARD */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow p-5">

              <h3 className="text-lg font-bold mb-4 text-yellow-600">
                Predictions
              </h3>

              <div className="space-y-3">

                <div className="bg-gray-50 border rounded-lg p-3">
                  <p className="text-sm text-gray-500">
                    Severity
                  </p>
                  <p className="font-bold text-lg">
                    {result?.severity}
                  </p>
                </div>

                <div className="bg-gray-50 border rounded-lg p-3">
                  <p className="text-sm text-gray-500">
                    Clearance Time
                  </p>
                  <p className="font-bold text-lg">
                    {result?.clearance}
                  </p>
                </div>

                <div className="bg-gray-50 border rounded-lg p-3">
                  <p className="text-sm text-gray-500">
                    Risk Level
                  </p>
                  <p className="font-bold text-lg">
                    {result?.risk_level}
                  </p>
                </div>

              </div>

              <div className="mt-6 h-[220px] w-full">
                <RiskGauge
                  score={result?.risk_score ?? 0}
                />
              </div>

            </div>

            {/* RESOURCES CARD */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow p-5">

              <h3 className="text-lg font-bold mb-4 text-yellow-600">
                Recommended Resources
              </h3>

              <div className="space-y-4">

                <div className="flex justify-between">
                  <span>👮 Officers</span>
                  <span className="font-semibold">
                    {result?.resources?.officers}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>🚧 Barricades</span>
                  <span className="font-semibold">
                    {result?.resources?.barricades}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>🚛 Tow Truck</span>
                  <span className="font-semibold">
                    {result?.resources?.tow_truck
                      ? "Yes"
                      : "No"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>⚡ Response Priority</span>
                  <span className="font-semibold">
                    {result?.resources?.response_priority}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>🛣 Diversion Required</span>
                  <span className="font-semibold">
                    {result?.resources?.diversion_required
                      ? "Yes"
                      : "No"}
                  </span>
                </div>

              </div>

            </div>

          </div>

          {/* MAP CARD */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-white border border-gray-200 rounded-2xl shadow p-5">
            <h3 className="text-lg font-bold mb-4 text-yellow-600">
              Diversion Map
            </h3>

            <div className="h-[500px]">
              <TrafficMap
                latitude={result?.latitude}
                longitude={result?.longitude}
                severity={result?.severity}
                riskLevel={result?.risk_level}
                diversion={result?.diversion}
              />
            </div>
            </div>
            {/* DIVERSION CARD */}
              <div className="bg-white border border-gray-200 rounded-2xl shadow p-5">

                <h3 className="text-lg font-bold mb-4 text-yellow-600">
                  Recommended Diversions
                </h3>

                {result?.diversion?.required ? (

                  <div className="space-y-3">

                    {result?.diversion?.routes?.map(
                      (route: any, idx: number) => (
                        <div
                          key={idx}
                          className="
                            flex
                            justify-between
                            items-center
                            bg-gray-50
                            border
                            rounded-lg
                            p-3
                          "
                        >
                          <div>
                            <p className="font-semibold">
                              {idx + 1}
                            </p>

                            <p className="text-sm text-gray-600">
                              {route.corridor}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="font-bold text-yellow-600">
                              {route.score}
                            </p>

                            <p className="text-xs text-gray-500">
                              Score
                            </p>
                          </div>
                        </div>
                      )
                    )}

                  </div>

                ) : (

                  <div className="text-center text-gray-500 py-4">
                    No diversion required
                  </div>

                )}

              </div>
            
          </div>
          
        </div>

        {/* BUTTON */}
        <div className="flex justify-center mt-8">

          <button
            onClick={onReset}
            className="px-8 py-3 bg-yellow-500 hover:bg-yellow-600 text-black rounded-xl font-semibold shadow-md transition"
          >
            New Prediction
          </button>

        </div>

      </div>

    </div>
  );
}