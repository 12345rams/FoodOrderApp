import mongoose from 'mongoose';

const chatSessionSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    whatsappNumber: { type: String, required: true },
    currentState: {
      type: String,
      enum: [
        'START',
        'MAIN_MENU',
        'VIEWING_PRODUCTS',
        'WAITING_PRODUCT_SELECTION',
        'WAITING_QUANTITY',
        'WAITING_ADDRESS',
        'WAITING_CONFIRMATION',
        'ORDER_PLACED',
        'HUMAN_SUPPORT'
      ],
      default: 'START'
    },
    selectedProductId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    selectedProductName: String,
    quantity: Number,
    address: String,
    lastMessage: String,
    lastIntent: String,
    isHumanSupport: { type: Boolean, default: false }
  },
  { timestamps: true }
);

chatSessionSchema.index({ businessId: 1, customerId: 1 }, { unique: true });

export default mongoose.model('ChatSession', chatSessionSchema);

