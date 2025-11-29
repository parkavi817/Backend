import mongoose from 'mongoose';

const governmentSchemeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  eligibility: [{ type: String }],
  benefits: { type: String },
  deadline: { type: String },
  category: { type: String },
  amount: { type: String },
  applicationLink: { type: String },
  popularity: { type: Number },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'] },
  uniqueFeatures: [{ type: String }]
}, { timestamps: true });

export default mongoose.model('GovernmentScheme', governmentSchemeSchema);
