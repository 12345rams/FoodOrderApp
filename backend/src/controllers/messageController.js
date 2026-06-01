import Business from '../models/Business.js';
import ChatSession from '../models/ChatSession.js';
import Customer from '../models/Customer.js';
import Message from '../models/Message.js';
import { sendWhatsAppMessage } from '../services/twilioService.js';
import { fail, ok } from '../utils/responseFormatter.js';
import { normalizeWhatsAppNumber, toWhatsAppNumber } from '../utils/normalize.js';

async function businessForUser(user) {
  const business = await Business.findOne({ ownerId: user._id });
  console.log('businessForUser: business lookup result', { userId: user._id, businessId: business?._id });
  return business;
}

export async function listMessagesByCustomer(req, res, next) {
  try {
    const business = await businessForUser(req.user);
    if (!business) return fail(res, 'Business profile not found', 404);

    const customer = await Customer.findOne({ _id: req.params.customerId, businessId: business._id });
    if (!customer) return fail(res, 'Customer not found', 404);

    const messages = await Message.find({ businessId: business._id, customerId: customer._id }).sort({ createdAt: 1 });
    return ok(res, messages);
  } catch (error) {
    console.error('listMessagesByCustomer error:', error);
    return next(error);
  }
}

export async function manualReply(req, res, next) {
  try {
    const business = await businessForUser(req.user);
    if (!business) return fail(res, 'Business profile not found', 404);

    const customer = await Customer.findOne({ _id: req.params.customerId, businessId: business._id });
    if (!customer) return fail(res, 'Customer not found', 404);

    const { body, contentSid, contentVariables } = req.body;
    console.log('manualReply request:', {
      customerId: req.params.customerId,
      to: customer.whatsappNumber,
      body,
      contentSid,
      contentVariables
    });

    if ((!body || !String(body).trim()) && !contentSid) {
      return fail(res, 'body or contentSid is required');
    }

    const sent = await sendWhatsAppMessage({
      business,
      to: customer.whatsappNumber,
      body,
      contentSid,
      contentVariables
    });

    const messageBody = body || `[template:${contentSid}]`;

    const message = await Message.create({
      businessId: business._id,
      customerId: customer._id,
      from: business.twilioWhatsappNumber,
      to: customer.whatsappNumber,
      body: messageBody,
      direction: 'outgoing',
      messageSid: sent.sid
    });

    await ChatSession.updateOne(
      { businessId: business._id, customerId: customer._id },
      {
        $set: {
          whatsappNumber: customer.whatsappNumber,
          lastMessage: messageBody,
          currentState: 'HUMAN_SUPPORT',
          isHumanSupport: true,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );

    return ok(res, message, 'Message sent');
  } catch (error) {
    console.error('manualReply error:', error);
    return next(error);
  }
}

