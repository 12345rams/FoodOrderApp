import mongoose from 'mongoose';

const knowledgeItemSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    tags: { type: [String], default: [] },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

knowledgeItemSchema.index({ businessId: 1, isActive: 1 });

export default mongoose.model('KnowledgeItem', knowledgeItemSchema);

