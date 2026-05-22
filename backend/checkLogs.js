require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const Sprint = require('./models/Sprint');
const ActivityLog = require('./models/ActivityLog');

async function check() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-sprint-predictor');
  
  const logs = await ActivityLog.find({ action: 'email_alert' }).sort({ timestamp: -1 }).limit(5);
  console.log('Recent Email Logs:', logs);
  
  const sprints = await Sprint.find().sort({ createdAt: -1 }).limit(3);
  console.log('Recent Sprints Alert State:');
  sprints.forEach(s => {
    console.log(`Sprint: ${s.sprintName}, Risk: ${s.predictionResult?.riskLevel}, AlertState:`, s.alertState);
  });
  
  process.exit(0);
}

check();
