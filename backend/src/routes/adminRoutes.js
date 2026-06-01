import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { fail, ok } from '../utils/responseFormatter.js';
import AggregatorSettings from '../models/AggregatorSettings.js';
import twilio from 'twilio';

const router = express.Router();

// Middleware to ensure user is admin
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return fail(res, 'Not authorized as an admin', 403);
  }
};

router.post('/send-template', protect, adminOnly, async (req, res, next) => {
  try {
    const { to, contentSid, contentVariables } = req.body;

    if (!to || !contentSid) {
      return fail(res, 'Missing required fields: to, contentSid');
    }

    // Try to get AggregatorSettings (the master bot credentials)
    let settings = await AggregatorSettings.findOne();
    
    // Fallback hardcoded credentials from your cURL command if not found in DB
    const accountSid = settings?.twilioAccountSid || process.env.TWILIO_ACCOUNT_SID;
    // NOTE: The user's cURL command masked the AuthToken as [AuthToken]. 
    // We must rely on AggregatorSettings or process.env if available, otherwise this will fail.
    const authToken = settings?.twilioAuthToken || process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = settings?.twilioWhatsappNumber || 'whatsapp:+14155238886';

    if (!authToken) {
      return fail(res, 'Twilio Auth Token is not configured. Please add it to AggregatorSettings.');
    }

    const client = twilio(accountSid, authToken);

    const messageParams = {
      from: fromNumber,
      to: `whatsapp:${to.replace('whatsapp:', '')}`, // Ensure format is whatsapp:+...
      contentSid: contentSid
    };

    if (contentVariables) {
      // Parse contentVariables if it's sent as a string from frontend
      messageParams.contentVariables = typeof contentVariables === 'string' ? contentVariables : JSON.stringify(contentVariables);
    }

    const message = await client.messages.create(messageParams);
    
    return ok(res, { sid: message.sid }, 'Template sent successfully');
  } catch (error) {
    console.error('Admin send-template error:', error);
    return fail(res, error.message || 'Failed to send template', 500);
  }
});

export default router;
