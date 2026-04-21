/**
 * projects.js — Project Management Routes.
 * 
 * POST   /api/projects     — Create a new project
 * GET    /api/projects      — Get all user's projects
 * DELETE /api/projects/:id  — Delete a project
 * 
 * All routes are protected (require JWT authentication).
 */

const express = require('express');
const Project = require('../models/Project');
const Sprint = require('../models/Sprint');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * @route   POST /api/projects
 * @desc    Create a new project
 * @access  Private
 */
router.post('/', auth, async (req, res) => {
  try {
    const { projectName, description, teamSize, deadline } = req.body;

    // Validate required fields
    if (!projectName || !teamSize || !deadline) {
      return res.status(400).json({ 
        message: 'Please provide project name, team size, and deadline' 
      });
    }

    // Create project
    const project = new Project({
      userId: req.user.id,
      projectName,
      description: description || '',
      teamSize,
      deadline,
    });

    await project.save();

    res.status(201).json({
      message: 'Project created successfully',
      project,
    });
  } catch (error) {
    console.error('Create project error:', error.message);
    res.status(500).json({ message: 'Server error creating project' });
  }
});

/**
 * @route   GET /api/projects
 * @desc    Get all projects for the authenticated user
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    // Get sprint counts for each project
    const projectsWithCounts = await Promise.all(
      projects.map(async (project) => {
        const sprintCount = await Sprint.countDocuments({ projectId: project._id });
        const delayedCount = await Sprint.countDocuments({ 
          projectId: project._id, 
          'predictionResult.label': 'Delayed' 
        });
        return {
          ...project.toObject(),
          sprintCount,
          delayedCount,
        };
      })
    );

    res.json(projectsWithCounts);
  } catch (error) {
    console.error('Get projects error:', error.message);
    res.status(500).json({ message: 'Server error fetching projects' });
  }
});

/**
 * @route   DELETE /api/projects/:id
 * @desc    Delete a project and its sprints
 * @access  Private
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Ensure user owns this project
    if (project.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this project' });
    }

    // Delete all sprints associated with this project
    await Sprint.deleteMany({ projectId: project._id });

    // Delete the project
    await Project.findByIdAndDelete(req.params.id);

    res.json({ message: 'Project and associated sprints deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error.message);
    res.status(500).json({ message: 'Server error deleting project' });
  }
});

module.exports = router;
