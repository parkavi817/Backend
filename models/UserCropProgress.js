import mongoose from 'mongoose';

const userCropProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  cropId: { // Or cropName, depending on how you identify crops
    type: String, // Assuming cropId is a string identifier
    required: true,
  },
  viewedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// Optional: Add a unique compound index to prevent duplicate entries for the same user and crop on the same day
userCropProgressSchema.index({ userId: 1, cropId: 1, viewedAt: 1 }, { unique: false });

export default mongoose.model('UserCropProgress', userCropProgressSchema);