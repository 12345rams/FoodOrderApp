import { Router } from 'express';
import { twilioWhatsAppWebhook } from '../controllers/webhookController.js';

const router = Router();

router.post('/twilio/whatsapp', twilioWhatsAppWebhook);

export default router;

