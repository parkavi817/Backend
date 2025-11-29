console.log('agriscan.js file is being loaded');

import express from 'express';
import path from 'path';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

console.log('agriscan.js module loaded');

// Path to store the history JSON file
const HISTORY_FILE_PATH = path.join(__dirname, '../data/agriscan-history.json');

// Ensure the data directory and file exist
const initializeHistoryFile = async () => {
  try {
    await fs.mkdir(path.dirname(HISTORY_FILE_PATH), { recursive: true });
    try {
      await fs.access(HISTORY_FILE_PATH);
    } catch {
      // File doesn't exist, create it with an empty array
      await fs.writeFile(HISTORY_FILE_PATH, JSON.stringify({ history: [] }, null, 2));
      console.log('Initialized agriscan-history.json file.');
    }
  } catch (error) {
    console.error('Failed to initialize history file:', error);
  }
};

// Call it once when the module loads
initializeHistoryFile();

// GET /agriscan/history - Retrieve the prediction history
router.get('/history', async (req, res) => {
  try {
    const data = await fs.readFile(HISTORY_FILE_PATH, 'utf-8');
    const historyData = JSON.parse(data);
    res.json(historyData);
  } catch (error) {
    console.error('Error reading history file:', error);
    res.status(500).json({ message: 'Failed to load history.' });
  }
});

// POST /agriscan/history - Save a new prediction to history
router.post('/history', async (req, res) => {
  try {
    const data = await fs.readFile(HISTORY_FILE_PATH, 'utf-8');
    const historyData = JSON.parse(data);

    // Add the new prediction to the beginning of the array
    historyData.history.unshift(req.body);

    await fs.writeFile(HISTORY_FILE_PATH, JSON.stringify(historyData, null, 2));
    res.status(201).json({ message: 'Prediction saved to history.' });
  } catch (error) {
    console.error('Error saving to history:', error);
    res.status(500).json({ message: 'Failed to save prediction.' });
  }
});

// DELETE /agriscan/history - Clear all history
router.delete('/history', async (req, res) => {
  try {
    await fs.writeFile(HISTORY_FILE_PATH, JSON.stringify({ history: [] }, null, 2));
    res.json({ message: 'History cleared.' });
  } catch (error) {
    console.error('Error clearing history:', error);
    res.status(500).json({ message: 'Failed to clear history.' });
  }
});

// PUT /agriscan/history - Replace the entire history array
router.put('/history', async (req, res) => {
  try {
    // Validate that the request body has a 'history' array
    if (!req.body || !Array.isArray(req.body.history)) {
      return res.status(400).json({ message: 'Invalid request body. Expected { history: [...] }' });
    }

    // Write the entire new history array to the file
    await fs.writeFile(HISTORY_FILE_PATH, JSON.stringify(req.body, null, 2));
    res.json({ message: 'History updated successfully.' });
  } catch (error) {
    console.error('Error updating history:', error);
    res.status(500).json({ message: 'Failed to update history.' });
  }
});

export default router;