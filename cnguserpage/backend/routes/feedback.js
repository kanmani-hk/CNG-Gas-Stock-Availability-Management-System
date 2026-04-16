import express from 'express';
import Feedback from '../models/Feedback.js';
import { sendEmail } from '../config/email.js';

const router = express.Router();

// Submit feedback
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const newFeedback = new Feedback({
      name,
      email: email.toLowerCase(),
      subject,
      message,
    });

    await newFeedback.save();

    // Send Thank you email to user
    await sendEmail({
      to: email,
      subject: 'Thank you for your feedback - CNG Bunk Finder',
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #14b8a6;">Feedback Received!</h2>
          <p>Hi ${name},</p>
          <p>Thank you for reaching out to us. We have received your feedback regarding <strong>${subject}</strong>.</p>
          <p>Our team will review your message and get back to you if necessary.</p>
          <br/>
          <p>Best regards,<br/>CNG Bunk Finder Team</p>
        </div>
      `
    });

    // Send Notification email to Super Admin
    // Using process.env.EMAIL_USER as a fallback for admin email
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    if (adminEmail) {
      await sendEmail({
        to: adminEmail,
        subject: `New Feedback: ${subject}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #14b8a6;">New User Feedback</h2>
            <p><strong>From:</strong> ${name} (${email})</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <div style="background: #f4f4f4; padding: 15px; border-radius: 5px;">
              ${message.replace(/\n/g, '<br/>')}
            </div>
          </div>
        `
      });
    }

    res.status(201).json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('Feedback error:', error);
    res.status(500).json({ error: 'Server error during feedback submission' });
  }
});

export default router;
