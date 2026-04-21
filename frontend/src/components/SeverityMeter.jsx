/**
 * SeverityMeter.jsx — Visual severity indicator.
 * 
 * Displays a color-coded severity gauge:
 *   Green → Low risk
 *   Yellow → Medium risk  
 *   Red → High risk
 * 
 * Includes animated progress bar and label.
 */

const severityConfig = {
  Low: {
    color: 'from-emerald-500 to-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    glow: 'shadow-emerald-500/20',
    percentage: 25,
    label: 'Low Risk',
  },
  Medium: {
    color: 'from-amber-500 to-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    glow: 'shadow-amber-500/20',
    percentage: 60,
    label: 'Medium Risk',
  },
  High: {
    color: 'from-red-500 to-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-400',
    glow: 'shadow-red-500/20',
    percentage: 90,
    label: 'High Risk',
  },
};

const SeverityMeter = ({ severity = 'Medium', confidence = 0 }) => {
  const config = severityConfig[severity] || severityConfig.Medium;

  return (
    <div className={`${config.bg} ${config.border} border rounded-xl p-4`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className={`text-sm font-semibold ${config.text}`}>{config.label}</span>
        <span className="text-xs text-dark-400">{Math.round(confidence * 100)}% confidence</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3 bg-dark-700 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${config.color} rounded-full transition-all duration-1000 ease-out shadow-lg ${config.glow}`}
          style={{ width: `${config.percentage}%` }}
        ></div>
      </div>

      {/* Scale labels */}
      <div className="flex justify-between mt-2">
        <span className="text-[10px] text-emerald-400 font-medium">LOW</span>
        <span className="text-[10px] text-amber-400 font-medium">MEDIUM</span>
        <span className="text-[10px] text-red-400 font-medium">HIGH</span>
      </div>
    </div>
  );
};

export default SeverityMeter;
