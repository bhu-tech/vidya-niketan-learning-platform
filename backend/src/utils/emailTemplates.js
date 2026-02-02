const adminNewSignupTemplate = (user) => {
  const frontend = process.env.FRONTEND_URL || process.env.REACT_APP_API_URL || '';
  const backend = process.env.BACKEND_URL || process.env.REACT_APP_API_URL || '';
  const approveApi = `${backend.replace(/\/$/, '')}/admin/users/${user._id}/approve`;
  const subject = `New ${user.role} signup awaiting approval: ${user.name}`;
  const html = `
    <div style="font-family: Arial, sans-serif; color: #0f172a;">
      <h2 style="color:#6d28d9;">New account awaiting approval</h2>
      <p><strong>${user.name}</strong> has signed up as <strong>${user.role}</strong>.</p>
      <p>Email: <a href="mailto:${user.email}">${user.email}</a></p>
      <p>Signed up: ${new Date(user.createdAt).toLocaleString()}</p>
      <div style="margin-top:18px">
        <a href="${frontend}/admin/approvals" style="display:inline-block;padding:10px 16px;border-radius:6px;background:linear-gradient(90deg,#6d28d9,#06b6d4);color:#fff;text-decoration:none;margin-right:8px;">Open Approvals</a>
        <span style="font-size:12px;color:#6b7280;">Or use API (requires admin auth):</span>
        <pre style="background:#f3f4f6;padding:8px;border-radius:4px;color:#111;margin-top:8px;overflow:auto;">PUT ${approveApi}</pre>
      </div>
      <hr style="margin-top:18px;border:none;border-top:1px solid #e6eef2">
      <small style="color:#6b7280">This notification was generated automatically.</small>
    </div>
  `;
  return { subject, html };
};

const userApprovedTemplate = (user) => {
  const frontend = process.env.FRONTEND_URL || process.env.REACT_APP_API_URL || '';
  const subject = 'Your account has been approved';
  const html = `
    <div style="font-family: Arial, sans-serif;color:#0f172a;">
      <h2 style="color:#06b6d4;">Account approved</h2>
      <p>Hi <strong>${user.name}</strong>,</p>
      <p>Your account has just been approved by an administrator. You can now <a href="${frontend}/login">sign in</a> to access your dashboard.</p>
      <p style="margin-top:12px">Role: <strong>${user.role}</strong></p>
      <hr style="margin-top:18px;border:none;border-top:1px solid #e6eef2">
      <small style="color:#6b7280">If you did not request this account, please contact support.</small>
    </div>
  `;
  return { subject, html };
};

const classReminderTemplate = (user, classData, minutesBefore) => {
  const frontend = process.env.FRONTEND_URL || 'http://localhost:3000';
  const subject = `Class Reminder: ${classData.title} starts in ${minutesBefore} minutes`;
  const html = `
    <div style="font-family: Arial, sans-serif; color: #0f172a; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">⏰ Class Reminder</h1>
      </div>
      
      <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
        <h2 style="color: #667eea; margin-top: 0;">Hi ${user.name}!</h2>
        
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; color: #92400e; font-weight: 600;">
            🔔 Your class starts in ${minutesBefore} minutes!
          </p>
        </div>

        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">📚 ${classData.title}</h3>
          <p style="color: #666; margin: 10px 0;">${classData.description || ''}</p>
          
          <div style="margin-top: 15px;">
            <p style="margin: 5px 0;"><strong>👨‍🏫 Teacher:</strong> ${classData.teacher.name}</p>
            <p style="margin: 5px 0;"><strong>🕐 Start Time:</strong> ${classData.schedule.startTime}</p>
            <p style="margin: 5px 0;"><strong>🕑 End Time:</strong> ${classData.schedule.endTime}</p>
          </div>
        </div>

        ${classData.zoomJoinUrl ? `
          <div style="text-align: center; margin: 30px 0;">
            <a href="${classData.zoomJoinUrl}" 
               style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(220, 53, 69, 0.4);">
              🎥 Join Zoom Class Now
            </a>
          </div>
        ` : `
          <p style="text-align: center; color: #6b7280;">Zoom link will be available soon</p>
        `}

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">
            📱 You can also join from your <a href="${frontend}/dashboard" style="color: #667eea;">dashboard</a>
          </p>
        </div>
      </div>
      
      <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
        <p>This is an automated reminder from Online Learning Platform</p>
      </div>
    </div>
  `;
  return { subject, html };
};

module.exports = { adminNewSignupTemplate, userApprovedTemplate, classReminderTemplate };
