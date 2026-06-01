import express from 'express';
import { processAggregatorChat } from '../services/aggregatorService.js';
import AggregatorSettings from '../models/AggregatorSettings.js';
import twilio from 'twilio';

const router = express.Router();

router.post('/twilio/whatsapp', async (req, res) => {
  try {
    const { From, Body, Latitude, Longitude } = req.body;
    console.log('Aggregator Webhook received:', { From, Body, Latitude, Longitude });

    if (!From) return res.status(200).send('OK');

    const result = await processAggregatorChat({ 
      from: From, 
      body: Body || '', 
      latitude: Latitude, 
      longitude: Longitude 
    });

    if (result && result.reply) {
      // Find the master settings to send the reply
      const settings = await AggregatorSettings.findOne();
      
      if (settings && settings.twilioAccountSid && settings.twilioAuthToken && settings.twilioWhatsappNumber) {
        const client = twilio(settings.twilioAccountSid, settings.twilioAuthToken);
        
        await client.messages.create({
          from: settings.twilioWhatsappNumber,
          to: From,
          body: result.reply
        });
      } else {
        console.warn('AggregatorSettings not configured, cannot send WhatsApp reply.');
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Aggregator Webhook Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

export default router;
