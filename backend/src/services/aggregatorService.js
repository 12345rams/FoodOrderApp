import AggregatorSession from '../models/AggregatorSession.js';
import Business from '../models/Business.js';
import { processChat } from './chatbotService.js';
import { detectAggregatorIntent } from './geminiService.js';
import { sendWhatsAppMessage } from './twilioService.js';
import AggregatorSettings from '../models/AggregatorSettings.js';

export async function processAggregatorChat({ from, body, latitude, longitude }) {
  let session = await AggregatorSession.findOne({ whatsappNumber: from });
  
  if (!session) {
    session = await AggregatorSession.create({
      whatsappNumber: from,
      currentState: 'START'
    });
  }

  // Handle resets
  if (body.toLowerCase() === 'reset' || body.toLowerCase() === 'menu') {
    session.currentState = 'START';
    session.selectedBusinessId = null;
    await session.save();
  }

  // If already handed off to a business, forward everything to chatbotService!
  if (session.currentState === 'HANDED_OFF_TO_BUSINESS' && session.selectedBusinessId) {
    const business = await Business.findById(session.selectedBusinessId);
    if (!business) {
      session.currentState = 'START';
      await session.save();
      return { reply: 'Sorry, that business is no longer available. Please reply "reset" to start over.' };
    }
    
    // We pass control to the regular chatbotService.
    const result = await processChat(business, from, body);
    return result;
  }

  let reply = '';

  switch (session.currentState) {
    case 'START':
      reply = "Welcome to the Hotel & Restaurant Aggregator! 🛎️\n\nPlease send us your *Location* (use the WhatsApp 📎 attach button -> Location) so we can find the best places near you.";
      session.currentState = 'WAITING_LOCATION';
      break;

    case 'WAITING_LOCATION':
      if (latitude && longitude) {
        session.location = { lat: parseFloat(latitude), lng: parseFloat(longitude) };
        reply = "Location received! 📍\n\nDo you want to search for a *specific hotel*, or just *any hotel*? (e.g. 'Show me any cheap hotels' or 'I want pizza')";
        session.currentState = 'WAITING_PREFERENCE';
      } else {
        reply = "I didn't detect a location. Please use the WhatsApp attachment menu (📎) and send your Current Location.";
      }
      break;

    case 'WAITING_PREFERENCE': {
      // Use Gemini to understand what they want (cheap, specific food, high rating)
      const intent = await detectAggregatorIntent(body);
      
      const geoNearQuery = {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [session.location.lng, session.location.lat]
          },
          distanceField: "distance",
          maxDistance: 50000, // 50km
          spherical: true
        }
      };

      // We can sort in memory based on AI intent (price vs rating)
      // Since price isn't on Business model, we will just sort by rating or distance for now.
      const businesses = await Business.aggregate([
        geoNearQuery,
        { $limit: 10 }
      ]);

      if (businesses.length === 0) {
        reply = "Sorry, we couldn't find any hotels or restaurants within 50km of your location. Please reply 'reset' to try another location.";
        break;
      }

      // Sort based on intent
      if (intent.sort === 'rating') {
        businesses.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      }

      session.searchResults = businesses.map(b => ({
        businessId: b._id,
        name: b.businessName,
        rating: b.rating || 0,
        distance: b.distance
      }));

      reply = "Here are the nearest options based on your request:\n\n";
      session.searchResults.forEach((b, idx) => {
        const distKm = (b.distance / 1000).toFixed(1);
        reply += `${idx + 1}. *${b.name}* - ⭐ ${b.rating} (${distKm} km away)\n`;
      });
      reply += "\n*Reply with the number* of the place you want to explore.";
      
      session.currentState = 'WAITING_HOTEL_SELECTION';
      break;
    }

    case 'WAITING_HOTEL_SELECTION':
      const selection = parseInt(body.trim(), 10);
      if (isNaN(selection) || selection < 1 || selection > session.searchResults.length) {
        reply = "Please reply with a valid number from the list above.";
      } else {
        const selected = session.searchResults[selection - 1];
        session.selectedBusinessId = selected.businessId;
        session.currentState = 'HANDED_OFF_TO_BUSINESS';
        
        reply = `You have selected *${selected.name}*! 🏨\n\nFetching their menu...`;
        
        // We will trigger an automatic handoff in the webhook layer by sending this reply,
        // and then immediately calling the business's processChat to send their main menu.
      }
      break;

    default:
      session.currentState = 'START';
      reply = "Something went wrong. Let's start over.";
  }

  await session.save();
  return { reply, currentState: session.currentState, handedOff: session.currentState === 'HANDED_OFF_TO_BUSINESS', selectedBusinessId: session.selectedBusinessId };
}
