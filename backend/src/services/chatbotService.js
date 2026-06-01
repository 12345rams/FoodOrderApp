import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Message from '../models/Message.js';
import { createOrderFromSession } from './orderService.js';
import { detectIntent } from './geminiService.js';

function cleanState(session) {
  session.selectedItems = [];
  session.address = '';
  session.currentState = 'START';
}

export async function processChat({ business, customer, session, message }) {
  const text = (message || '').trim();
  const lower = text.toLowerCase();
  const products = await Product.find({ businessId: business._id, isActive: true }).sort({ createdAt: -1 });

  if (!business.chatbotEnabled) {
    return { reply: '', shouldReply: false, session };
  }

  // Handle un-muting the bot if they were in human support
  if (session.isHumanSupport) {
    if (lower === 'menu' || lower === 'start' || lower === 'bot') {
      session.isHumanSupport = false;
      cleanState(session);
      return { 
        reply: `Hi! I'm the digital waiter for ${business.businessName}. I'm back! How can I help you today?`, 
        shouldReply: true, 
        session 
      };
    }
    return {
      reply: 'A support agent will reply shortly. Reply "bot" anytime to return to the AI.',
      shouldReply: true,
      session
    };
  }

  // Fetch conversation history
  const history = await Message.find({ businessId: business._id, customerId: customer._id })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();
  history.reverse(); // Chronological order

  // Call the new conversational Waiter AI
  const intentData = await detectIntent({ 
    message: text, 
    history, 
    business, 
    products, 
    session 
  });

  // Update session state from the AI's understanding
  if (intentData.items && Array.isArray(intentData.items)) {
    session.selectedItems = intentData.items.map(i => ({
      productName: i.productName,
      quantity: Number(i.quantity) || 1,
      price: Number(i.price) || 0
    }));
  }
  
  if (intentData.address) {
    session.address = intentData.address;
  }

  // Handle AI status transitions
  if (intentData.status === 'HUMAN_SUPPORT') {
    session.isHumanSupport = true;
    session.currentState = 'HUMAN_SUPPORT';
    return {
      reply: intentData.reply || 'Support mode enabled. Our team has been notified and will respond soon.',
      shouldReply: true,
      session
    };
  }

  if (intentData.status === 'CONFIRMED') {
    try {
      // Map the items to include ObjectIds for the Order schema
      const mappedItems = session.selectedItems.map(item => {
        const product = products.find(p => p.name.toLowerCase() === item.productName.toLowerCase());
        return {
          productId: product ? product._id : null,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price
        };
      }).filter(i => i.productId); // Ensure only valid items are ordered

      if (mappedItems.length === 0) {
         return {
           reply: "I'm sorry, I couldn't match your items to our menu. Let's try adjusting the order.",
           shouldReply: true,
           session
         };
      }

      session.selectedItems = mappedItems;

      const order = await createOrderFromSession({ businessId: business._id, customer, session });
      cleanState(session);
      return {
        reply: intentData.reply + `\n\n✅ Your order has been placed successfully!\nOrder ID: ${order._id.toString().slice(-6).toUpperCase()}`,
        shouldReply: true,
        session
      };
    } catch (e) {
      console.error('Order creation error:', e);
      return { reply: `I'm so sorry, there was a technical issue placing the order: ${e.message}. Please try again.`, shouldReply: true, session };
    }
  }

  // CHATTING state - just return the AI's conversational reply
  session.currentState = 'CHATTING';
  return {
    reply: intentData.reply || "I'm not sure I caught that. Could you repeat?",
    shouldReply: true,
    session
  };
}
