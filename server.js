import 'dotenv/config';
console.log('🛠️ Loaded env vars:', process.env);

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import farmsRoutes from './routes/farm.js';
import predictRoutes from './routes/predict.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import settingsRoutes from './routes/settings.js';
import alertsRoutes from './routes/alerts.js';
import cropsRoutes from './routes/crops.js';
import schemesRoutes from './routes/schemes.js';
import translationRoutes from './routes/simpleTranslation.js';
import weatherRoutes from './routes/weather.js';
import chatRoutes from './routes/chat.js';
import marketRoutes from './routes/market.js';
import dashboardRoutes from './routes/dashboard.js';
import agriscanRoutes from './routes/agriscan.js';
import mapsRoutes from './routes/maps.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/agri-db';
mongoose
  .connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173",         
    "https://your-frontend.netlify.app"  // you will update this later
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json());

// Serve translation JSON files
app.use('/locales', express.static(path.join(__dirname, '..', 'public', 'locales')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/crops', cropsRoutes);
app.use('/api/schemes', schemesRoutes);
app.use('/api/translate', translationRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/farms', farmsRoutes);
app.use('/api/predict', predictRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/agriscan', agriscanRoutes);
app.use('/api/maps', mapsRoutes);

// 404 for invalid API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
