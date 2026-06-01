import mongoose from 'mongoose';

const chatSessionSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    whatsappNumber: { type: String, required: true },
    currentState: {
      type: String,
      default: 'START'
    },
    selectedItems: { type: Array, default: [] },
    address: String,
    lastMessage: String,
    lastIntent: String,
    isHumanSupport: { type: Boolean, default: false }
  },
  { timestamps: true }
);

chatSessionSchema.index({ businessId: 1, customerId: 1 }, { unique: true });

export default mongoose.model('ChatSession', chatSessionSchema);

