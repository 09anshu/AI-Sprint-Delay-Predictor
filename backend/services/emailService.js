const nodemailer = require('nodemailer');

// Configure transport
const createTransporter = async () => {
  // Use provided SMTP config or fallback to Ethereal for testing
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Generate a test account from Ethereal if no config exists
    console.log('No SMTP config found. Generating test Ethereal account...');
    let testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }
};

/**
 * Derives reasons for the email based on sprint data
 */
const deriveEmailReasons = (sprint, prediction) => {
  const reasons = [];
  if (sprint.bugs >= 5) reasons.push('High number of unresolved bugs');
  if (sprint.dependencies >= 4) reasons.push('Too many external dependencies');
  
  const progress = sprint.storyPoints > 0 ? (sprint.completedPoints / sprint.storyPoints) * 100 : 0;
  if (progress < 50) reasons.push('Low sprint progress for timeline');
  if (prediction.severity === 'High') reasons.push('ML Model detected severe deviation');
  
  if (reasons.length === 0) reasons.push('Elevated risk pattern detected by AI');
  return reasons;
};

/**
 * Derives suggested actions based on reasons
 */
const deriveEmailActions = (reasons) => {
  const actions = [];
  const text = reasons.join(' ');
  if (text.includes('bugs')) actions.push('Fix critical bugs first');
  if (text.includes('dependencies')) actions.push('Reduce or resolve dependencies quickly');
  if (text.includes('progress')) actions.push('Allocate more team resources');
  if (actions.length === 0) actions.push('Conduct an immediate risk review with stakeholders');
  return actions;
};

const sendDelayAlertEmail = async (user, project, sprint, prediction) => {
  try {
    const transporter = await createTransporter();
    const reasons = deriveEmailReasons(sprint, prediction);
    const actions = deriveEmailActions(reasons);

    const isCritical = prediction.riskLevel === 'Critical' || prediction.severity === 'High';
    const accentColor = isCritical ? '#ef4444' : '#f59e0b'; // Red or Amber
    const confidencePercent = Math.round((prediction.confidence || 0) * 100);

    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
          .header { background-color: #0f172a; padding: 24px; text-align: center; border-bottom: 4px solid ${accentColor}; }
          .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; }
          .content { padding: 32px; }
          .alert-box { background-color: ${isCritical ? '#fef2f2' : '#fffbeb'}; border: 1px solid ${isCritical ? '#fecaca' : '#fde68a'}; border-radius: 8px; padding: 16px; margin-bottom: 24px; text-align: center; }
          .alert-box h2 { color: ${accentColor}; margin: 0 0 8px 0; font-size: 20px; }
          .alert-box p { margin: 0; font-size: 16px; font-weight: 500; }
          .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
          .metric { background-color: #f1f5f9; padding: 12px; border-radius: 6px; }
          .metric-label { font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 600; }
          .metric-value { font-size: 16px; font-weight: 600; color: #0f172a; margin-top: 4px; }
          .section { margin-bottom: 24px; }
          .section h3 { font-size: 16px; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 12px; }
          .section ul { margin: 0; padding-left: 20px; }
          .section li { margin-bottom: 8px; color: #334155; }
          .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>AI Sprint Predictor Alert</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${user.name}</strong>,</p>
            <p>Our AI model has detected a high risk of delay for your ongoing sprint in the <strong>${project.projectName}</strong> project.</p>
            
            <div class="alert-box">
              <h2>⚠️ Sprint Delay Risk: ${prediction.riskLevel}</h2>
              <p>Sprint <strong>"${sprint.sprintName}"</strong> has a <strong>${confidencePercent}%</strong> probability of delay.</p>
            </div>

            <div class="details-grid">
              <div class="metric">
                <div class="metric-label">Duration</div>
                <div class="metric-value">${sprint.duration} days</div>
              </div>
              <div class="metric">
                <div class="metric-label">Progress</div>
                <div class="metric-value">${sprint.storyPoints > 0 ? Math.round((sprint.completedPoints / sprint.storyPoints) * 100) : 0}% (${sprint.completedPoints}/${sprint.storyPoints} pts)</div>
              </div>
              <div class="metric">
                <div class="metric-label">Bugs</div>
                <div class="metric-value">${sprint.bugs}</div>
              </div>
              <div class="metric">
                <div class="metric-label">Dependencies</div>
                <div class="metric-value">${sprint.dependencies}</div>
              </div>
            </div>

            <div class="section">
              <h3>🧠 AI Insights (Reasons for Alert)</h3>
              <ul>
                ${reasons.map(r => `<li>${r}</li>`).join('')}
              </ul>
            </div>

            <div class="section">
              <h3>🚀 Suggested Actions</h3>
              <ul>
                ${actions.map(a => `<li>${a}</li>`).join('')}
              </ul>
            </div>
            
            <p style="margin-top: 32px;">Log into your dashboard to view full details and manage the sprint.</p>
          </div>
          <div class="footer">
            This is an automated alert generated by AI Sprint Predictor.<br/>
            You are receiving this because you are the owner of the ${project.projectName} project.
          </div>
        </div>
      </body>
      </html>
    `;

    const info = await transporter.sendMail({
      from: `AI Sprint Predictor <${process.env.EMAIL_FROM || 'alerts@aisprintpredictor.com'}>`,
      to: user.email,
      subject: `⚠️ Sprint Delay Alert - ${prediction.riskLevel} Risk Detected`,
      html: htmlTemplate,
    });

    console.log(`Alert email sent for sprint ${sprint._id}: ${info.messageId}`);
    if (info.messageId && info.messageId.includes('@')) {
        // Ethereal specific log
        const testUrl = nodemailer.getTestMessageUrl(info);
        if(testUrl) {
           console.log(`Preview Email URL: ${testUrl}`);
        }
    }
    
    return true;
  } catch (error) {
    console.error('Error sending alert email:', error);
    return false;
  }
};

module.exports = {
  sendDelayAlertEmail
};
