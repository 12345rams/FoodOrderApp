import axios from 'axios';
import { parseGeminiJson } from '../utils/intentParser.js';

export async function detectIntent({ message, history = [], business, products, session }) {
  const apiKey = business?.geminiApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('Gemini detectIntent skipped: no API key configured');
    return { reply: 'AI is currently unavailable.', items: [], address: '', status: 'CHATTING' };
  }

  const productList = products.map(p => `- ${p.name}: Rs ${p.price} (Stock: ${p.stock})`).join('\n');
  const historyText = history.map(m => `${m.direction === 'incoming' ? 'Customer' : 'Waiter'}: ${m.body}`).join('\n');

  // We feed the existing items and address from the session to the AI so it doesn't forget them
  const currentCart = session.selectedItems && session.selectedItems.length > 0 
    ? JSON.stringify(session.selectedItems.map(i => ({ productName: i.productName, quantity: i.quantity, price: i.price }))) 
    : "[]";

  const prompt = `You are a friendly, conversational hotel waiter taking a food order for "${business.businessName}". 
You speak naturally, politely, and smoothly like a real human waiter via WhatsApp.
Answer questions about the menu. Help the customer decide. 
As the customer orders items, keep track of them in your "items" array.
The customer might share a WhatsApp map pin which will appear as [Location Pin Shared: Lat X, Lng Y].
When they seem done ordering, politely ask them exactly this: "Share me your location" (or very similar phrasing).
Once they provide the delivery address (or map pin) AND confirm the total order, finalize it.

Menu & Stock:
${productList}

Current Cart from Database:
${currentCart}

Current Address from Database:
${session.address || "None provided yet"}

Conversation History:
${historyText}
Customer: ${message}

Return ONLY a JSON object in this EXACT format, NO markdown:
{
  "reply": "Your conversational reply to the customer.",
  "items": [{"productName": "Exact Name", "quantity": 1, "price": 100}],
  "address": "Any delivery address or map coordinates they provided so far",
  "status": "CHATTING|CONFIRMED|HUMAN_SUPPORT"
}

RULES:
1. "items" MUST be the FULL CURRENT CART (all items ordered so far). If they add an item, include the previous ones too. Use exact product names and prices from the Menu.
2. If an item is out of stock or they request more than the stock, apologize in the 'reply' and DO NOT add it to the 'items'.
3. "status" should be "CHATTING" normally.
4. If they want to talk to a human, set "status" to "HUMAN_SUPPORT".
5. If they have confirmed everything AND provided an address, set "status" to "CONFIRMED".`;

  try {
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.1 }
    };

    const response = await axios.post(url, payload, {
      headers: { 'Content-Type': 'application/json' }
    });

    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return parseGeminiJson(text);
  } catch (error) {
    console.error('Gemini detectIntent error:', error?.response?.data || error.message || error);
    return { reply: 'Sorry, I am having trouble understanding right now.', items: [], address: '', status: 'CHATTING' };
  }
}

export async function detectAggregatorIntent(body, geminiApiKey = null) {
  try {
    const key = geminiApiKey || process.env.GEMINI_API_KEY;
    if (!key) return { sort: 'distance' };
    
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
    const prompt = `You are an AI for a hotel/restaurant aggregator app.
The user just provided this prompt to search for places: "${body}"
Determine how they want the results sorted. Your ONLY options are: "price", "rating", or "distance".
Return ONLY a JSON object: { "sort": "price" } or "rating" or "distance". DO NOT return markdown.`;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.1 }
    };

    const response = await axios.post(url, payload, {
      headers: { 'Content-Type': 'application/json' }
    });

    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleanText = text.trim().replace(/```json/g, '').replace(/```/g, '');
    return JSON.parse(cleanText);
  } catch (err) {
    console.error('Gemini detectAggregatorIntent error:', err?.response?.data || err.message);
    return { sort: 'distance' };
  }
}
