//Nhận và xác minh token được gửi từ FrontEnd
const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const cors = require('cors');
require('dotenv').config(); // Load environment variables from .env file

const { sendTaskChangeNotification } = require('./utils/emailService');

const app = express();
app.use(express.json()); // Middleware to parse JSON bodies
app.use(cors()); // Middleware to enable CORS for requests from the frontend

// This must be the same Google Client ID used on your frontend.
const GOOGLE_CLIENT_ID = '148328673757-i77a42b4dh0qf7dg2cu6lo0kvk4a5h3g.apps.googleusercontent.com';

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// Mock user data for email lookup. In a real app, this would come from a database.
const MOCK_USERS = [
  { id: 'user-1', name: 'Alex Ray', email: 'alex@example.com' },
  { id: 'user-2', name: 'Jordan Lee', email: 'jordan@example.com' },
  { id: 'user-3', name: 'Taylor Kim', email: 'taylor@example.com' },
  { id: 'user-4', name: 'Casey Morgan', email: 'casey@example.com' },
  { id: 'user-5', name: 'Sam Viewer', email: 'sam@example.com' },
];


/**
 * Verifies the Google ID token and returns the user payload.
 * @param {string} token - The Google ID token from the frontend.
 * @returns {Promise<object|null>} The user payload if verification is successful, otherwise null.
 */
async function verifyGoogleToken(token) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    return payload;
  } catch (error) {
    console.error('Error verifying Google ID token:', error);
    return null;
  }
}

// API endpoint for validating the Google token
app.post('/api/auth/google', async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'ID token not provided.' });
  }

  const payload = await verifyGoogleToken(token);

  if (!payload) {
    return res.status(401).json({ message: 'Invalid ID token. Authentication failed.' });
  }

  // At this point, the user's identity is verified.
  // You would typically find this user in your database via their email (payload.email)
  // or create a new user account if they don't exist.
  // After that, you would generate your own application-specific session token or JWT for them.

  console.log('Successfully verified user payload:', payload);

  res.status(200).json({
    message: 'Authentication successful!',
    user: {
      name: payload.name,
      email: payload.email,
      picture: payload.picture,
      googleId: payload.sub, // The user's unique Google ID
    },
  });
});

// API endpoint for sending task change notifications
app.post('/api/notifications/task-change', async (req, res) => {
    const { task, recipientId, action } = req.body;

    if (!task || !recipientId || !action) {
        return res.status(400).json({ message: 'Task data, recipientId, and action are required.' });
    }

    // Mock function to find user email by ID from our mock user data
    const recipient = MOCK_USERS.find(user => user.id === recipientId);

    if (!recipient) {
        return res.status(404).json({ message: 'Recipient not found.' });
    }

    try {
        // Use the email service to send the notification
        await sendTaskChangeNotification(task, action, recipient.email);
        res.status(200).json({ message: `Notification sent successfully to ${recipient.email}` });
    } catch (error) {
        console.error('Failed to send notification email:', error);
        res.status(500).json({ message: 'Failed to send notification email.' });
    }
});


const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`To test, send a POST request to http://localhost:${PORT}/api/auth/google`);
  console.log('Request body should be: { "token": "YOUR_GOOGLE_ID_TOKEN" }');
});
