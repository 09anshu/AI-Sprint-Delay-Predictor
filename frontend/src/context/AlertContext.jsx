/**
 * AlertContext.jsx — Alert System Context Provider.
 * 
 * Manages all alert state for the real-time delay alert system:
 *   - Active alerts list with unread tracking
 *   - Alert history (dismissed alerts)
 *   - Trigger logic: delay_probability > 0.6 OR risk ∈ {High, Critical}
 *   - Persists to localStorage
 *   - Fires custom toast on new alert
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import AlertToast from '../components/AlertToast';

const AlertContext = createContext(null);

const STORAGE_KEY = 'sprint-alerts';
const HISTORY_KEY = 'sprint-alert-history';

/**
 * Derive reasons from sprint/prediction data.
 */
const deriveReasons = (sprintData, prediction) => {
  const reasons = [];
  if (sprintData.bugs >= 5) {
    reasons.push({ icon: '🐛', label: 'High bug count', detail: `${sprintData.bugs} bugs reported` });
  }
  if (sprintData.dependencies >= 4) {
    reasons.push({ icon: '🔗', label: 'Many dependencies', detail: `${sprintData.dependencies} external dependencies` });
  }
  const progress = sprintData.storyPoints > 0
    ? (sprintData.completedPoints / sprintData.storyPoints) * 100
    : 0;
  if (progress < 50) {
    reasons.push({ icon: '📉', label: 'Low progress', detail: `Only ${Math.round(progress)}% completed` });
  }
  if (prediction.severity === 'High') {
    reasons.push({ icon: '🔥', label: 'High severity prediction', detail: 'ML model predicts severe delay' });
  }
  if (prediction.riskLevel === 'Critical') {
    reasons.push({ icon: '🚨', label: 'Critical risk level', detail: 'Sprint is at critical risk' });
  }
  if (reasons.length === 0) {
    reasons.push({ icon: '⚠️', label: 'Elevated delay probability', detail: `${Math.round(prediction.confidence * 100)}% confidence of delay` });
  }
  return reasons;
};

/**
 * Derive suggested actions from reasons.
 */
const deriveSuggestedActions = (reasons) => {
  const actions = [];
  const labels = reasons.map(r => r.label);
  if (labels.includes('High bug count')) {
    actions.push({ icon: '🔧', action: 'Fix critical bugs', detail: 'Prioritize and resolve open bugs before sprint end' });
  }
  if (labels.includes('Many dependencies')) {
    actions.push({ icon: '✂️', action: 'Reduce dependencies', detail: 'Decouple tasks or resolve blocked items' });
  }
  if (labels.includes('Low progress')) {
    actions.push({ icon: '⚡', action: 'Increase team effort', detail: 'Assign more resources or reduce scope' });
  }
  if (labels.includes('High severity prediction') || labels.includes('Critical risk level')) {
    actions.push({ icon: '📋', action: 'Conduct risk review', detail: 'Hold an urgent sprint review with stakeholders' });
  }
  if (actions.length === 0) {
    actions.push({ icon: '👀', action: 'Monitor closely', detail: 'Keep tracking progress and re-predict if needed' });
  }
  return actions;
};

export const useAlerts = () => {
  const context = useContext(AlertContext);
  if (!context) throw new Error('useAlerts must be used within AlertProvider');
  return context;
};

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [alertHistory, setAlertHistory] = useState(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(alertHistory));
  }, [alertHistory]);

  // Derived state
  const unreadCount = alerts.filter(a => !a.read).length;

  /**
   * Check if a prediction should trigger an alert.
   */
  const shouldTriggerAlert = useCallback((prediction) => {
    const prob = prediction.confidence || 0;
    const risk = prediction.riskLevel || '';
    const label = prediction.label || '';
    return (
      prob > 0.6 ||
      risk === 'High' || risk === 'Critical' ||
      label === 'Delayed'
    );
  }, []);

  /**
   * Add a new alert from a prediction result.
   */
  const addAlert = useCallback((sprintData, prediction, projectName = '') => {
    if (!shouldTriggerAlert(prediction)) return null;

    const reasons = deriveReasons(sprintData, prediction);
    const suggestedActions = deriveSuggestedActions(reasons);

    const riskCategory =
      prediction.riskLevel === 'Critical' || prediction.severity === 'High'
        ? 'high'
        : prediction.riskLevel === 'High' || prediction.severity === 'Medium'
          ? 'medium'
          : 'low';

    const newAlert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sprintName: sprintData.sprintName || 'Unknown Sprint',
      projectName: projectName || 'Unknown Project',
      delayProbability: Math.round((prediction.confidence || 0) * 100),
      riskLevel: prediction.riskLevel || 'Medium',
      severity: prediction.severity || 'Medium',
      riskCategory,
      label: prediction.label || 'Delayed',
      reasons,
      suggestedActions,
      sprintMetrics: {
        duration: sprintData.duration,
        storyPoints: sprintData.storyPoints,
        completedPoints: sprintData.completedPoints,
        bugs: sprintData.bugs,
        dependencies: sprintData.dependencies,
      },
      timestamp: new Date().toISOString(),
      read: false,
    };

    setAlerts(prev => [newAlert, ...prev]);

    // Fire custom toast
    toast.custom(
      (t) => <AlertToast alert={newAlert} toastInstance={t} />,
      { duration: 5000, position: 'top-right' }
    );

    return newAlert;
  }, [shouldTriggerAlert]);

  /**
   * Mark a single alert as read.
   */
  const markAsRead = useCallback((alertId) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, read: true } : a));
  }, []);

  /**
   * Mark all alerts as read.
   */
  const markAllAsRead = useCallback(() => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
  }, []);

  /**
   * Dismiss an alert (move to history).
   */
  const dismissAlert = useCallback((alertId) => {
    setAlerts(prev => {
      const alert = prev.find(a => a.id === alertId);
      if (alert) {
        setAlertHistory(hist => [{ ...alert, dismissedAt: new Date().toISOString() }, ...hist]);
      }
      return prev.filter(a => a.id !== alertId);
    });
  }, []);

  /**
   * Clear all alert history.
   */
  const clearHistory = useCallback(() => {
    setAlertHistory([]);
  }, []);

  /**
   * Get only active (unresolved) alerts — most recent first.
   */
  const activeAlerts = alerts;

  return (
    <AlertContext.Provider value={{
      alerts: activeAlerts,
      alertHistory,
      unreadCount,
      addAlert,
      markAsRead,
      markAllAsRead,
      dismissAlert,
      clearHistory,
      shouldTriggerAlert,
    }}>
      {children}
    </AlertContext.Provider>
  );
};

export default AlertContext;
