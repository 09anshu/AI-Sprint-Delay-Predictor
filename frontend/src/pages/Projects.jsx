/**
 * Projects.jsx — Project management page.
 * 
 * Features:
 *   - Create new projects via modal form
 *   - View all projects in a responsive grid
 *   - Delete projects with confirmation
 *   - Navigate to sprint details for each project
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineFolder,
  HiOutlineUserGroup,
  HiOutlineCalendar,
  HiOutlineLightningBolt,
  HiOutlineExclamationCircle,
  HiOutlineX,
  HiOutlineArrowRight,
} from 'react-icons/hi';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    projectName: '',
    description: '',
    teamSize: '',
    deadline: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (error) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.projectName || !formData.teamSize || !formData.deadline) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/projects', {
        ...formData,
        teamSize: parseInt(formData.teamSize),
      });
      toast.success('Project created!');
      setShowModal(false);
      setFormData({ projectName: '', description: '', teamSize: '', deadline: '' });
      fetchProjects();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete project "${name}" and all its sprints?`)) return;
    try {
      await api.delete(`/projects/${id}`);
      toast.success('Project deleted');
      fetchProjects();
    } catch (error) {
      toast.error('Failed to delete project');
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
        <div>
          <h1 className="text-2xl font-bold text-dark-100">Projects</h1>
          <p className="text-dark-400 text-sm mt-1">Manage your software projects and track sprints</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <HiOutlinePlus className="w-5 h-5" />
          New Project
        </button>
      </div>

      {/* Projects Grid */}
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((project, index) => (
            <div
              key={project._id}
              className="glass-card-hover p-6 flex flex-col animate-slide-up"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/20 to-teal-500/20 border border-primary-500/20 flex items-center justify-center">
                    <HiOutlineFolder className="w-5 h-5 text-primary-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark-100 text-sm">{project.projectName}</h3>
                    <p className="text-xs text-dark-500 mt-0.5">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(project._id, project.projectName); }}
                  className="p-2 rounded-lg text-dark-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <HiOutlineTrash className="w-4 h-4" />
                </button>
              </div>

              {/* Description */}
              {project.description && (
                <p className="text-xs text-dark-400 mb-4 line-clamp-2">{project.description}</p>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-dark-700/30 rounded-lg p-2 text-center">
                  <HiOutlineUserGroup className="w-4 h-4 mx-auto text-primary-400 mb-1" />
                  <p className="text-xs text-dark-400">Team</p>
                  <p className="text-sm font-semibold text-dark-200">{project.teamSize}</p>
                </div>
                <div className="bg-dark-700/30 rounded-lg p-2 text-center">
                  <HiOutlineLightningBolt className="w-4 h-4 mx-auto text-teal-400 mb-1" />
                  <p className="text-xs text-dark-400">Sprints</p>
                  <p className="text-sm font-semibold text-dark-200">{project.sprintCount || 0}</p>
                </div>
                <div className="bg-dark-700/30 rounded-lg p-2 text-center">
                  <HiOutlineExclamationCircle className="w-4 h-4 mx-auto text-red-400 mb-1" />
                  <p className="text-xs text-dark-400">Delayed</p>
                  <p className="text-sm font-semibold text-red-400">{project.delayedCount || 0}</p>
                </div>
              </div>

              {/* Deadline */}
              <div className="flex items-center gap-2 text-xs text-dark-400 mb-4">
                <HiOutlineCalendar className="w-4 h-4" />
                <span>Deadline: {new Date(project.deadline).toLocaleDateString()}</span>
              </div>

              {/* Action */}
              <button
                onClick={() => navigate(`/sprints/${project._id}`)}
                className="mt-auto btn-secondary flex items-center justify-center gap-2 text-sm"
              >
                View Sprints
                <HiOutlineArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <HiOutlineFolder className="w-16 h-16 mx-auto text-dark-600 mb-4" />
          <h3 className="text-lg font-semibold text-dark-300 mb-2">No Projects Yet</h3>
          <p className="text-dark-500 text-sm mb-6">Create your first project to start tracking sprints</p>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <HiOutlinePlus className="w-5 h-5 inline mr-2" />
            Create Project
          </button>
        </div>
      )}

      {/* Create Project Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-card p-8 w-full max-w-lg animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-dark-100">Create New Project</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg text-dark-400 hover:text-dark-200 hover:bg-dark-700/50">
                <HiOutlineX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Project Name *</label>
                <input
                  id="project-name"
                  type="text"
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  placeholder="e.g., E-Commerce Platform"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Description</label>
                <textarea
                  id="project-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief project description..."
                  className="input-field resize-none h-24"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">Team Size *</label>
                  <input
                    id="project-team-size"
                    type="number"
                    value={formData.teamSize}
                    onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                    placeholder="e.g., 8"
                    className="input-field"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">Deadline *</label>
                  <input
                    id="project-deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="input-field"
                    required
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
                    'Create Project'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
