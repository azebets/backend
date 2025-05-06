
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail', // Use your email provider (e.g., Gmail, Outlook, etc.)
  auth: {
    user: 'valiantcodez@gmail.com',
    pass: 'diwm dqjt dmnu atss'
  },
});

const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: '"Azabets Casino" valiantcodez@gmail.com', // Replace with your email
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = sendEmail;