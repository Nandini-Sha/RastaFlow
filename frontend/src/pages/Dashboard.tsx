import PredictPanel from "../components/PredictPanel";
//import ResultScreen from "../components/ResultScreen";
export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-6">

      {/* HEADER */}
      <div className="text-center mb-0.1">
        <h1 className="text-4xl font-bold text-yellow-500">
          RastaFlow
        </h1>

        <p className="text-gray-600 mt-2">
          Event Driven Traffic Intelligence
        </p>
      </div>

      {/* SCREEN 1 */}
      <PredictPanel />

    </div>
  );
}