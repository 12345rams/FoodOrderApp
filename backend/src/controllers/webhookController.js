import ChatSession from '../models/ChatSession.js';
import Business from '../models/Business.js';
import Customer from '../models/Customer.js';
import Message from '../models/Message.js';
import Product from '../models/Product.js';
import KnowledgeItem from '../models/KnowledgeItem.js';
import { processChat } from '../services/chatbotService.js';
import { detectIntent } from '../services/geminiService.js';
import { sendWhatsAppMessage, validateTwilioSignature } from '../services/twilioService.js';
import { normalizeWhatsAppNumber } from '../utils/normalize.js';

function textBody(v) {
  if (typeof v === 'string') return v;
  return '';
}

function selectKnowledgeContext(message, knowledgeItems) {
  const text = (message || '').toLowerCase();
  if (!text) return knowledgeItems.slice(0, 3);

  const words = new Set(text.split(/\W+/).filter((w) => w.length > 2));
  const scored = knowledgeItems
    .map((item) => {
      const pool = `${item.title} ${item.content} ${(item.tags || []).join(' ')}`.toLowerCase();
      let score = 0;
      words.forEach((w) => {
        if (pool.includes(w)) score += 1;
      });
      return { item, score };
    })
    .sort((a, b) => b.score - a.score)
    .filter((entry) => entry.score > 0)
    .map((entry) => entry.item);

  return (scored.length ? scored : knowledgeItems).slice(0, 5);
}

export async function twilioWhatsAppWebhook(req, res, next) {
  try {
    console.log('Twilio webhook payload:', JSON.stringify(req.body, null, 2));

    const fromRaw = req.body.From || req.body.from || '';
    const toRaw = req.body.To || req.body.to || '';
    const body = textBody(req.body.Body || req.body.body).trim();
    const messageSid = req.body.MessageSid || req.body.messageSid || null;
    const profileName = req.body.ProfileName || req.body.profileName || 'Customer';

    console.log(`Incoming WhatsApp message: from=${fromRaw} to=${toRaw} sid=${messageSid} profile=${profileName} body=${body}`);

    if (!fromRaw || !toRaw) {
      return res.status(400).send('Missing From/To');
    }

    const incomingTo = normalizeWhatsAppNumber(toRaw);
    const business = await Business.findOne({
      $or: [
        { twilioWhatsappNumber: incomingTo },
        { twilioWhatsappNumber: `whatsapp:${incomingTo}` },
        { whatsappNumber: incomingTo }
      ]
    });

    if (!business) {
      console.log('Webhook error: business not configured for incoming number', { incomingTo });
      return res.status(200).send('Business not configured for this number');
    }

    if (!business.twilioWhatsappNumber) {
      console.log('Webhook error: business Twilio WhatsApp sender not configured', { businessId: business._id });
      return res.status(500).send('Business WhatsApp sender not configured');
    }

    const authToken = business.twilioAuthToken;
    if (!validateTwilioSignature(req, authToken)) {
      console.log('Webhook error: invalid Twilio signature', { businessId: business._id, incomingTo, fromRaw });
      return res.status(403).send('Invalid signature');
    }

    const customerNumber = normalizeWhatsAppNumber(fromRaw);
    const from = `whatsapp:${customerNumber}`;

    let customer = await Customer.findOne({ businessId: business._id, whatsappNumber: from });
    if (!customer) {
      customer = await Customer.create({
        businessId: business._id,
        whatsappNumber: from,
        name: profileName
      });
    }

    await Message.create({
      businessId: business._id,
      customerId: customer._id,
      from,
      to: `whatsapp:${incomingTo}`,
      body: body || '(empty)',
      direction: 'incoming',
      messageSid
    });

    let session = await ChatSession.findOne({ businessId: business._id, customerId: customer._id });
    if (!session) {
      session = await ChatSession.create({
        businessId: business._id,
        customerId: customer._id,
        whatsappNumber: from,
        currentState: 'START',
        lastMessage: body || '',
        lastIntent: 'UNKNOWN',
        isHumanSupport: false
      });
    } else if (!session.whatsappNumber) {
      session.whatsappNumber = from;
    }

    const products = await Product.find({ businessId: business._id, isActive: true }).lean();
    const knowledgeItems = await KnowledgeItem.find({ businessId: business._id, isActive: true }).lean();
    const knowledgeContext = selectKnowledgeContext(body, knowledgeItems);
    const intentData = await detectIntent({
      message: body,
      business,
      products,
      currentState: session.currentState,
      knowledgeContext
    });

    session.lastMessage = body;
    session.lastIntent = intentData.intent;

    const result = await processChat({
      business,
      customer,
      session,
      message: body,
      intentData
    });

    console.log('webhook processChat result:', {
      shouldReply: result.shouldReply,
      reply: result.reply,
      currentState: session.currentState,
      lastIntent: session.lastIntent
    });

    await session.save();

    if (result.shouldReply && result.reply) {
      console.log('webhook sending reply:', { to: from, body: result.reply });
      const sent = await sendWhatsAppMessage({ business, to: from, body: result.reply });
      await Message.create({
        businessId: business._id,
        customerId: customer._id,
        from: business.twilioWhatsappNumber,
        to: from,
        body: result.reply,
        direction: 'outgoing',
        messageSid: sent.sid
      });
    }

    return res.status(200).send('OK');
  } catch (error) {
    console.error('webhook error:', error);
    return next(error);
  }
}

