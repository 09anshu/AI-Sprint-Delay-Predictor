/**
 * ActivityLog.js — Activity Log Model (Mongoose Schema).
 * 
 * Tracks user and admin actions across the system.
 * Fields:
 *   - userId: Who performed the action
 *   - userEmail: Email of the user (denormalized for quick display)
 *   - action: What was done (login, create, update, delete, predict, block, unblock)
 *   - target: Which entity type (user, project, sprint, prediction, settings)
 *   - targetId: ID of the affected entity
 *   - details: Additional details about the action
 *   - ip: IP address of the request
 *   - timestamp: When it happened
 */

const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  userEmail: {
    type: String,
    default: '',
  },
  action: {
    type: String,
    required: true,
    enum: ['login', 'create', 'update', 'delete', 'predict', 'block', 'unblock', 'admin_login', 'settings_update'],
  },
  target: {
    type: String,
    required: true,
    enum: ['user', 'project', 'sprint', 'prediction', 'settings', 'system'],
  },
  targetId: {
    type: String,
    default: '',
  },
  details: {
    type: String,
    default: '',
  },
  ip: {
    type: String,
    default: '',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient querying
activityLogSchema.index({ timestamp: -1 });
activityLogSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
