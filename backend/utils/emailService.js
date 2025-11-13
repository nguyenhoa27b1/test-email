// This file handles sending emails using Nodemailer.
// For this to work, you need to set up an email account that allows SMTP access.
// For Gmail, you'll need to create an "App Password".
// Then, create a .env file in the /backend directory with:
// EMAIL_USER=your-email@gmail.com
// EMAIL_PASSWORD=your-16-digit-app-password

const nodemailer = require('nodemailer');

// Create a transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can use other services like Outlook, etc.
  auth: {
    user: process.env.EMAIL_USER, // Your email address from .env file
    pass: process.env.EMAIL_PASSWORD, // Your email password or app password from .env file
  },
});

/**
 * Generates email content based on the action.
 * @param {object} task - The task object.
 * @param {string} action - The action performed (e.g., 'assigned', 'updated', 'completed').
 * @returns {{subject: string, html: string}} The email subject and HTML body.
 */
const generateEmailContent = (task, action) => {
  let subject = '';
  let htmlBody = '';

  switch (action.toLowerCase()) {
    case 'assigned':
      subject = `New Task Assigned: ${task.title}`;
      htmlBody = `
        <p>You have been assigned a new task:</p>
        <h2>${task.title}</h2>
        <p><strong>Description:</strong> ${task.description}</p>
        <p><strong>Deadline:</strong> ${new Date(task.deadline).toLocaleDateString()}</p>
        <p>Please log in to the dashboard to view details.</p>
      `;
      break;
    case 'updated':
      subject = `Task Updated: ${task.title}`;
      htmlBody = `
        <p>A task assigned to you has been updated:</p>
        <h2>${task.title}</h2>
        <p><strong>Description:</strong> ${task.description}</p>
        <p><strong>Deadline:</strong> ${new Date(task.deadline).toLocaleDateString()}</p>
        <p>Please log in to the dashboard to see the changes.</p>
      `;
      break;
    case 'completed':
        subject = `Task Completed: ${task.title}`;
        htmlBody = `
        <p>The following task has been marked as complete:</p>
        <h2>${task.title}</h2>
        <p>Great work!</p>
      `;
      break;
    default:
      subject = `Task Notification: ${task.title}`;
      htmlBody = `<p>There is a new notification regarding your task: "${task.title}". Please check the dashboard.</p>`;
  }

  return { subject, html: `<div style="font-family: sans-serif;">${htmlBody}</div>` };
};


/**
 * Sends a notification email about a task change.
 * @param {object} task - The task object.
 * @param {string} action - A string describing the change (e.g., 'assigned', 'updated').
 * @param {string} recipientEmail - The email address of the recipient.
 */
const sendTaskChangeNotification = async (task, action, recipientEmail) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn('Email credentials not found in .env file. Skipping email send.');
    console.log('--- SIMULATING EMAIL ---');
    console.log(`To: ${recipientEmail}, Action: ${action}, Task: ${task.title}`);
    console.log('------------------------');
    return;
  }
  
  const { subject, html } = generateEmailContent(task, action);

  const mailOptions = {
    from: `"Team Task Manager" <${process.env.EMAIL_USER}>`,
    to: recipientEmail,
    subject: subject,
    html: html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = { sendTaskChangeNotification };
