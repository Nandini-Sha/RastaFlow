import PredictPanel from "../components/PredictPanel";

export default function Dashboard() {
  return (
    <div className="w-full max-w-7xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          Operations Center
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
          Event Driven Traffic Intelligence & AI Prediction
        </p>
      </div>

      <PredictPanel />
    </div>
  );
}