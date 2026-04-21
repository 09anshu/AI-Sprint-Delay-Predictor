/**
 * Project.js — Project Model (Mongoose Schema).
 * 
 * Fields:
 *   - userId: Reference to the User who owns this project
 *   - projectName: Name of the project
 *   - description: Project description
 *   - teamSize: Number of team members
 *   - deadline: Project deadline date
 *   - createdAt: Project creation timestamp
 */

const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
  },
  projectName: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    minlength: [2, 'Project name must be at least 2 characters'],
    maxlength: [100, 'Project name cannot exceed 100 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: '',
  },
  teamSize: {
    type: Number,
    required: [true, 'Team size is required'],
    min: [1, 'Team size must be at least 1'],
    max: [500, 'Team size cannot exceed 500'],
  },
  deadline: {
    type: Date,
    required: [true, 'Deadline is required'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Project', projectSchema);
