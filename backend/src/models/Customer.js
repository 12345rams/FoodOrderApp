import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    whatsappNumber: { type: String, required: true, trim: true },
    name: { type: String, trim: true },
    address: { type: String, trim: true }
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

customerSchema.index({ businessId: 1, whatsappNumber: 1 }, { unique: true });

export default mongoose.model('Customer', customerSchema);

