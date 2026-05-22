/**
 * Sprint.js — Sprint Model (Mongoose Schema).
 * 
 * Fields:
 *   - projectId: Reference to the parent Project
 *   - sprintName: Name of the sprint
 *   - duration: Sprint duration in days
 *   - storyPoints: Total story points planned
 *   - completedPoints: Story points completed
 *   - bugs: Number of bugs found
 *   - dependencies: Number of external dependencies
 *   - predictionResult: ML prediction output
 *   - createdAt: Sprint creation timestamp
 */

const mongoose = require('mongoose');

const sprintSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project ID is required'],
  },
  sprintName: {
    type: String,
    required: [true, 'Sprint name is required'],
    trim: true,
    minlength: [2, 'Sprint name must be at least 2 characters'],
    maxlength: [100, 'Sprint name cannot exceed 100 characters'],
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 day'],
    max: [90, 'Duration cannot exceed 90 days'],
  },
  storyPoints: {
    type: Number,
    required: [true, 'Story points are required'],
    min: [0, 'Story points cannot be negative'],
  },
  completedPoints: {
    type: Number,
    default: 0,
    min: [0, 'Completed points cannot be negative'],
  },
  bugs: {
    type: Number,
    default: 0,
    min: [0, 'Bug count cannot be negative'],
  },
  dependencies: {
    type: Number,
    default: 0,
    min: [0, 'Dependencies count cannot be negative'],
  },
  predictionResult: {
    label: { type: String, enum: ['Delayed', 'Not Delayed', ''], default: '' },
    severity: { type: String, enum: ['Low', 'Medium', 'High', ''], default: '' },
    confidence: { type: Number, default: 0 },
    riskLevel: { type: String, default: '' },
  },
  alertState: {
    emailSent: { type: Boolean, default: false },
    lastSentAt: { type: Date },
    lastConfidence: { type: Number, default: 0 },
    lastRiskLevel: { type: String, default: '' },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Sprint', sprintSchema);
