/**
 * SprintDetails.jsx — Sprint management page for a specific project.
 * 
 * Features:
 *   - View all sprints for a project
 *   - Create new sprints with form
 *   - "Predict Delay" button per sprint
 *   - Shows prediction results with severity meter
 *   - Risk level selector for prediction input
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import PredictionResult from '../components/PredictionResult';
import {
  HiOutlinePlus,
  HiOutlineArrowLeft,
  HiOutlineLightningBolt,
  HiOutlineChartBar,
  HiOutlineClock,
  HiOutlineX,
  HiOutlineSparkles,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineExclamation,
  HiOutlineCollection,
} from 'react-icons/hi';

const SprintDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [sprints, setSprints] = useState([]);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [predictingId, setPredictingId] = useState(null);
  const [activePrediction, setActivePrediction] = useState(null);
  const [formData, setFormData] = useState({
    sprintName: '',
    duration: '',
    storyPoints: '',
    completedPoints: '',
    bugs: '',
    dependencies: '',
  });
  // Prediction input modal
  const [showPredictModal, setShowPredictModal] = useState(false);
  const [predictSprint, setPredictSprint] = useState(null);
  const [riskLevel, setRiskLevel] = useState('Medium');

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const fetchData = async () => {
    try {
      const [projectsRes, sprintsRes] = await Promise.all([
        api.get('/projects'),
        api.get(`/sprints/${projectId}`),
      ]);
      const proj = projectsRes.data.find(p => p._id === projectId);
      setProject(proj);
      setSprints(sprintsRes.data);
    } catch (error) {
      toast.error('Failed to load sprint data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSprint = async (e) => {
    e.preventDefault();
    if (!formData.sprintName || !formData.duration || !formData.storyPoints) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/sprints', {
        projectId,
        ...formData,
        duration: parseInt(formData.duration),
        storyPoints: parseInt(formData.storyPoints),
        completedPoints: parseInt(formData.completedPoints) || 0,
        bugs: parseInt(formData.bugs) || 0,
        dependencies: parseInt(formData.dependencies) || 0,
      });
      toast.success('Sprint created!');
      setShowModal(false);
      setFormData({ sprintName: '', duration: '', storyPoints: '', completedPoints: '', bugs: '', dependencies: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create sprint');
    } finally {
      setSubmitting(false);
    }
  };

  const openPredictModal = (sprint) => {
    setPredictSprint(sprint);
    setRiskLevel('Medium');
    setShowPredictModal(true);
  };

  const handlePredict = async () => {
    if (!predictSprint) return;
    setPredictingId(predictSprint._id);
    setShowPredictModal(false);
    try {
      const res = await api.post('/sprints/predict', {
        sprintId: predictSprint._id,
        teamSize: project?.teamSize || 5,
        sprintDuration: predictSprint.duration,
        storyPoints: predictSprint.storyPoints,
        bugs: predictSprint.bugs,
        riskLevel: riskLevel,
        dependencies: predictSprint.dependencies,
      });
      setActivePrediction({
        sprintId: predictSprint._id,
        ...res.data.prediction,
      });
      toast.success('Prediction complete!');
      fetchData();
    } catch (error) {
      const msg = error.response?.data?.message || 'Prediction failed. Is the ML service running?';
      toast.error(msg);
    } finally {
      setPredictingId(null);
      setPredictSprint(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/projects')} className="p-2 rounded-xl text-dark-400 hover:text-dark-200 hover:bg-dark-700/50 transition-all">
            <HiOutlineArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-dark-100">{project?.projectName || 'Sprints'}</h1>
            <p className="text-dark-400 text-sm mt-1">
              {sprints.length} sprint{sprints.length !== 1 ? 's' : ''} · Team of {project?.teamSize || '?'}
            </p>
          </div>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <HiOutlinePlus className="w-5 h-5" />
          New Sprint
        </button>
      </div>

      {/* Active Prediction Result */}
      {activePrediction && (
        <PredictionResult
          prediction={activePrediction}
          onClose={() => setActivePrediction(null)}
        />
      )}

      {/* Sprints List */}
      {sprints.length > 0 ? (
        <div className="space-y-4">
          {sprints.map((sprint, index) => (
            <div
              key={sprint._id}
              className="glass-card p-6 animate-slide-up"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Sprint Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500/20 to-teal-500/20 border border-primary-500/20 flex items-center justify-center">
                      <HiOutlineLightningBolt className="w-4 h-4 text-primary-400" />
                    </div>
                    <h3 className="font-semibold text-dark-100">{sprint.sprintName}</h3>
                    {/* Prediction badge */}
                    {sprint.predictionResult?.label && (
                      <span className={`${
                        sprint.predictionResult.label === 'Delayed' ? 'badge-danger' : 'badge-success'
                      }`}>
                        {sprint.predictionResult.label === 'Delayed' ? (
                          <HiOutlineExclamationCircle className="w-3 h-3 inline mr-1" />
                        ) : (
                          <HiOutlineCheckCircle className="w-3 h-3 inline mr-1" />
                        )}
                        {sprint.predictionResult.label}
                      </span>
                    )}
                  </div>

                  {/* Sprint metrics */}
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-1.5 text-dark-400">
                      <HiOutlineClock className="w-4 h-4" />
                      <span>{sprint.duration} days</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-dark-400">
                      <HiOutlineChartBar className="w-4 h-4" />
                      <span>{sprint.completedPoints}/{sprint.storyPoints} pts</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-dark-400">
                      <HiOutlineExclamation className="w-4 h-4" />
                      <span>{sprint.bugs} bugs</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-dark-400">
                      <HiOutlineCollection className="w-4 h-4" />
                      <span>{sprint.dependencies} deps</span>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="lg:w-32">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-dark-400">Progress</span>
                    <span className="text-primary-400 font-medium">
                      {sprint.storyPoints > 0 ? Math.round((sprint.completedPoints / sprint.storyPoints) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-dark-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-500 to-teal-500 rounded-full transition-all duration-500"
                      style={{ width: `${sprint.storyPoints > 0 ? Math.min((sprint.completedPoints / sprint.storyPoints) * 100, 100) : 0}%` }}
                    ></div>
                  </div>
                </div>

                {/* Predict Button */}
                <button
                  onClick={() => openPredictModal(sprint)}
                  disabled={predictingId === sprint._id}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 ${
                    predictingId === sprint._id
                      ? 'bg-dark-700 text-dark-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-400 hover:to-orange-400 hover:shadow-lg hover:shadow-amber-500/25 active:scale-[0.98]'
                  }`}
                >
                  {predictingId === sprint._id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-dark-400/30 border-t-dark-400 rounded-full animate-spin"></div>
                      Predicting...
                    </>
                  ) : (
                    <>
                      <HiOutlineSparkles className="w-4 h-4" />
                      Predict Delay
                    </>
                  )}
                </button>
              </div>

              {/* Inline severity indicator (if prediction exists) */}
              {sprint.predictionResult?.severity && (
                <div className="mt-4 pt-4 border-t border-dark-700/50">
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-dark-400">Severity:</span>
                    <span className={`font-semibold ${
                      sprint.predictionResult.severity === 'Low' ? 'text-emerald-400' :
                      sprint.predictionResult.severity === 'Medium' ? 'text-amber-400' : 'text-red-400'
                    }`}>
                      {sprint.predictionResult.severity}
                    </span>
                    <span className="text-dark-400">Confidence:</span>
                    <span className="text-primary-400 font-semibold">
                      {Math.round((sprint.predictionResult.confidence || 0) * 100)}%
                    </span>
                    <span className="text-dark-400">Risk:</span>
                    <span className="text-dark-200 font-semibold">{sprint.predictionResult.riskLevel}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <HiOutlineLightningBolt className="w-16 h-16 mx-auto text-dark-600 mb-4" />
          <h3 className="text-lg font-semibold text-dark-300 mb-2">No Sprints Yet</h3>
          <p className="text-dark-500 text-sm mb-6">Create your first sprint to start tracking and predicting delays</p>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <HiOutlinePlus className="w-5 h-5 inline mr-2" />
            Create Sprint
          </button>
        </div>
      )}

      {/* Create Sprint Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-card p-8 w-full max-w-lg animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-dark-100">Create New Sprint</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg text-dark-400 hover:text-dark-200 hover:bg-dark-700/50">
                <HiOutlineX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSprint} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Sprint Name *</label>
                <input
                  id="sprint-name"
                  type="text"
                  value={formData.sprintName}
                  onChange={(e) => setFormData({ ...formData, sprintName: e.target.value })}
                  placeholder="e.g., Sprint 1 - User Auth"
                  className="input-field"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">Duration (days) *</label>
                  <input
                    id="sprint-duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="14"
                    className="input-field"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">Story Points *</label>
                  <input
                    id="sprint-story-points"
                    type="number"
                    value={formData.storyPoints}
                    onChange={(e) => setFormData({ ...formData, storyPoints: e.target.value })}
                    placeholder="40"
                    className="input-field"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">Completed Pts</label>
                  <input
                    id="sprint-completed-points"
                    type="number"
                    value={formData.completedPoints}
                    onChange={(e) => setFormData({ ...formData, completedPoints: e.target.value })}
                    placeholder="0"
                    className="input-field"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">Bugs</label>
                  <input
                    id="sprint-bugs"
                    type="number"
                    value={formData.bugs}
                    onChange={(e) => setFormData({ ...formData, bugs: e.target.value })}
                    placeholder="0"
                    className="input-field"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">Dependencies</label>
                  <input
                    id="sprint-dependencies"
                    type="number"
                    value={formData.dependencies}
                    onChange={(e) => setFormData({ ...formData, dependencies: e.target.value })}
                    placeholder="0"
                    className="input-field"
                    min="0"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    'Create Sprint'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Predict Delay Modal — Risk Level Input */}
      {showPredictModal && predictSprint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-card p-8 w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-dark-100">Predict Sprint Delay</h2>
              <button onClick={() => setShowPredictModal(false)} className="p-2 rounded-lg text-dark-400 hover:text-dark-200 hover:bg-dark-700/50">
                <HiOutlineX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-dark-700/30 rounded-xl p-4">
                <p className="text-sm text-dark-400 mb-1">Sprint</p>
                <p className="font-semibold text-dark-200">{predictSprint.sprintName}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-dark-700/30 rounded-xl p-3">
                  <p className="text-xs text-dark-400">Duration</p>
                  <p className="text-sm font-semibold text-dark-200">{predictSprint.duration} days</p>
                </div>
                <div className="bg-dark-700/30 rounded-xl p-3">
                  <p className="text-xs text-dark-400">Story Points</p>
                  <p className="text-sm font-semibold text-dark-200">{predictSprint.storyPoints}</p>
                </div>
                <div className="bg-dark-700/30 rounded-xl p-3">
                  <p className="text-xs text-dark-400">Bugs</p>
                  <p className="text-sm font-semibold text-dark-200">{predictSprint.bugs}</p>
                </div>
                <div className="bg-dark-700/30 rounded-xl p-3">
                  <p className="text-xs text-dark-400">Dependencies</p>
                  <p className="text-sm font-semibold text-dark-200">{predictSprint.dependencies}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Risk Level Assessment</label>
                <div className="grid grid-cols-4 gap-2">
                  {['Low', 'Medium', 'High', 'Critical'].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setRiskLevel(level)}
                      className={`py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        riskLevel === level
                          ? level === 'Low' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : level === 'Medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : level === 'High' ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                            : 'bg-teal-500/20 text-teal-400 border border-teal-500/40'
                          : 'bg-dark-700/30 text-dark-400 border border-dark-600 hover:border-dark-500'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowPredictModal(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button
                  onClick={handlePredict}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-medium bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-400 hover:to-orange-400 hover:shadow-lg hover:shadow-amber-500/25 transition-all active:scale-[0.98]"
                >
                  <HiOutlineSparkles className="w-4 h-4" />
                  Run Prediction
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SprintDetails;
