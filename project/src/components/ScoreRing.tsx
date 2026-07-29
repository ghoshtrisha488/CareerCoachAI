interface ScoreRingProps {
  score: number;
  size?: number;
  stroke?: number;
  label?: string;
}

export function ScoreRing({ score, size = 120, stroke = 10, label = 'Overall' }: ScoreRingProps) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : score >= 40 ? '#f97316' : '#ef4444';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={stroke} className="stroke-ink-100 dark:stroke-ink-800" />
          <circle
            cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={stroke} stroke={color}
            strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold font-display" style={{ color }}>{score}</span>
          <span className="text-[10px] text-ink-400">/ 100</span>
        </div>
      </div>
      <span className="text-xs font-medium text-ink-500">{label}</span>
    </div>
  );
}
