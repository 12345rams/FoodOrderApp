export function parseGeminiJson(text = '') {
  try {
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error('No JSON object found');
    }
    const parsed = JSON.parse(text.slice(firstBrace, lastBrace + 1));
    return {
      status: parsed.status || 'CHATTING',
      items: Array.isArray(parsed.items) ? parsed.items : [],
      address: parsed.address || '',
      reply: parsed.reply || ''
    };
  } catch (error) {
    return {
      status: 'CHATTING',
      items: [],
      address: '',
      reply: 'I am having trouble understanding that right now.'
    };
  }
}
