type ProgressRingProps = {
  accent?: string;
  label: string;
  progress: number;
  value: string;
};

export const ProgressRing = ({
  accent = "#111827",
  label,
  progress,
  value,
}: ProgressRingProps) => {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const normalizedProgress = Math.min(Math.max(progress, 0), 1);
  const strokeDashoffset = circumference * (1 - normalizedProgress);

  return (
    <div className="relative grid size-32 place-items-center">
      <svg aria-hidden="true" className="absolute inset-0" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          fill="none"
          r={radius}
          stroke="rgba(15, 23, 42, 0.08)"
          strokeWidth="9"
        />
        <circle
          cx="50"
          cy="50"
          fill="none"
          r={radius}
          stroke={accent}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          strokeWidth="9"
          transform="rotate(-90 50 50)"
        />
      </svg>
      <span className="relative text-center">
        <span className="block text-xl font-semibold">{value}</span>
        <span className="block text-xs text-slate-500">{label}</span>
      </span>
    </div>
  );
};
