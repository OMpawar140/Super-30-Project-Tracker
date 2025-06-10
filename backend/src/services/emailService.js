
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // Initialize the transporter
    this.transporter = nodemailer.createTransport({
    //   // For Gmail (recommended for production)
    //   service: 'gmail',
    //   auth: {
    //     user: process.env.EMAIL_USER, // Your email
    //     pass: process.env.EMAIL_APP_PASSWORD // App-specific password, not your regular password
    //   }
      
      // Alternative: For other SMTP providers
      host: "students.coredecimal.com",
      port: 465,
      secure: true,
      auth: {
        user: "otp@students.coredecimal.com",
        pass: "JwalaKranti@2025"
      }
    });
  }

  // Method to create project welcome email HTML
  createProjectWelcomeEmail(projectName, projectId, memberRole, inviterName) {
    return `
    <!DOCTYPE html>
    <html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
    <head>
      <title>Welcome to ${projectName}</title>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet" type="text/css">
      <style>
        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; font-family: 'Inter', Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; background-color: #f8f9fa; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 700; }
        .content { background: white; padding: 40px 20px; }
        .welcome-box { background: #f8f9ff; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; }
        .project-info { background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .button { 
          display: inline-block; 
          background: #667eea; 
          color: white; 
          padding: 12px 30px; 
          text-decoration: none; 
          border-radius: 6px; 
          font-weight: 600;
          margin: 20px 0;
        }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Welcome to the Project!</h1>
        </div>
        
        <div class="content">
          <div class="welcome-box">
            <h2>You've been added to a new project!</h2>
            <p>Hello! You've been invited to join an exciting new project. We're thrilled to have you on board!</p>
          </div>
          
          <div class="project-info">
            <h3>📋 Project Details</h3>
            <p><strong>Project Name:</strong> ${projectName}</p>
            <p><strong>Your Role:</strong> ${memberRole}</p>
            <p><strong>Invited by:</strong> ${inviterName}</p>
            <p><strong>Project ID:</strong> ${projectId}</p>
          </div>
          
          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/projects/${projectId}" class="button">
              View Project Dashboard →
            </a>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <h3>🚀 Getting Started</h3>
            <ul>
              <li>Log in to your account to access the project</li>
              <li>Review project details and timeline</li>
              <li>Connect with your team members</li>
              <li>Start collaborating on tasks</li>
            </ul>
          </div>
          
          <div style="margin-top: 30px; padding: 15px; background: #fff3cd; border-radius: 6px;">
            <p><strong>Need Help?</strong> If you have any questions or need assistance getting started, don't hesitate to reach out to your project team or contact support.</p>
          </div>
        </div>
        
        <div class="footer">
          <p>This email was sent because you were added to a project. If you believe this was sent in error, please contact support.</p>
          <p>&copy; ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  // Method to send project welcome email
  async sendProjectWelcomeEmail(memberEmail, projectName, projectId, memberRole, inviterName, inviterEmail) {
    try {
      const htmlContent = this.createProjectWelcomeEmail(projectName, projectId, memberRole, inviterName);
      
      const mailOptions = {
        from: {
          name: 'Your Project Management System', 
          address: process.env.EMAIL_USER
        },
        to: memberEmail,
        subject: `Welcome to ${projectName} - You've been added as ${memberRole}`,
        html: htmlContent,
        // Optional: Add plain text version for better deliverability
        text: `Hello! You've been invited to join the project "${projectName}" as ${memberRole} by ${inviterName}. 
               
Project ID: ${projectId}
Your Role: ${memberRole}
Invited by: ${inviterName}

Visit ${process.env.FRONTEND_URL}/projects/${projectId} to get started.

If you have any questions, please don't hesitate to reach out.

Best regards,
Your Project Management Team`
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Project welcome email sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending project welcome email:', error);
      throw new Error(`Failed to send welcome email: ${error.message}`);
    }
  }

  // Method to send bulk emails to multiple members
  async sendBulkProjectWelcomeEmails(members, projectName, projectId, inviterName, inviterEmail) {
    const results = [];
    
    for (const member of members) {
      try {
        const result = await this.sendProjectWelcomeEmail(
          member.email, 
          projectName, 
          projectId, 
          member.role, 
          inviterName, 
          inviterEmail
        );
        results.push({ 
          email: member.email, 
          success: true, 
          messageId: result.messageId 
        });
      } catch (error) {
        results.push({ 
          email: member.email, 
          success: false, 
          error: error.message 
        });
      }
    }
    
    return results;
  }

  // Method to verify email transporter configuration
  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('Email transporter is ready to send emails');
      return true;
    } catch (error) {
      console.error('Email transporter verification failed:', error);
      return false;
    }
  }
}

module.exports = new EmailService();