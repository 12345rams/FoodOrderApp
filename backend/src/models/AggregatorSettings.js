import mongoose from 'mongoose';

const aggregatorSettingsSchema = new mongoose.Schema(
  {
    twilioAccountSid: { type: String, trim: true, required: true },
    twilioAuthToken: { type: String, trim: true, required: true },
    twilioWhatsappNumber: { type: String, trim: true, required: true },
    geminiApiKey: { type: String, trim: true },
    appName: { type: String, default: 'Aggregator Bot' }
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

export default mongoose.model('AggregatorSettings', aggregatorSettingsSchema);
