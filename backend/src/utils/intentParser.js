const ALLOWED_INTENTS = [
  'VIEW_PRODUCTS',
  'ORDER_PRODUCT',
  'PROVIDE_QUANTITY',
  'PROVIDE_ADDRESS',
  'CONFIRM_ORDER',
  'CANCEL_ORDER',
  'TRACK_ORDER',
  'TALK_TO_SUPPORT',
  'UNKNOWN'
];

export function parseGeminiJson(text = '') {
  try {
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error('No JSON object found');
    }
    const parsed = JSON.parse(text.slice(firstBrace, lastBrace + 1));
    return {
      intent: ALLOWED_INTENTS.includes(parsed.intent) ? parsed.intent : 'UNKNOWN',
      productName: parsed.productName || '',
      quantity: Number(parsed.quantity) || null,
      address: parsed.address || '',
      reply: parsed.reply || ''
    };
  } catch (error) {
    return {
      intent: 'UNKNOWN',
      productName: '',
      quantity: null,
      address: '',
      reply: ''
    };
  }
}

