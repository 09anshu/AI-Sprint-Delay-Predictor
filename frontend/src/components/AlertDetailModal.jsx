/**
 * AlertDetailModal.jsx — Smart Alert Detail Modal.
 *
 * Expanded view of an alert with probability gauge,
 * reasons, suggested actions, and sprint metrics.
 */

import { HiOutlineX, HiOutlineExclamationCircle, HiOutlineExclamation, HiOutlineShieldCheck, HiOutlineLightningBolt, HiOutlineClock, HiOutlineChartBar } from 'react-icons/hi';

const riskColors = {
  high: { gradient: 'from-red-500 to-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', glow: 'shadow-red-500/20', Icon: HiOutlineExclamationCircle },
  medium: { gradient: 'from-amber-500 to-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', glow: 'shadow-amber-500/20', Icon: HiOutlineExclamation },
  low: { gradient: 'from-emerald-500 to-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', glow: 'shadow-emerald-500/20', Icon: HiOutlineShieldCheck },
};

const AlertDetailModal = ({ alert, onClose }) => {
  if (!alert) return null;
  const c = riskColors[alert.riskCategory] || riskColors.medium;
  const Icon = c.Icon;
  const time = new Date(alert.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const metrics = alert.sprintMetrics;
  const progress = metrics && metrics.storyPoints > 0 ? Math.round((metrics.completedPoints / metrics.storyPoints) * 100) : 0;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="glass-card w-full max-w-lg animate-scale-in overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className={`h-1.5 bg-gradient-to-r ${c.gradient}`} />
        <div className="p-6">
          {/* Title */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${c.text}`} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-dark-100">{alert.sprintName}</h2>
                <p className="text-xs text-dark-500">{alert.projectName} · {time}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl text-dark-400 hover:text-dark-200 hover:bg-dark-700/50 transition-all">
              <HiOutlineX className="w-5 h-5" />
            </button>
          </div>

          {/* Probability Gauge */}
          <div className={`${c.bg} border ${c.border} rounded-2xl p-5 mb-5`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-dark-300">Delay Probability</span>
              <span className={`text-3xl font-black ${c.text}`}>{alert.delayProbability}%</span>
            </div>
            <div className="w-full h-3 bg-dark-700 rounded-full overflow-hidden">
              <div className={`h-full bg-gradient-to-r ${c.gradient} rounded-full transition-all duration-1000 shadow-lg ${c.glow}`} style={{ width: `${Math.min(alert.delayProbability, 100)}%` }} />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-[10px] text-dark-500">0%</span>
              <span className={`text-[10px] font-semibold ${c.text}`}>{alert.riskLevel} Risk</span>
              <span className="text-[10px] text-dark-500">100%</span>
            </div>
          </div>

          {/* Sprint Metrics */}
          {metrics && (
            <div className="grid grid-cols-3 gap-2 mb-5">
              <div className="bg-dark-700/30 rounded-xl p-3 text-center">
                <HiOutlineClock className="w-4 h-4 mx-auto text-dark-400 mb-1" />
                <p className="text-xs text-dark-500">Duration</p>
                <p className="text-sm font-semibold text-dark-200">{metrics.duration}d</p>
              </div>
              <div className="bg-dark-700/30 rounded-xl p-3 text-center">
                <HiOutlineChartBar className="w-4 h-4 mx-auto text-dark-400 mb-1" />
                <p className="text-xs text-dark-500">Progress</p>
                <p className="text-sm font-semibold text-dark-200">{progress}%</p>
              </div>
              <div className="bg-dark-700/30 rounded-xl p-3 text-center">
                <HiOutlineLightningBolt className="w-4 h-4 mx-auto text-dark-400 mb-1" />
                <p className="text-xs text-dark-500">Bugs</p>
                <p className="text-sm font-semibold text-dark-200">{metrics.bugs}</p>
              </div>
            </div>
          )}

          {/* Reasons */}
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-dark-200 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />Reasons for Alert
            </h3>
            <div className="space-y-2">
              {alert.reasons?.map((r, i) => (
                <div key={i} className="flex items-start gap-3 bg-dark-700/20 rounded-xl px-4 py-3 hover:bg-dark-700/30 transition-colors">
                  <span className="text-base mt-0.5">{r.icon}</span>
                  <div><p className="text-sm font-medium text-dark-200">{r.label}</p><p className="text-xs text-dark-400">{r.detail}</p></div>
                </div>
              ))}
            </div>
          </div>

          {/* Suggested Actions */}
          <div>
            <h3 className="text-sm font-semibold text-dark-200 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-400" />Suggested Actions
            </h3>
            <div className="space-y-2">
              {alert.suggestedActions?.map((a, i) => (
                <div key={i} className="flex items-start gap-3 bg-primary-500/[0.04] border border-primary-500/10 rounded-xl px-4 py-3 hover:bg-primary-500/[0.08] transition-colors">
                  <span className="text-base mt-0.5">{a.icon}</span>
                  <div><p className="text-sm font-medium text-dark-200">{a.action}</p><p className="text-xs text-dark-400">{a.detail}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertDetailModal;
