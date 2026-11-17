function scoreColor(score) {
  if (score === null || score === undefined) return "text-slate-300 dark:text-slate-600";
  if (score >= 8) return "text-emerald-500";
  if (score >= 5) return "text-amber-500";
  return "text-red-500";
}

const SIZES = {
  sm: { box: 40, stroke: 4, text: "text-xs" },
  md: { box: 56, stroke: 5, text: "text-sm" },
  lg: { box: 120, stroke: 9, text: "text-3xl" },
};

// Circular score indicator for a 0–10 score
function ScoreRing({ score, size = "md", label }) {
  const { box, stroke, text } = SIZES[size];
  const radius = (box - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const hasScore = score !== null && score !== undefined;
  const offset = circumference * (1 - (hasScore ? score / 10 : 0));

  return (
    <div
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{ width: box, height: box }}
      role="img"
      aria-label={label || (hasScore ? `Score ${score} out of 10` : "Not scored yet")}
    >
      <svg width={box} height={box} className="-rotate-90">
        <circle
          cx={box / 2}
          cy={box / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-slate-200 dark:stroke-slate-800"
        />
        <circle
          cx={box / 2}
          cy={box / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          stroke="currentColor"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`${scoreColor(score)} transition-[stroke-dashoffset] duration-700 ease-out`}
        />
      </svg>
      <span className={`absolute font-bold ${text} text-slate-900 dark:text-white`}>
        {hasScore ? score : "–"}
      </span>
    </div>
  );
}

export default ScoreRing;
