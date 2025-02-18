const nodemailer = require('nodemailer');

// Define the function to send the reset password email
const sendResetPasswordEmail = async (email, resetLink) => {
  try {
    // Create a transporter for sending the email
    const transporter = nodemailer.createTransport({
      service: 'gmail', // You can change this to your email service
      auth: {
        user: process.env.SMTP_MAIL,  // Your email address
        pass: process.env.SMTP_PASSWORD,  // Your email password
      },
    });

    // Set up the email data
    const mailOptions = {
      from: process.env.SMTP_MAIL,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetLink}">Reset Password</a>
      `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending reset password email:", error);
    throw new Error('Failed to send email');
  }
};

// Export the function
module.exports = { sendResetPasswordEmail };
