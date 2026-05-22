/**
 * AlertHistory.jsx — Full alert history page.
 *
 * Shows all active + dismissed alerts with filtering and detail modal.
 */

import { useState } from 'react';
import { useAlerts } from '../context/AlertContext';
import AlertDetailModal from '../components/AlertDetailModal';
import {
  HiOutlineBell, HiOutlineTrash, HiOutlineFilter,
  HiOutlineExclamationCircle, HiOutlineExclamation,
  HiOutlineShieldCheck, HiOutlineClock,
} from 'react-icons/hi';

const riskConfig = {
  high: { dot: 'bg-red-500', badge: 'bg-red-500/15 text-red-400 border-red-500/20', Icon: HiOutlineExclamationCircle },
  medium: { dot: 'bg-amber-500', badge: 'bg-amber-500/15 text-amber-400 border-amber-500/20', Icon: HiOutlineExclamation },
  low: { dot: 'bg-emerald-500', badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20', Icon: HiOutlineShieldCheck },
};

const timeAgo = (ts) => {
  const s = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const AlertHistory = () => {
  const { alerts, alertHistory, dismissAlert, clearHistory } = useAlerts();
  const [filter, setFilter] = useState('all');
  const [selectedAlert, setSelectedAlert] = useState(null);

  const allItems = [
    ...alerts.map(a => ({ ...a, source: 'active' })),
    ...alertHistory.map(a => ({ ...a, source: 'history' })),
  ];

  const filtered = filter === 'all' ? allItems
    : allItems.filter(a => a.riskCategory === filter);

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'high', label: 'High Risk', color: 'text-red-400' },
    { key: 'medium', label: 'Medium', color: 'text-amber-400' },
    { key: 'low', label: 'Low', color: 'text-emerald-400' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-100 flex items-center gap-3">
            <HiOutlineBell className="w-7 h-7 text-primary-400" />
            Alert History
          </h1>
          <p className="text-dark-400 text-sm mt-1">
            {allItems.length} total alert{allItems.length !== 1 ? 's' : ''} · {alerts.length} active
          </p>
        </div>
        {alertHistory.length > 0 && (
          <button onClick={clearHistory} className="btn-secondary flex items-center gap-2 text-sm">
            <HiOutlineTrash className="w-4 h-4" />Clear History
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <HiOutlineFilter className="w-4 h-4 text-dark-400" />
        {filters.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filter === f.key
                ? 'bg-primary-500/15 text-primary-400 border border-primary-500/30'
                : 'bg-dark-700/30 text-dark-400 border border-dark-600 hover:border-dark-500'
            }`}
          >{f.label}</button>
        ))}
      </div>

      {/* Alert List */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((alert) => {
            const cfg = riskConfig[alert.riskCategory] || riskConfig.medium;
            const CfgIcon = cfg.Icon;
            return (
              <div key={alert.id}
                onClick={() => setSelectedAlert(alert)}
                className={`glass-card p-5 cursor-pointer hover:border-primary-500/30 transition-all duration-200 ${
                  alert.source === 'history' ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl ${
                      alert.riskCategory === 'high' ? 'bg-red-500/10 border-red-500/30' :
                      alert.riskCategory === 'medium' ? 'bg-amber-500/10 border-amber-500/30' :
                      'bg-emerald-500/10 border-emerald-500/30'
                    } border flex items-center justify-center`}>
                      <CfgIcon className={`w-5 h-5 ${
                        alert.riskCategory === 'high' ? 'text-red-400' :
                        alert.riskCategory === 'medium' ? 'text-amber-400' : 'text-emerald-400'
                      }`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-dark-100">{alert.sprintName}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.badge}`}>
                          {alert.riskLevel}
                        </span>
                        {alert.source === 'history' && (
                          <span className="text-[10px] text-dark-500 bg-dark-700/50 px-2 py-0.5 rounded-full">Dismissed</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-dark-400">{alert.delayProbability}% delay probability</span>
                        <span className="text-xs text-dark-500 flex items-center gap-1">
                          <HiOutlineClock className="w-3 h-3" />{timeAgo(alert.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {alert.source === 'active' && (
                      <button onClick={(e) => { e.stopPropagation(); dismissAlert(alert.id); }}
                        className="p-2 rounded-xl text-dark-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        title="Dismiss"
                      >
                        <HiOutlineTrash className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <HiOutlineBell className="w-16 h-16 mx-auto text-dark-600 mb-4" />
          <h3 className="text-lg font-semibold text-dark-300 mb-2">No Alerts Found</h3>
          <p className="text-dark-500 text-sm">
            {filter !== 'all' ? 'No alerts match this filter.' : 'Run predictions to generate alerts.'}
          </p>
        </div>
      )}

      {selectedAlert && <AlertDetailModal alert={selectedAlert} onClose={() => setSelectedAlert(null)} />}
    </div>
  );
};

export default AlertHistory;
