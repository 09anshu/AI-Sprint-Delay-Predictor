require('dotenv').config({ path: './.env' });
const emailService = require('./services/emailService');

const testSend = async () => {
  const mockUser = { name: 'Test Owner', email: 'owner@example.com' };
  const mockProject = { projectName: 'Alpha Migration' };
  const mockSprint = { 
    sprintName: 'Sprint 14',
    duration: 14,
    storyPoints: 40,
    completedPoints: 10,
    bugs: 8,
    dependencies: 5
  };
  const mockPrediction = {
    label: 'Delayed',
    severity: 'High',
    confidence: 0.85,
    riskLevel: 'Critical'
  };

  console.log('Sending test email...');
  const success = await emailService.sendDelayAlertEmail(mockUser, mockProject, mockSprint, mockPrediction);
  console.log('Email send success:', success);
};

testSend();
