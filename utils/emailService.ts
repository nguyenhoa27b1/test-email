
// This file configures and sends emails using the EmailJS service.
// These should be replaced with your actual EmailJS credentials.
// You can get them for free from your EmailJS account dashboard: https://www.emailjs.com/
const SERVICE_ID = 'YOUR_SERVICE_ID';
const TEMPLATE_ID = 'YOUR_TEMPLATE_ID'; // This template should accept {{subject}}, {{body}}, and {{to_name}} variables.
const PUBLIC_KEY = 'YOUR_PUBLIC_KEY';

interface ReminderEmailParams {
  to_name: string;
  to_email: string;
  subject: string;
  body: string;
}

/**
 * Sends an email using the EmailJS service.
 * @param params - The email parameters including recipient, subject, and body.
 */
export const sendReminderEmail = async (params: ReminderEmailParams): Promise<void> => {
  const emailjs = (window as any).emailjs;
  if (!emailjs) {
    console.error('EmailJS script not loaded. Cannot send email.');
    return;
  }
  
  // Check if the credentials are still placeholders.
  if (SERVICE_ID === 'YOUR_SERVICE_ID' || TEMPLATE_ID === 'YOUR_TEMPLATE_ID' || PUBLIC_KEY === 'YOUR_PUBLIC_KEY') {
    console.warn(
      `%cEmailJS is not configured. A real email will not be sent.`,
      'color: orange; font-weight: bold;'
    );
    console.warn(
      `To enable emails, sign up at https://www.emailjs.com/, create a template, and fill in your credentials in 'utils/emailService.ts'.`
    );
    console.log('Simulating email send with params:', params);
    return;
  }

  // Initialize EmailJS with the Public Key
  emailjs.init({ publicKey: PUBLIC_KEY });
  
  try {
    await emailjs.send(SERVICE_ID, TEMPLATE_ID, params);
    console.log(`SUCCESS! Email reminder sent to ${params.to_email}`);
  } catch (error) {
    console.error('FAILED to send email reminder via EmailJS:', error);
  }
};
