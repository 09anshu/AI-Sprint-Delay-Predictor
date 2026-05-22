/**
 * NotificationDropdown.jsx — Notification bell dropdown panel.
 * 
 * Shows:
 *   - List of recent alerts with risk badges
 *   - Mark all as read button
 *   - Click alert → opens AlertDetailModal
 *   - "View All" link → /alerts history page
 *   - Click outside to close
 */

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlerts } from '../context/AlertContext';
import AlertDetailModal from './AlertDetailModal';
import {
  HiOutlineBell,
  HiOutlineCheck,
  HiOutlineExclamationCircle,
  HiOutlineExclamation,
  HiOutlineShieldCheck,
  HiOutlineChevronRight,
} from 'react-icons/hi';

/**
 * Format a timestamp to a relative time string.
 */
const timeAgo = (timestamp) => {
  const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const riskConfig = {
  high: { dot: 'bg-red-500', badge: 'badge-danger', Icon: HiOutlineExclamationCircle },
  medium: { dot: 'bg-amber-500', badge: 'badge-warning', Icon: HiOutlineExclamation },
  low: { dot: 'bg-emerald-500', badge: 'badge-success', Icon: HiOutlineShieldCheck },
};

const NotificationDropdown = () => {
  const { alerts, unreadCount, markAsRead, markAllAsRead } = useAlerts();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const handleAlertClick = (alert) => {
    markAsRead(alert.id);
    setSelectedAlert(alert);
    setIsOpen(false);
  };

  const handleViewAll = () => {
    setIsOpen(false);
    navigate('/alerts');
  };

  const recentAlerts = alerts.slice(0, 8);

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Bell Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 rounded-xl text-dark-400 hover:text-dark-200 hover:bg-dark-700/50 transition-all duration-200"
          id="notification-bell"
          aria-label="Notifications"
        >
          <HiOutlineBell className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'scale-110' : ''}`} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1 animate-badge-pulse shadow-lg shadow-red-500/30">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown Panel */}
        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-96 max-w-[calc(100vw-2rem)] bg-dark-800/95 backdrop-blur-xl border border-dark-700/60 rounded-2xl shadow-2xl shadow-black/30 z-[100] animate-scale-in origin-top-right overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-dark-700/50">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-dark-100">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-bold bg-red-500/15 text-red-400 px-2 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 transition-colors font-medium"
                >
                  <HiOutlineCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
            </div>

            {/* Alert List */}
            <div className="max-h-[360px] overflow-y-auto scrollbar-thin">
              {recentAlerts.length > 0 ? (
                <div>
                  {recentAlerts.map((alert) => {
                    const config = riskConfig[alert.riskCategory] || riskConfig.medium;
                    return (
                      <button
                        key={alert.id}
                        onClick={() => handleAlertClick(alert)}
                        className={`
                          w-full text-left px-5 py-3.5 flex items-start gap-3 
                          hover:bg-dark-700/30 transition-all duration-200
                          border-b border-dark-700/30 last:border-0
                          ${!alert.read ? 'bg-primary-500/[0.03]' : ''}
                        `}
                      >
                        {/* Unread indicator */}
                        <div className="flex-shrink-0 mt-1.5">
                          <div className={`w-2 h-2 rounded-full ${!alert.read ? config.dot : 'bg-dark-600'} transition-colors`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className={`text-sm font-medium ${!alert.read ? 'text-dark-100' : 'text-dark-300'} truncate`}>
                              {alert.sprintName}
                            </span>
                            <span className={`flex-shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                              alert.riskCategory === 'high' ? 'bg-red-500/15 text-red-400 border border-red-500/20' :
                              alert.riskCategory === 'medium' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' :
                              'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                            }`}>
                              {alert.riskLevel}
                            </span>
                          </div>
                          <p className="text-xs text-dark-400 mb-1">
                            {alert.riskCategory === 'high' ? '🔴' : alert.riskCategory === 'medium' ? '🟡' : '🟢'}{' '}
                            {alert.delayProbability}% delay probability
                          </p>
                          <span className="text-[10px] text-dark-500">{timeAgo(alert.timestamp)}</span>
                        </div>

                        {/* Arrow */}
                        <HiOutlineChevronRight className="w-4 h-4 text-dark-600 flex-shrink-0 mt-1" />
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="px-5 py-10 text-center">
                  <HiOutlineBell className="w-10 h-10 mx-auto text-dark-600 mb-3" />
                  <p className="text-sm text-dark-400">No notifications yet</p>
                  <p className="text-xs text-dark-500 mt-1">Run predictions to see alerts here</p>
                </div>
              )}
            </div>

            {/* Footer */}
            {alerts.length > 0 && (
              <div className="px-5 py-3 border-t border-dark-700/50">
                <button
                  onClick={handleViewAll}
                  className="w-full text-center text-xs font-medium text-primary-400 hover:text-primary-300 transition-colors py-1"
                >
                  View all alerts →
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <AlertDetailModal
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
        />
      )}
    </>
  );
};

export default NotificationDropdown;
