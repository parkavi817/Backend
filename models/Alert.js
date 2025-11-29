import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  farmId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farm',
    required: true,
  },
  type: {
    type: String,
    enum: ['extreme_heat', 'heavy_rain', 'strong_wind', 'frost', 'drought', 'other'],
    required: true,
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  },
  message: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  acknowledged: {
    type: Boolean,
    default: false,
  },
  // Potentially add weather data at the time of alert for context
  weatherData: {
    temperature: Number,
    humidity: Number,
    windSpeed: Number,
    condition: String,
  },
}, { timestamps: true });

export default mongoose.model('Alert', alertSchema);