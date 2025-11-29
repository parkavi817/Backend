import express from 'express';
import ChatSession from '../models/ChatSession.js';
import axios from 'axios';
import { authenticateJWT } from '../middleware/auth.js';

const router = express.Router();
// Apply authentication to all chat routes
router.use(authenticateJWT);

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Get chat history for user and session
router.get('/history', async (req, res) => {
  const sessionId = req.query.sessionId || 'default';
  try {
    const chatSession = await ChatSession.findOne({ user: req.user.id, sessionId });
    if (!chatSession) return res.json({ messages: [] });
    res.json({ messages: chatSession.messages });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

 // Save chat message
router.post('/message', async (req, res) => {
  const { text, sender, sessionId = 'default' } = req.body;
  if (!text || !sender) return res.status(400).json({ message: 'Text and sender are required' });

  try {
    let chatSession = await ChatSession.findOne({ user: req.user.id, sessionId });
    if (!chatSession) {
      chatSession = new ChatSession({ user: req.user.id, sessionId, messages: [] });
    }
    chatSession.messages.push({ sender, text, timestamp: new Date() });
    await chatSession.save();
    res.json({ message: 'Message saved' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete chat session
router.delete('/session/:sessionId', async (req, res) => {
  try {
    const result = await ChatSession.deleteOne({ user: req.user.id, sessionId: req.params.sessionId });
    if (result.deletedCount === 0) return res.status(404).json({ message: 'Session not found' });
    res.json({ message: 'Session deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Chatbot query with voice and multilingual support placeholder
router.post('/query', async (req, res) => {
  const { prompt, language = 'en', voiceInput, voiceOutput } = req.body;
  if (!prompt) return res.status(400).json({ message: 'Prompt is required' });

  try {
    // Call OpenRouter API for chatbot response
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      language,
      voiceInput,
      voiceOutput
    }, {
      headers: { Authorization: `Bearer ${OPENROUTER_API_KEY}` }
    });

    const botReply = response.data.choices[0].message.content;

    // Save bot reply to chat session
    let chatSession = await ChatSession.findOne({ user: req.user.id, sessionId: req.body.sessionId || 'default' });
    if (!chatSession) {
      chatSession = new ChatSession({ user: req.user.id, sessionId: req.body.sessionId || 'default', messages: [] });
    }
    chatSession.messages.push({ sender: 'bot', text: botReply, timestamp: new Date() });
    await chatSession.save();

    res.json({ reply: botReply });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get chatbot response' });
  }
});

export default router;
