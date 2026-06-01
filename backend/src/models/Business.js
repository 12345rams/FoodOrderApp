import mongoose from 'mongoose';

const businessSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    businessName: { type: String, required: true, trim: true },
    businessType: { type: String, trim: true },
    description: { type: String, trim: true },
    address: { type: String, trim: true },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0]
      }
    },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    phone: { type: String, trim: true },
    whatsappNumber: { type: String, trim: true },
    twilioAccountSid: { type: String, trim: true },
    twilioAuthToken: { type: String, trim: true },
    twilioWhatsappNumber: { type: String, trim: true, index: true },
    geminiApiKey: { type: String, trim: true },
    chatbotEnabled: { type: Boolean, default: true },
    automationEnabled: { type: Boolean, default: true },
    razorpayEnabled: { type: Boolean, default: false },
    razorpayPaymentBaseUrl: { type: String, trim: true }
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

businessSchema.index({ location: '2dsphere' });

export default mongoose.model('Business', businessSchema);

