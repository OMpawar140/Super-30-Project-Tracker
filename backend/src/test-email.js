const emailService = require('./services/emailService');

async function testEmail() {
  try {
    // Verify connection
    const isConnected = await emailService.verifyConnection();
    console.log('Email connection:', isConnected ? 'SUCCESS' : 'FAILED');
    
    // Send test email
    if (isConnected) {
      await emailService.sendProjectWelcomeEmail(
        "om.pawar@mitaoe.ac.in"
      );
      console.log('Test email sent successfully!');
    }
  } catch (error) {
    console.error('Email test failed:', error);
  }
}

testEmail();