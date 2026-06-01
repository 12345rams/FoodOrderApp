import mongoose from 'mongoose';

const aggregatorSessionSchema = new mongoose.Schema(
  {
    whatsappNumber: { type: String, required: true, unique: true },
    currentState: {
      type: String,
      enum: [
        'START',
        'WAITING_LOCATION',
        'WAITING_PREFERENCE',
        'WAITING_HOTEL_SELECTION',
        'HANDED_OFF_TO_BUSINESS'
      ],
      default: 'START'
    },
    location: {
      lat: Number,
      lng: Number
    },
    searchResults: [{
      businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business' },
      name: String,
      rating: Number,
      distance: Number
    }],
    selectedBusinessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business' }
  },
  { timestamps: true }
);

export default mongoose.model('AggregatorSession', aggregatorSessionSchema);
