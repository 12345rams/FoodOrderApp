import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    body: { type: String, required: true },
    direction: { type: String, enum: ['incoming', 'outgoing'], required: true },
    messageSid: { type: String, index: true }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model('Message', messageSchema);

