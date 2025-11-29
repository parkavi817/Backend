import mongoose from 'mongoose';

const farmSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  lat: {
    type: Number,
    required: true,
  },
  lng: {
    type: Number,
    required: true,
  },
  cropType: {
    type: String,
    required: true,
  },
  area: { // in hectares
    type: Number,
    required: true,
  },
  soilType: {
    type: String,
    required: true,
  },
  alertsEnabled: {
    type: Boolean,
    default: true,
  },
  // You might want to store last weather check or current weather here,
  // but it's often better to fetch current weather on demand or via a separate service.
  // For alerts, the alert itself will be stored in the Alert model.
}, { timestamps: true });

// Ensure a user cannot have two farms with the exact same name (optional, but good for data integrity)
farmSchema.index({ userId: 1, name: 1 }, { unique: true });

export default mongoose.model('Farm', farmSchema);