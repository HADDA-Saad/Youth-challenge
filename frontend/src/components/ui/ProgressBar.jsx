export default function ProgressBar({ value, max, color = 'primary', size = 'md', showLabel = true }) {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;

  const colorMap = {
    primary: 'from-primary-500 to-primary-400',
    accent: 'from-accent-500 to-accent-400',
    success: 'from-success-500 to-success-400',
    danger: 'from-danger-500 to-danger-400',
  };

  const sizeMap = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className="w-full">
      <div className={`w-full bg-dark-700 rounded-full overflow-hidden ${sizeMap[size]}`}>
        <div
          className={`h-full bg-gradient-to-r ${colorMap[color]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1">
          <span className="text-xs text-dark-400">{value} / {max}</span>
          <span className="text-xs text-dark-400">{Math.round(percentage)}%</span>
        </div>
      )}
    </div>
  );
}
