type Props = {
  score: number;
};

export default function RiskGauge({
  score,
}: Props) {

  const radius = 85;
  const stroke = 14;

  const normalizedRadius =
    radius - stroke / 2;

  const circumference =
    normalizedRadius * 2 * Math.PI;

  const strokeDashoffset =
    circumference -
    (score / 100) * circumference;

  // -------------------------
  // Dynamic Colors
  // -------------------------

  const color =
    score >= 80
      ? "#ef4444" // red
      : score >= 60
      ? "#f97316" // orange
      : score >= 40
      ? "#eab308" // yellow
      : "#22c55e"; // green

  const riskLabel =
    score >= 80
      ? "Critical"
      : score >= 60
      ? "High"
      : score >= 40
      ? "Medium"
      : "Low";

  return (
    <div className="flex flex-col items-center">

      <h3 className="font-bold text-lg mb-4">
        Congestion Risk
      </h3>

      <div className="relative">

        <svg
          height={radius * 2}
          width={radius * 2}
          className="-rotate-90"
        >

          {/* Background */}
          <circle
            stroke="#e5e7eb"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />

          {/* Progress */}
          <circle
            stroke={color}
            fill="transparent"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            style={{
              transition:
                "stroke-dashoffset 0.8s ease"
            }}
          />

        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">

          <span
            className="text-4xl font-bold"
            style={{
              color
            }}
          >
            {score}
          </span>

          <span className="text-sm text-gray-500">
            /100
          </span>

          <span
            className="mt-1 font-semibold"
            style={{
              color
            }}
          >
            {riskLabel}
          </span>

        </div>

      </div>

      {/* Legend */}
      <div className="mt-4 text-center">

        

      </div>

    </div>
  );
}