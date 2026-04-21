/**
 * admin.js — Admin Panel API Routes.
 * All routes prefixed with /api/admin, protected by adminAuth middleware.
 */
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Project = require('../models/Project');
const Sprint = require('../models/Sprint');
const ActivityLog = require('../models/ActivityLog');
const adminAuth = require('../middleware/adminAuth');
const router = express.Router();

const logActivity = async (userId, userEmail, action, target, targetId = '', details = '', ip = '') => {
  try { await new ActivityLog({ userId, userEmail, action, target, targetId, details, ip }).save(); } catch (e) { console.error('Log error:', e.message); }
};

// Admin Login (public)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Please provide email and password' });
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    if (user.role !== 'admin') return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    if (user.status === 'blocked') return res.status(403).json({ message: 'Account is blocked' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, name: user.name, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
    await logActivity(user._id, user.email, 'admin_login', 'system', '', 'Admin login', req.ip);
    res.json({ message: 'Admin login successful', token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) { res.status(500).json({ message: 'Server error during login' }); }
});

// Dashboard Stats
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProjects = await Project.countDocuments();
    const totalSprints = await Sprint.countDocuments();
    const delayedSprints = await Sprint.countDocuments({ 'predictionResult.label': 'Delayed' });
    const predictedSprints = await Sprint.countDocuments({ 'predictionResult.label': { $ne: '' } });
    const notDelayed = await Sprint.countDocuments({ 'predictionResult.label': 'Not Delayed' });
    const predictionAccuracy = predictedSprints > 0 ? Math.round(((notDelayed + delayedSprints) / predictedSprints) * 100) : 0;
    const twelveMonthsAgo = new Date(); twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    const userGrowth = await User.aggregate([{ $match: { createdAt: { $gte: twelveMonthsAgo } } }, { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }]);
    const sprintDelays = await Sprint.aggregate([{ $match: { 'predictionResult.label': 'Delayed', createdAt: { $gte: twelveMonthsAgo } } }, { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }]);
    const riskDistribution = { Low: await Sprint.countDocuments({ 'predictionResult.severity': 'Low' }), Medium: await Sprint.countDocuments({ 'predictionResult.severity': 'Medium' }), High: await Sprint.countDocuments({ 'predictionResult.severity': 'High' }) };
    const recentActivity = await ActivityLog.find().sort({ timestamp: -1 }).limit(15).lean();
    res.json({ totalUsers, totalProjects, totalSprints, delayedSprints, predictionAccuracy, userGrowth, sprintDelays, riskDistribution, recentActivity });
  } catch (error) { res.status(500).json({ message: 'Server error fetching dashboard stats' }); }
});

// Users CRUD
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { search, role, status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    if (role) filter.role = role;
    if (status) filter.status = status;
    const total = await User.countDocuments(filter);
    const users = await User.find(filter).select('-password').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit));
    res.json({ users, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (error) { res.status(500).json({ message: 'Server error fetching users' }); }
});

router.get('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    const projectCount = await Project.countDocuments({ userId: user._id });
    res.json({ ...user.toObject(), projectCount });
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

router.post('/users', adminAuth, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email, and password are required' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already in use' });
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = new User({ name, email, password: hashedPassword, role: role || 'user' });
    await user.save();
    await logActivity(req.user.id, req.user.email, 'create', 'user', user._id.toString(), `Created user: ${email}`, req.ip);
    res.status(201).json({ message: 'User created', user: { ...user.toObject(), password: undefined } });
  } catch (error) { res.status(500).json({ message: 'Server error creating user' }); }
});

router.put('/users/:id', adminAuth, async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (name) user.name = name; if (email) user.email = email; if (role) user.role = role;
    await user.save();
    await logActivity(req.user.id, req.user.email, 'update', 'user', user._id.toString(), `Updated user: ${user.email}`, req.ip);
    res.json({ message: 'User updated', user: { ...user.toObject(), password: undefined } });
  } catch (error) { res.status(500).json({ message: 'Server error updating user' }); }
});

router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user._id.toString() === req.user.id) return res.status(400).json({ message: 'Cannot delete your own account' });
    const projects = await Project.find({ userId: user._id });
    await Sprint.deleteMany({ projectId: { $in: projects.map(p => p._id) } });
    await Project.deleteMany({ userId: user._id });
    await User.findByIdAndDelete(req.params.id);
    await logActivity(req.user.id, req.user.email, 'delete', 'user', req.params.id, `Deleted user: ${user.email}`, req.ip);
    res.json({ message: 'User and associated data deleted' });
  } catch (error) { res.status(500).json({ message: 'Server error deleting user' }); }
});

router.put('/users/:id/block', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user._id.toString() === req.user.id) return res.status(400).json({ message: 'Cannot block your own account' });
    user.status = user.status === 'active' ? 'blocked' : 'active';
    await user.save();
    const action = user.status === 'blocked' ? 'block' : 'unblock';
    await logActivity(req.user.id, req.user.email, action, 'user', user._id.toString(), `${action}ed user: ${user.email}`, req.ip);
    res.json({ message: `User ${action}ed`, user: { ...user.toObject(), password: undefined } });
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

// Projects CRUD
router.get('/projects', adminAuth, async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const filter = {}; if (search) filter.projectName = { $regex: search, $options: 'i' };
    const total = await Project.countDocuments(filter);
    const projects = await Project.find(filter).populate('userId', 'name email').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit));
    const projectsWithCounts = await Promise.all(projects.map(async (p) => {
      const sprintCount = await Sprint.countDocuments({ projectId: p._id });
      const delayedCount = await Sprint.countDocuments({ projectId: p._id, 'predictionResult.label': 'Delayed' });
      return { ...p.toObject(), sprintCount, delayedCount };
    }));
    res.json({ projects: projectsWithCounts, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (error) { res.status(500).json({ message: 'Server error fetching projects' }); }
});

router.put('/projects/:id', adminAuth, async (req, res) => {
  try {
    const { projectName, description, teamSize, deadline } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (projectName) project.projectName = projectName; if (description !== undefined) project.description = description;
    if (teamSize) project.teamSize = teamSize; if (deadline) project.deadline = deadline;
    await project.save();
    await logActivity(req.user.id, req.user.email, 'update', 'project', project._id.toString(), `Updated project: ${project.projectName}`, req.ip);
    res.json({ message: 'Project updated', project });
  } catch (error) { res.status(500).json({ message: 'Server error updating project' }); }
});

router.delete('/projects/:id', adminAuth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    await Sprint.deleteMany({ projectId: project._id });
    await Project.findByIdAndDelete(req.params.id);
    await logActivity(req.user.id, req.user.email, 'delete', 'project', req.params.id, `Deleted project: ${project.projectName}`, req.ip);
    res.json({ message: 'Project and sprints deleted' });
  } catch (error) { res.status(500).json({ message: 'Server error deleting project' }); }
});

// Sprints CRUD
router.get('/sprints', adminAuth, async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const filter = {}; if (search) filter.sprintName = { $regex: search, $options: 'i' };
    if (status === 'delayed') filter['predictionResult.label'] = 'Delayed';
    if (status === 'ontime') filter['predictionResult.label'] = 'Not Delayed';
    if (status === 'pending') filter['predictionResult.label'] = { $in: ['', null] };
    const total = await Sprint.countDocuments(filter);
    const sprints = await Sprint.find(filter).populate({ path: 'projectId', select: 'projectName userId', populate: { path: 'userId', select: 'name email' } }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit));
    res.json({ sprints, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (error) { res.status(500).json({ message: 'Server error fetching sprints' }); }
});

router.put('/sprints/:id', adminAuth, async (req, res) => {
  try {
    const sprint = await Sprint.findById(req.params.id);
    if (!sprint) return res.status(404).json({ message: 'Sprint not found' });
    const { sprintName, duration, storyPoints, completedPoints, bugs, dependencies } = req.body;
    if (sprintName) sprint.sprintName = sprintName; if (duration) sprint.duration = duration;
    if (storyPoints !== undefined) sprint.storyPoints = storyPoints; if (completedPoints !== undefined) sprint.completedPoints = completedPoints;
    if (bugs !== undefined) sprint.bugs = bugs; if (dependencies !== undefined) sprint.dependencies = dependencies;
    await sprint.save();
    await logActivity(req.user.id, req.user.email, 'update', 'sprint', sprint._id.toString(), `Updated sprint: ${sprint.sprintName}`, req.ip);
    res.json({ message: 'Sprint updated', sprint });
  } catch (error) { res.status(500).json({ message: 'Server error updating sprint' }); }
});

router.delete('/sprints/:id', adminAuth, async (req, res) => {
  try {
    const sprint = await Sprint.findById(req.params.id);
    if (!sprint) return res.status(404).json({ message: 'Sprint not found' });
    await Sprint.findByIdAndDelete(req.params.id);
    await logActivity(req.user.id, req.user.email, 'delete', 'sprint', req.params.id, `Deleted sprint: ${sprint.sprintName}`, req.ip);
    res.json({ message: 'Sprint deleted' });
  } catch (error) { res.status(500).json({ message: 'Server error deleting sprint' }); }
});

// Predictions
router.get('/predictions', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const filter = { 'predictionResult.label': { $ne: '' } };
    const total = await Sprint.countDocuments(filter);
    const predictions = await Sprint.find(filter).populate({ path: 'projectId', select: 'projectName userId', populate: { path: 'userId', select: 'name email' } }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit));
    const delayed = await Sprint.countDocuments({ 'predictionResult.label': 'Delayed' });
    const notDelayed = await Sprint.countDocuments({ 'predictionResult.label': 'Not Delayed' });
    const avgConfidence = await Sprint.aggregate([{ $match: { 'predictionResult.confidence': { $gt: 0 } } }, { $group: { _id: null, avg: { $avg: '$predictionResult.confidence' } } }]);
    res.json({ predictions, total, page: parseInt(page), totalPages: Math.ceil(total / limit), stats: { totalPredictions: total, delayed, notDelayed, avgConfidence: avgConfidence[0]?.avg || 0 } });
  } catch (error) { res.status(500).json({ message: 'Server error fetching predictions' }); }
});

// Analytics
router.get('/analytics', adminAuth, async (req, res) => {
  try {
    const sixMonthsAgo = new Date(); sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const delayTrends = await Sprint.aggregate([{ $match: { createdAt: { $gte: sixMonthsAgo }, 'predictionResult.label': { $ne: '' } } }, { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, total: { $sum: 1 }, delayed: { $sum: { $cond: [{ $eq: ['$predictionResult.label', 'Delayed'] }, 1, 0] } }, onTime: { $sum: { $cond: [{ $eq: ['$predictionResult.label', 'Not Delayed'] }, 1, 0] } } } }, { $sort: { _id: 1 } }]);
    const bugCorrelation = await Sprint.aggregate([{ $match: { 'predictionResult.label': { $ne: '' } } }, { $group: { _id: '$predictionResult.label', avgBugs: { $avg: '$bugs' }, avgStoryPoints: { $avg: '$storyPoints' }, avgDuration: { $avg: '$duration' }, count: { $sum: 1 } } }]);
    const teamPerformance = await Sprint.aggregate([{ $match: { 'predictionResult.label': { $ne: '' } } }, { $group: { _id: '$projectId', totalSprints: { $sum: 1 }, delayed: { $sum: { $cond: [{ $eq: ['$predictionResult.label', 'Delayed'] }, 1, 0] } }, avgCompletion: { $avg: { $cond: [{ $gt: ['$storyPoints', 0] }, { $divide: ['$completedPoints', '$storyPoints'] }, 0] } } } }, { $sort: { delayed: -1 } }, { $limit: 10 }, { $lookup: { from: 'projects', localField: '_id', foreignField: '_id', as: 'project' } }, { $unwind: { path: '$project', preserveNullAndEmptyArrays: true } }]);
    res.json({ delayTrends, bugCorrelation, teamPerformance });
  } catch (error) { res.status(500).json({ message: 'Server error fetching analytics' }); }
});

// Database View
router.get('/database/:collection', adminAuth, async (req, res) => {
  try {
    const { collection } = req.params;
    const { page = 1, limit = 25, search } = req.query;
    const models = { users: User, projects: Project, sprints: Sprint, logs: ActivityLog };
    const Model = models[collection];
    if (!Model) return res.status(400).json({ message: 'Invalid collection' });
    const filter = {};
    if (search) {
      const sf = { users: ['name', 'email'], projects: ['projectName'], sprints: ['sprintName'], logs: ['action', 'details', 'userEmail'] };
      filter.$or = (sf[collection] || []).map(f => ({ [f]: { $regex: search, $options: 'i' } }));
    }
    const total = await Model.countDocuments(filter);
    const records = await Model.find(filter).select(collection === 'users' ? '-password' : '').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit)).lean();
    res.json({ records, total, page: parseInt(page), totalPages: Math.ceil(total / limit), collection });
  } catch (error) { res.status(500).json({ message: 'Server error fetching database records' }); }
});

router.put('/database/:collection/:id', adminAuth, async (req, res) => {
  try {
    const { collection, id } = req.params;
    const models = { users: User, projects: Project, sprints: Sprint };
    const Model = models[collection]; if (!Model) return res.status(400).json({ message: 'Invalid collection' });
    const record = await Model.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!record) return res.status(404).json({ message: 'Record not found' });
    await logActivity(req.user.id, req.user.email, 'update', collection.slice(0, -1), id, `DB edit: ${collection}/${id}`, req.ip);
    res.json({ message: 'Record updated', record });
  } catch (error) { res.status(500).json({ message: 'Server error updating record' }); }
});

router.delete('/database/:collection/:id', adminAuth, async (req, res) => {
  try {
    const { collection, id } = req.params;
    const models = { users: User, projects: Project, sprints: Sprint, logs: ActivityLog };
    const Model = models[collection]; if (!Model) return res.status(400).json({ message: 'Invalid collection' });
    const record = await Model.findByIdAndDelete(id);
    if (!record) return res.status(404).json({ message: 'Record not found' });
    await logActivity(req.user.id, req.user.email, 'delete', collection.slice(0, -1), id, `DB delete: ${collection}/${id}`, req.ip);
    res.json({ message: 'Record deleted' });
  } catch (error) { res.status(500).json({ message: 'Server error deleting record' }); }
});

// Logs
router.get('/logs', adminAuth, async (req, res) => {
  try {
    const { action, target, search, page = 1, limit = 30 } = req.query;
    const filter = {}; if (action) filter.action = action; if (target) filter.target = target;
    if (search) filter.$or = [{ details: { $regex: search, $options: 'i' } }, { userEmail: { $regex: search, $options: 'i' } }];
    const total = await ActivityLog.countDocuments(filter);
    const logs = await ActivityLog.find(filter).sort({ timestamp: -1 }).skip((page - 1) * limit).limit(parseInt(limit)).lean();
    res.json({ logs, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (error) { res.status(500).json({ message: 'Server error fetching logs' }); }
});

// Settings
router.get('/settings', adminAuth, async (req, res) => {
  try {
    res.json({ mlServiceUrl: process.env.ML_SERVICE_URL || 'http://localhost:5001', jwtExpiresIn: '7d', mongoUri: process.env.MONGODB_URI ? '***connected***' : 'Not configured', serverPort: process.env.PORT || 5000, nodeEnv: process.env.NODE_ENV || 'development', roles: ['user', 'admin'], statuses: ['active', 'blocked'] });
  } catch (error) { res.status(500).json({ message: 'Server error fetching settings' }); }
});

module.exports = router;
