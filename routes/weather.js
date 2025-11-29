import express from 'express';
import { authenticateJWT } from '../middleware/auth.js';
import axios from 'axios';

const router = express.Router();

// ✅ Ensure .env variables are loaded in your server.js/app.js:
// import dotenv from 'dotenv';
// dotenv.config();

// ✅ Utility to check if API key is loaded
function getWeatherApiKey() {
  const key = process.env.WEATHER_API_KEY;
  if (!key) {
    throw new Error('WEATHER_API_KEY is missing in environment variables');
  }
  return key;
}

// 📌 Current weather endpoint
router.get('/current', authenticateJWT, async (req, res) => {
  const city = req.query.city;
  if (!city) return res.status(400).json({ message: 'City is required' });

  try {
    const apiKey = getWeatherApiKey();

    console.log(
      '📡 Requesting current weather for:',
      city,
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    );

    const response = await axios.get(
      'https://api.openweathermap.org/data/2.5/weather',
      {
        params: {
          q: city,
          appid: apiKey,
          units: 'metric',
        },
      }
    );

    const data = response.data;

    const weatherData = {
      city: data.name,
      temperature: data.main.temp,
      condition: data.weather[0].main,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      pressure: data.main.pressure,
      visibility: data.visibility / 1000, // Convert meters to km
      forecast: [],
    };

    res.status(200).json(weatherData);
  } catch (error) {
    console.error(
      '❌ Error fetching current weather:',
      error.response?.data || error.message
    );
    res.status(500).json({
      message: 'Failed to fetch weather data',
      error: error.response?.data || error.message,
    });
  }
});

// 📌 Forecast endpoint
router.get('/forecast', authenticateJWT, async (req, res) => {
  const city = req.query.city;
  if (!city) return res.status(400).json({ message: 'City is required' });

  try {
    const apiKey = getWeatherApiKey();

    const response = await axios.get(
      'https://api.openweathermap.org/data/2.5/forecast',
      {
        params: {
          q: city,
          appid: apiKey,
          units: 'metric',
        },
      }
    );

    const raw = response.data.list;
    const forecastDays = [];
    const seenDates = new Set();

    for (let i = 0; i < raw.length; i++) {
      const entry = raw[i];
      const date = entry.dt_txt.split(' ')[0];
      const hour = entry.dt_txt.split(' ')[1];

      if (hour === '12:00:00' && !seenDates.has(date)) {
        seenDates.add(date);

        forecastDays.push({
          date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
          high: entry.main.temp_max,
          low: entry.main.temp_min,
          condition: entry.weather[0].main,
          icon: mapWeatherConditionToIcon(entry.weather[0].main),
          precipitation: Math.round(entry.pop * 100),
        });
      }

      if (forecastDays.length === 5) break;
    }

    res.status(200).json(forecastDays);
  } catch (error) {
    console.error(
      '❌ Error fetching forecast:',
      error.response?.data || error.message
    );
    res.status(500).json({
      message: 'Failed to fetch forecast data',
      error: error.response?.data || error.message,
    });
  }
});

// 📌 Current weather by coordinates
router.get('/current-coords', authenticateJWT, async (req, res) => {
  const { lat, lng } = req.query;
  if (!lat || !lng) {
    return res
      .status(400)
      .json({ message: 'Latitude and longitude are required' });
  }

  try {
    const apiKey = getWeatherApiKey();

    const response = await axios.get(
      'https://api.openweathermap.org/data/2.5/weather',
      {
        params: {
          lat: lat,
          lon: lng,
          appid: apiKey,
          units: 'metric',
        },
      }
    );

    const data = response.data;

    const weatherData = {
      city: data.name,
      temperature: data.main.temp,
      condition: data.weather[0].main,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      pressure: data.main.pressure,
      visibility: data.visibility / 1000,
      forecast: [],
    };

    res.status(200).json(weatherData);
  } catch (error) {
    console.error(
      '❌ Error fetching weather by coords:',
      error.response?.data || error.message
    );
    res.status(500).json({
      message: 'Failed to fetch weather data by coordinates',
      error: error.response?.data || error.message,
    });
  }
});

// 📌 Helper: Map conditions to icons
function mapWeatherConditionToIcon(conditionText) {
  const lowerCaseCondition = conditionText.toLowerCase();
  if (
    lowerCaseCondition.includes('sunny') ||
    lowerCaseCondition.includes('clear')
  ) {
    return 'sun';
  } else if (
    lowerCaseCondition.includes('cloud') ||
    lowerCaseCondition.includes('overcast')
  ) {
    return 'cloud';
  } else if (
    lowerCaseCondition.includes('rain') ||
    lowerCaseCondition.includes('drizzle') ||
    lowerCaseCondition.includes('shower')
  ) {
    return 'rain';
  } else if (
    lowerCaseCondition.includes('snow') ||
    lowerCaseCondition.includes('sleet')
  ) {
    return 'snow';
  } else if (lowerCaseCondition.includes('thunder')) {
    return 'thunder';
  }
  return 'cloud';
}

export default router;
