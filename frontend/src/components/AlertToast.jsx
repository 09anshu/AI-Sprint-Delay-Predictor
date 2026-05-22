/**
 * AlertToast.jsx — Custom toast component for delay alerts.
 * 
 * Shows a risk-colored toast notification with:
 *   - Risk-colored left accent border
 *   - Sprint name + delay probability
 *   - Risk level badge
 *   - Auto-dismiss with smooth slide animation
 */

import { HiOutlineExclamationCircle, HiOutlineExclamation, HiOutlineShieldCheck, HiOutlineX } from 'react-icons/hi';
import toast from 'react-hot-toast';

const riskStyles = {
  high: {
    border: 'border-l-red-500',
    bg: 'bg-red-500/5',
    iconBg: 'bg-red-500/15',
    iconColor: 'text-red-400',
    badgeBg: 'bg-red-500/15 text-red-400 border-red-500/30',
    Icon: HiOutlineExclamationCircle,
  },
  medium: {
    border: 'border-l-amber-500',
    bg: 'bg-amber-500/5',
    iconBg: 'bg-amber-500/15',
    iconColor: 'text-amber-400',
    badgeBg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    Icon: HiOutlineExclamation,
  },
  low: {
    border: 'border-l-emerald-500',
    bg: 'bg-emerald-500/5',
    iconBg: 'bg-emerald-500/15',
    iconColor: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    Icon: HiOutlineShieldCheck,
  },
};

const AlertToast = ({ alert, toastInstance }) => {
  const style = riskStyles[alert.riskCategory] || riskStyles.medium;
  const IconComponent = style.Icon;

  return (
    <div
      className={`
        max-w-sm w-full pointer-events-auto
        bg-dark-800/95 backdrop-blur-xl
        border border-dark-700/60 border-l-4 ${style.border}
        rounded-2xl shadow-2xl shadow-black/30
        overflow-hidden
        ${toastInstance.visible ? 'animate-toast-in' : 'animate-toast-out'}
      `}
    >
      <div className={`p-4 ${style.bg}`}>
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`flex-shrink-0 w-10 h-10 rounded-xl ${style.iconBg} flex items-center justify-center`}>
            <IconComponent className={`w-5 h-5 ${style.iconColor}`} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-dark-100 truncate">
                ⚠️ Sprint '{alert.sprintName}'
              </span>
            </div>
            <p className="text-xs text-dark-400 mb-2">
              has <span className={`font-semibold ${style.iconColor}`}>
                {alert.riskLevel.toUpperCase()}
              </span> delay risk ({alert.delayProbability}%)
            </p>
            <span className={`inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full border ${style.badgeBg}`}>
              {alert.riskLevel} Risk
            </span>
          </div>

          {/* Close */}
          <button
            onClick={() => toast.dismiss(toastInstance.id)}
            className="flex-shrink-0 p-1 rounded-lg text-dark-500 hover:text-dark-300 hover:bg-dark-700/50 transition-colors"
          >
            <HiOutlineX className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress bar for auto-dismiss */}
      <div className="h-0.5 bg-dark-700">
        <div
          className={`h-full bg-gradient-to-r ${
            alert.riskCategory === 'high' ? 'from-red-500 to-red-400' :
            alert.riskCategory === 'medium' ? 'from-amber-500 to-amber-400' :
            'from-emerald-500 to-emerald-400'
          } animate-toast-progress`}
        />
      </div>
    </div>
  );
};

export default AlertToast;
