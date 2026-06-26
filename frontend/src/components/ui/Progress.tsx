interface ProgressProps {
  value: number;
  className?: string;
}

export default function Progress({
  value,
  className = "",
}: ProgressProps) {
  const clampedValue = Math.min(Math.max(0, value), 100);

  // Automatically select colors based on progress percentage (Emerald -> Amber -> Rose)
  const getProgressColor = (val: number) => {
    if (val < 50) return "bg-gradient-to-r from-emerald-400 to-emerald-500";
    if (val < 80) return "bg-gradient-to-r from-amber-400 to-amber-500";
    return "bg-gradient-to-r from-rose-500 to-red-600";
  };

  return (
    <div className={`w-12 h-1 bg-gray-200/60 rounded-full overflow-hidden relative ${className}`}>
      <div
        className={`h-full transition-all duration-500 rounded-full ${getProgressColor(clampedValue)}`}
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );
}
