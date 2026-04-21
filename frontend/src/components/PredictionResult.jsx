/**
 * PredictionResult.jsx — Displays ML prediction output.
 * 
 * Shows:
 *   - Delayed / Not Delayed label with icon
 *   - Severity Meter (Low/Medium/High)
 *   - Confidence percentage
 *   - Risk level details
 */

import SeverityMeter from './SeverityMeter';
import { HiOutlineShieldCheck, HiOutlineShieldExclamation } from 'react-icons/hi';

const PredictionResult = ({ prediction, onClose }) => {
  if (!prediction) return null;

  const isDelayed = prediction.label === 'Delayed';

  return (
    <div className="animate-slide-up">
      <div className={`glass-card p-6 border ${isDelayed ? 'border-red-500/30' : 'border-emerald-500/30'}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-dark-100">AI Prediction Result</h3>
          {onClose && (
            <button
              onClick={onClose}
              className="text-dark-400 hover:text-dark-200 transition-colors text-xl"
            >
              ×
            </button>
          )}
        </div>

        {/* Status Badge */}
        <div className="flex items-center justify-center mb-6">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl ${
            isDelayed 
              ? 'bg-red-500/10 border border-red-500/30' 
              : 'bg-emerald-500/10 border border-emerald-500/30'
          }`}>
            {isDelayed ? (
              <HiOutlineShieldExclamation className="w-10 h-10 text-red-400" />
            ) : (
              <HiOutlineShieldCheck className="w-10 h-10 text-emerald-400" />
            )}
            <div>
              <p className={`text-2xl font-bold ${isDelayed ? 'text-red-400' : 'text-emerald-400'}`}>
                {prediction.label}
              </p>
              <p className="text-xs text-dark-400">Sprint Status Prediction</p>
            </div>
          </div>
        </div>

        {/* Severity Meter */}
        <div className="mb-6">
          <SeverityMeter severity={prediction.severity} confidence={prediction.confidence} />
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-dark-700/30 rounded-xl p-3 text-center">
            <p className="text-xs text-dark-400 mb-1">Risk Level</p>
            <p className="text-sm font-semibold text-dark-200">{prediction.riskLevel}</p>
          </div>
          <div className="bg-dark-700/30 rounded-xl p-3 text-center">
            <p className="text-xs text-dark-400 mb-1">Confidence</p>
            <p className="text-sm font-semibold text-primary-400">{Math.round(prediction.confidence * 100)}%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionResult;
