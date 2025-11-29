const Farm = require('../models/Farm');
const Alert = require('../models/Alert');
const axios = require('axios');

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

const checkAndGenerateAlerts = async () => {
  if (!WEATHER_API_KEY) {
    console.error('WEATHER_API_KEY is not set. Cannot generate weather alerts.');
    return;
  }

  console.log('Starting weather alert generation check...');
  try {
    const farms = await Farm.find({}); // Get all farms from the database

    for (const farm of farms) {
      if (!farm.alertsEnabled) {
        console.log(`Alerts disabled for farm: ${farm.name}. Skipping.`);
        continue;
      }

      try {
        // Fetch current weather for the farm using OpenWeatherMap
        const weatherResponse = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather`, {
            params: {
              lat: farm.lat,
              lon: farm.lng,
              appid: WEATHER_API_KEY,
              units: 'metric'
            }
          }
        );
        const data = weatherResponse.data;

        const temperature = data.main.temp;
        const humidity = data.main.humidity;
        const windSpeed = data.wind.speed; // OpenWeatherMap provides m/s by default for metric, adjust if needed
        const condition = data.weather[0].main; // e.g., "Clouds", "Clear", "Rain"

        console.log(`Checking weather for ${farm.name} (${data.name}): Temp=${temperature}°C, Humidity=${humidity}%, Wind=${windSpeed} m/s, Condition=${condition}`);

        const newAlerts = [];

        // Define alert thresholds and messages
        // Extreme Heat
        if (temperature > 40) {
          newAlerts.push({
            type: 'extreme_heat',
            severity: 'critical',
            message: `Extreme heat warning for ${farm.name}! Temperature: ${temperature}°C. Increase irrigation frequency and provide shade for crops.`,
          });
        }
        // Heavy Rain (using humidity as a proxy for now, or could use precipitation data if available)
        // WeatherAPI current.json doesn't directly give rain amount, but forecast does.
        // For simplicity, let's use high humidity as a trigger for potential heavy rain related issues.
        if (humidity > 85) {
          newAlerts.push({
            type: 'heavy_rain',
            severity: 'high',
            message: `High humidity alert for ${farm.name}! Humidity: ${humidity}%. Monitor for fungal diseases and improve drainage.`,
          });
        }
        // Strong Wind
        if (windSpeed > 25) {
          newAlerts.push({
            type: 'strong_wind',
            severity: 'medium',
            message: `Strong wind warning for ${farm.name}! Wind speed: ${windSpeed} km/h. Secure loose structures and avoid spraying.`,
          });
        }
        // Frost (assuming temperature below a certain threshold)
        if (temperature < 2) {
          newAlerts.push({
            type: 'frost',
            severity: 'high',
            message: `Frost warning for ${farm.name}! Temperature: ${temperature}°C. Protect sensitive crops.`,
          });
        }

        for (const alertData of newAlerts) {
          // Check if an unacknowledged alert of the same type already exists for this farm
          const existingAlert = await Alert.findOne({
            farmId: farm._id,
            type: alertData.type,
            acknowledged: false,
            timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Check for alerts in last 24 hours
          });

          if (!existingAlert) {
            const newAlert = new Alert({
              userId: farm.userId,
              farmId: farm._id,
              type: alertData.type,
              severity: alertData.severity,
              message: alertData.message,
              weatherData: {
                temperature,
                humidity,
                windSpeed,
                condition,
              },
            });
            await newAlert.save();
            console.log(`Generated new alert for ${farm.name}: ${alertData.message}`);
          } else {
            console.log(`Skipping duplicate alert for ${farm.name}: ${alertData.type}`);
          }
        }

      } catch (weatherErr) {
        console.error(`Error fetching weather for farm ${farm.name} (${farm._id}):`, weatherErr.message);
        // Optionally, create a system alert for failed weather fetch
      }
    }
    console.log('Weather alert generation check completed.');
  } catch (err) {
    console.error('Error in checkAndGenerateAlerts:', err);
  }
};

module.exports = { checkAndGenerateAlerts };