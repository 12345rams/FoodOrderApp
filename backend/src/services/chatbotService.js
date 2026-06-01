import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { createOrderFromSession } from './orderService.js';

function buildMainMenu(businessName) {
  return `Welcome to ${businessName}!\nPlease choose an option:\n1. View Menu\n2. Track Order\n3. Talk to Support`;
}

function buildCategoryMenu() {
  return `What would you like to explore?\n1. Veg\n2. Non-Veg\n3. All Items`;
}

function productsList(products, category = 'All') {
  let filtered = products;
  if (category === 'Veg') {
    filtered = products.filter(p => p.category?.toLowerCase() === 'veg');
  } else if (category === 'Non-Veg') {
    filtered = products.filter(p => p.category?.toLowerCase() === 'non-veg');
  }
  
  if (!filtered.length) {
    return `No ${category !== 'All' ? category + ' ' : ''}products available right now. Reply "menu" to go back.`;
  }
  const lines = filtered.map((p, i) => `${i + 1}. ${p.name} - Rs ${p.price}`);
  return `Here is our ${category} menu:\n\n${lines.join('\n')}\n\nWhat would you like to order? (Example: "I want 2 ${filtered[0]?.name} and 1 Coke")`;
}

function cleanState(session) {
  session.selectedItems = [];
  session.address = '';
  session.lastIntent = '';
  session.selectedCategory = '';
}

export async function processChat({ business, customer, session, message, intentData }) {
  const text = (message || '').trim();
  const lower = text.toLowerCase();
  const products = await Product.find({ businessId: business._id, isActive: true }).sort({ createdAt: -1 });

  if (!business.chatbotEnabled) {
    return { reply: '', shouldReply: false, session };
  }

  if (session.isHumanSupport) {
    if (lower === 'menu' || lower === 'start') {
      session.isHumanSupport = false;
      session.currentState = 'MAIN_MENU';
      return { reply: buildMainMenu(business.businessName), shouldReply: true, session };
    }
    return {
      reply: 'A support agent will reply shortly. Reply "menu" anytime to return to the bot.',
      shouldReply: true,
      session
    };
  }

  if (intentData.intent === 'TALK_TO_SUPPORT' || lower === '3') {
    session.currentState = 'HUMAN_SUPPORT';
    session.isHumanSupport = true;
    return {
      reply: 'Support mode enabled. Our team has been notified and will respond soon.',
      shouldReply: true,
      session
    };
  }

  if (session.currentState === 'START' || lower === 'hi' || lower === 'hello' || lower === 'start') {
    session.currentState = 'MAIN_MENU';
    return { reply: buildMainMenu(business.businessName), shouldReply: true, session };
  }

  if (intentData.intent === 'VIEW_PRODUCTS' || lower === '1') {
    session.currentState = 'WAITING_CATEGORY_SELECTION';
    return { reply: buildCategoryMenu(), shouldReply: true, session };
  }
  
  if (session.currentState === 'WAITING_CATEGORY_SELECTION') {
    let category = 'All';
    if (lower.includes('veg') && !lower.includes('non')) category = 'Veg';
    else if (lower.includes('non') || lower === '2') category = 'Non-Veg';
    else if (lower === '1') category = 'Veg';
    
    session.selectedCategory = category;
    session.currentState = 'WAITING_ORDER';
    return { reply: productsList(products, category), shouldReply: true, session };
  }

  if (intentData.intent === 'TRACK_ORDER' || lower === '2' && session.currentState === 'MAIN_MENU') {
    const lastOrder = await Order.findOne({ businessId: business._id, customerId: customer._id }).sort({ createdAt: -1 });
    if (!lastOrder) {
      return { reply: 'No order found for this number. Reply 1 to view menu.', shouldReply: true, session };
    }
    return {
      reply: `Your last order ${lastOrder._id.toString().slice(-6).toUpperCase()} is currently ${lastOrder.status}.\nTotal: Rs ${lastOrder.totalAmount}.\nReply 1 to see the menu again or 3 to contact support.`,
      shouldReply: true,
      session
    };
  }

  if (session.currentState === 'WAITING_ORDER' || intentData.intent === 'ORDER_PRODUCT' || intentData.intent === 'OUT_OF_STOCK') {
    if (intentData.intent === 'OUT_OF_STOCK') {
      return { reply: intentData.reply || 'Some items you requested are out of stock. Please adjust your order.', shouldReply: true, session };
    }
    
    if (intentData.items && intentData.items.length > 0) {
      const selectedItems = [];
      let totalAmount = 0;
      let orderSummary = '';
      
      for (const reqItem of intentData.items) {
        const product = products.find(p => p.name.toLowerCase() === (reqItem.productName || '').toLowerCase() || p.name.toLowerCase().includes((reqItem.productName || '').toLowerCase()));
        
        if (product) {
          const qty = Number(reqItem.quantity || 1);
          selectedItems.push({
            productId: product._id,
            productName: product.name,
            quantity: qty,
            price: product.price
          });
          totalAmount += qty * product.price;
          orderSummary += `${qty}x ${product.name} - Rs ${qty * product.price}\n`;
        }
      }
      
      if (selectedItems.length === 0) {
        return { reply: 'Could not match your items to our menu. Please try ordering again.', shouldReply: true, session };
      }
      
      session.selectedItems = selectedItems;
      session.currentState = 'WAITING_ADDRESS';
      
      return { reply: `Got it!\n${orderSummary}\nTotal: Rs ${totalAmount}\n\nPlease share your full delivery address.`, shouldReply: true, session };
    }
    
    // Fallback if AI fails to extract items
    return { reply: 'Please specify the items and quantity you want to order (e.g., "I want 2 Veg Pizzas").', shouldReply: true, session };
  }

  if (session.currentState === 'WAITING_ADDRESS' || intentData.intent === 'PROVIDE_ADDRESS') {
    const address = intentData.address || text;
    if (!address || address.length < 5) {
      return { reply: 'Please share a complete delivery address.', shouldReply: true, session };
    }

    session.address = address;
    session.currentState = 'WAITING_CONFIRMATION';

    const total = (session.selectedItems || []).reduce((sum, item) => sum + (item.quantity * item.price), 0);

    return {
      reply: `Perfect. Delivery address saved: ${session.address}\nTotal Order Amount: Rs ${total}\n\nPlease confirm:\n1. Confirm Order\n2. Cancel`,
      shouldReply: true,
      session
    };
  }

  if (session.currentState === 'WAITING_CONFIRMATION') {
    if (intentData.intent === 'CONFIRM_ORDER' || lower === '1' || lower.includes('confirm')) {
      try {
        const order = await createOrderFromSession({ businessId: business._id, customer, session });
        session.currentState = 'ORDER_PLACED';
        cleanState(session);
        return {
          reply: `Thank you! Your order has been placed successfully.\nOrder ID: ${order._id.toString().slice(-6).toUpperCase()}\nWe will send a delivery update shortly. Reply 1 to view menu again or 3 to chat with support.`,
          shouldReply: true,
          session
        };
      } catch (e) {
        return { reply: `Order failed: ${e.message}. Please try again.`, shouldReply: true, session };
      }
    }

    if (intentData.intent === 'CANCEL_ORDER' || lower === '2' || lower.includes('cancel')) {
      session.currentState = 'MAIN_MENU';
      cleanState(session);
      return { reply: 'Order cancelled. Reply 1 to view menu again.', shouldReply: true, session };
    }

    return { reply: 'Please reply 1 to confirm or 2 to cancel.', shouldReply: true, session };
  }

  return {
    reply: intentData.reply || buildMainMenu(business.businessName),
    shouldReply: true,
    session
  };
}
