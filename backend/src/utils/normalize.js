export function normalizeWhatsAppNumber(value = '') {
  return value.replace('whatsapp:', '').trim();
}

export function toWhatsAppNumber(value = '') {
  const normalized = normalizeWhatsAppNumber(value);
  if (!normalized) return '';
  return normalized.startsWith('whatsapp:') ? normalized : `whatsapp:${normalized}`;
}

