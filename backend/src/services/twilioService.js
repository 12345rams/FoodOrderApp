import twilio from 'twilio';
import { normalizeWhatsAppNumber, toWhatsAppNumber } from '../utils/normalize.js';

function createClient(accountSid, authToken) {
  return twilio(accountSid, authToken);
}

function getBusinessCredentials(business) {
  return {
    accountSid: business?.twilioAccountSid || process.env.DEFAULT_TWILIO_ACCOUNT_SID,
    authToken: business?.twilioAuthToken || process.env.DEFAULT_TWILIO_AUTH_TOKEN,
    fromNumber: business?.twilioWhatsappNumber || process.env.DEFAULT_TWILIO_WHATSAPP_NUMBER
  };
}

export async function sendWhatsAppMessage({ business, to, body, contentSid, contentVariables }) {
  if (process.env.SIMULATE_TWILIO === 'true') {
    const fromNumber = business?.twilioWhatsappNumber;
    if (!fromNumber) {
      throw new Error('Twilio sender number is not configured for this business');
    }
    return {
      sid: `SIM-${Date.now()}`,
      from: fromNumber,
      to: toWhatsAppNumber(normalizeWhatsAppNumber(to)),
      body: body || '',
      contentSid: contentSid || null
    };
  }

  const { accountSid, authToken, fromNumber } = getBusinessCredentials(business);
  if (!accountSid || !authToken || !fromNumber) {
    throw new Error('Twilio credentials are not configured for this business or default settings');
  }

  const client = createClient(accountSid, authToken);
  const payload = {
    from: toWhatsAppNumber(fromNumber),
    to: toWhatsAppNumber(normalizeWhatsAppNumber(to))
  };
  console.log('Twilio send payload:', {
    from: payload.from,
    to: payload.to,
    body: body || undefined,
    contentSid: contentSid || undefined,
    contentVariables: contentVariables || undefined,
    usingBusinessCredentials: Boolean(business?.twilioAccountSid)
  });

  if (contentSid) {
    payload.contentSid = contentSid;
    if (contentVariables) {
      payload.contentVariables =
        typeof contentVariables === 'string' ? contentVariables : JSON.stringify(contentVariables);
    }
  } else {
    payload.body = body;
  }

  try {
    return await client.messages.create(payload);
  } catch (error) {
    console.error('Twilio send error:', {
      errorMessage: error.message,
      code: error.code,
      status: error.status,
      payload
    });
    throw error;
  }
}

export function validateTwilioSignature(req, authToken) {
  if (process.env.TWILIO_VALIDATE_SIGNATURE !== 'true') {
    return true;
  }
  const signature = req.headers['x-twilio-signature'];
  if (!signature || !authToken) {
    return false;
  }
  const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
  return twilio.validateRequest(authToken, signature, fullUrl, req.body);
}

