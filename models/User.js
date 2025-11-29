import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  phone: { type: String },
  farmLocation: { type: String },
  farmSize: { type: Number },
  cropTypes: [{ type: String }],
  soilType: { type: String },
  preferences: {
    theme: { type: String, default: 'light' },
    language: { type: String, default: 'en' },
    notifications: {
      weather: { type: Boolean, default: true },
      schemes: { type: Boolean, default: true },
      pestAlerts: { type: Boolean, default: true },
      priceUpdates: { type: Boolean, default: false },
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    }
  }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
