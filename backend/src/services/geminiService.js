import axios from 'axios';
import { parseGeminiJson } from '../utils/intentParser.js';

export async function detectIntent({ message, business, products, currentState, knowledgeContext = [] }) {
  const apiKey = business?.geminiApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('Gemini detectIntent skipped: no Gemini API key configured (neither business-specific nor default)', { businessId: business?._id });
    return { intent: 'UNKNOWN', items: [], address: '', reply: '' };
  }

  const productList = products.slice(0, 30).map((p) => ({ name: p.name, price: p.price, stock: p.stock }));
  const knowledgeList = knowledgeContext.slice(0, 5).map((k) => ({
    title: k.title,
    content: k.content,
    tags: k.tags || []
  }));
  const prompt = `You are an AI order assistant and intent extractor for a WhatsApp ordering bot.
Return ONLY JSON in this exact format:
{"intent":"VIEW_PRODUCTS|ORDER_PRODUCT|PROVIDE_QUANTITY|PROVIDE_ADDRESS|CONFIRM_ORDER|CANCEL_ORDER|TRACK_ORDER|TALK_TO_SUPPORT|OUT_OF_STOCK|UNKNOWN", "items": [{"productName":"", "quantity":null}], "address":"", "reply":""}

CRITICAL RULES:
1. If the user wants to order products, extract ALL products they mentioned into the 'items' array.
2. STOCK VALIDATION: Check the requested quantity for each item against the 'stock' property in the Products list. If the user requests MORE than the available stock for ANY item, set intent to "OUT_OF_STOCK" and write a friendly 'reply' explaining which items are out of stock and how many are actually available.
3. If they just say "hi" or want to see the menu, intent is VIEW_PRODUCTS.
4. If they just provide an address, intent is PROVIDE_ADDRESS.

Business: ${business.businessName}
CurrentState: ${currentState}
Products: ${JSON.stringify(productList)}
KnowledgeBase: ${JSON.stringify(knowledgeList)}
UserMessage: ${message}`;

  try {
    const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
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
    return { intent: 'UNKNOWN', items: [], address: '', reply: '' };
  }
}

export async function detectAggregatorIntent(body, geminiApiKey = null) {
  try {
    const key = geminiApiKey || process.env.GEMINI_API_KEY;
    if (!key) return { sort: 'distance' };
    
    // We can use native fetch or axios. Since axios is imported:
    const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
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
    const data = JSON.parse(cleanText);
    return data;
  } catch (err) {
    console.error('Gemini detectAggregatorIntent error:', err?.response?.data || err.message);
    return { sort: 'distance' };
  }
}
