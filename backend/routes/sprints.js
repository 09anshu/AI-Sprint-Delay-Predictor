/**
 * sprints.js — Sprint Management Routes.
 * 
 * POST /api/sprints              — Create a new sprint
 * GET  /api/sprints/:projectId   — Get all sprints for a project
 * POST /api/sprints/predict      — Predict delay for a sprint
 * 
 * All routes are protected (require JWT authentication).
 */

const express = require('express');
const axios = require('axios');
const Sprint = require('../models/Sprint');
const Project = require('../models/Project');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const auth = require('../middleware/auth');
const emailService = require('../services/emailService');

const router = express.Router();

/**
 * @route   POST /api/sprints
 * @desc    Create a new sprint
 * @access  Private
 */
router.post('/', auth, async (req, res) => {
  try {
    const { projectId, sprintName, duration, storyPoints, completedPoints, bugs, dependencies } = req.body;

    // Validate required fields
    if (!projectId || !sprintName || !duration || storyPoints === undefined) {
      return res.status(400).json({ 
        message: 'Please provide projectId, sprintName, duration, and storyPoints' 
      });
    }

    // Verify the project exists and belongs to the user
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    if (project.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Create sprint
    const sprint = new Sprint({
      projectId,
      sprintName,
      duration,
      storyPoints,
      completedPoints: completedPoints || 0,
      bugs: bugs || 0,
      dependencies: dependencies || 0,
    });

    await sprint.save();

    res.status(201).json({
      message: 'Sprint created successfully',
      sprint,
    });
  } catch (error) {
    console.error('Create sprint error:', error.message);
    res.status(500).json({ message: 'Server error creating sprint' });
  }
});

/**
 * @route   GET /api/sprints/:projectId
 * @desc    Get all sprints for a project
 * @access  Private
 */
router.get('/:projectId', auth, async (req, res) => {
  try {
    // Verify the project belongs to the user
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    if (project.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const sprints = await Sprint.find({ projectId: req.params.projectId })
      .sort({ createdAt: -1 });

    res.json(sprints);
  } catch (error) {
    console.error('Get sprints error:', error.message);
    res.status(500).json({ message: 'Server error fetching sprints' });
  }
});

/**
 * @route   POST /api/sprints/predict
 * @desc    Predict delay for a sprint using the ML service
 * @access  Private
 */
router.post('/predict', auth, async (req, res) => {
  try {
    const { sprintId, teamSize, sprintDuration, storyPoints, bugs, riskLevel, dependencies } = req.body;

    // Validate input
    if (!sprintId) {
      return res.status(400).json({ message: 'Sprint ID is required' });
    }

    // Verify the sprint exists
    const sprint = await Sprint.findById(sprintId);
    if (!sprint) {
      return res.status(404).json({ message: 'Sprint not found' });
    }

    // Call the ML Flask API
    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:5001';
    
    const mlResponse = await axios.post(`${mlServiceUrl}/predict`, {
      teamSize: teamSize || 5,
      sprintDuration: sprintDuration || sprint.duration,
      storyPoints: storyPoints || sprint.storyPoints,
      bugs: bugs || sprint.bugs,
      riskLevel: riskLevel || 'Medium',
      dependencies: dependencies || sprint.dependencies,
    });

    const prediction = mlResponse.data;

    // Update sprint with prediction result
    sprint.predictionResult = {
      label: prediction.label,
      severity: prediction.severity,
      confidence: prediction.confidence,
      riskLevel: prediction.riskLevel,
    };

    // --- Smart Email Alert Logic ---
    const isHighRisk = prediction.confidence > 0.6 || prediction.riskLevel === 'High' || prediction.riskLevel === 'Critical';
    
    if (isHighRisk) {
      let shouldSendEmail = false;
      
      if (!sprint.alertState || !sprint.alertState.emailSent) {
        shouldSendEmail = true;
      } else {
        // Prevent duplicate spam. Only resend if risk has significantly increased.
        // e.g. confidence jumped by more than 10%, or risk level escalated
        const confidenceJump = prediction.confidence - (sprint.alertState.lastConfidence || 0);
        const escalatedToCritical = prediction.riskLevel === 'Critical' && sprint.alertState.lastRiskLevel !== 'Critical';
        
        if (confidenceJump > 0.1 || escalatedToCritical) {
          shouldSendEmail = true;
        }
      }

      if (shouldSendEmail) {
        try {
          const project = await Project.findById(sprint.projectId);
          // Fetch the currently logged-in user (who triggered the prediction) instead of the project owner
          const user = await User.findById(req.user.id);
          
          if (user) {
            const emailSent = await emailService.sendDelayAlertEmail(user, project, sprint, prediction);
            
            if (emailSent) {
              sprint.alertState = {
                emailSent: true,
                lastSentAt: new Date(),
                lastConfidence: prediction.confidence,
                lastRiskLevel: prediction.riskLevel
              };
              
              // Log the email action
              await new ActivityLog({
                userId: req.user.id,
                userEmail: req.user.email, // using the user executing the prediction
                action: 'email_alert',
                target: 'sprint',
                targetId: sprint._id.toString(),
                details: `Email alert sent to ${user.email} (Risk: ${prediction.riskLevel}, Prob: ${Math.round(prediction.confidence*100)}%)`,
                ip: req.ip
              }).save();
            }
          }
        } catch (emailErr) {
          console.error("Failed to send/log email alert:", emailErr);
        }
      }
    }
    // --- End Email Logic ---

    await sprint.save();

    res.json({
      message: 'Prediction completed',
      prediction: sprint.predictionResult,
      details: prediction,
    });
  } catch (error) {
    console.error('Prediction error:', error.message);
    
    // Check if ML service is down
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ 
        message: 'ML prediction service is not available. Please ensure the ML service is running on port 5001.' 
      });
    }
    
    res.status(500).json({ message: 'Server error during prediction' });
  }
});

/**
 * @route   GET /api/sprints/stats/dashboard
 * @desc    Get dashboard statistics for the authenticated user
 * @access  Private
 */
router.get('/stats/dashboard', auth, async (req, res) => {
  try {
    // Get all projects for this user
    const projects = await Project.find({ userId: req.user.id });
    const projectIds = projects.map(p => p._id);

    // Get all sprints for these projects
    const sprints = await Sprint.find({ projectId: { $in: projectIds } });

    // Calculate stats
    const totalProjects = projects.length;
    const totalSprints = sprints.length;
    const delayedSprints = sprints.filter(s => s.predictionResult?.label === 'Delayed').length;
    const onTimeSprints = sprints.filter(s => s.predictionResult?.label === 'Not Delayed').length;
    const unpredicted = totalSprints - delayedSprints - onTimeSprints;

    // Recent activity (last 10 sprints)
    const recentActivity = sprints
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 10)
      .map(s => ({
        id: s._id,
        name: s.sprintName,
        status: s.predictionResult?.label || 'Pending',
        severity: s.predictionResult?.severity || 'N/A',
        date: s.createdAt,
      }));

    // Sprint performance data (for charts)
    const performanceData = sprints.map(s => ({
      name: s.sprintName,
      storyPoints: s.storyPoints,
      completedPoints: s.completedPoints,
      bugs: s.bugs,
      completion: s.storyPoints > 0 
        ? Math.round((s.completedPoints / s.storyPoints) * 100) 
        : 0,
    }));

    // Severity distribution
    const severityDistribution = {
      Low: sprints.filter(s => s.predictionResult?.severity === 'Low').length,
      Medium: sprints.filter(s => s.predictionResult?.severity === 'Medium').length,
      High: sprints.filter(s => s.predictionResult?.severity === 'High').length,
    };

    res.json({
      totalProjects,
      totalSprints,
      delayedSprints,
      onTimeSprints,
      unpredicted,
      recentActivity,
      performanceData,
      severityDistribution,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error.message);
    res.status(500).json({ message: 'Server error fetching dashboard stats' });
  }
});

module.exports = router;
