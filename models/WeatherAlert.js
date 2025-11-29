import mongoose from 'mongoose';

const weatherAlertSchema = new mongoose.Schema({
  farm: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true },
  type: { type: String, enum: ['extreme_heat', 'heavy_rain', 'strong_wind', 'frost', 'drought'], required: true },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  acknowledged: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('WeatherAlert', weatherAlertSchema);
