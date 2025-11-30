import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const filePath = path.resolve(req.file.path);
  const form = new FormData();
  form.append('file', fs.createReadStream(filePath));

  try {
    const response = await axios.post(
      'https://hf.space/embed/Parkavi0987/Agriml/+/api/predict/',
      form,
      { headers: form.getHeaders() }
    );

    fs.unlink(filePath, () => {});
    res.json(response.data);
  } catch (err) {
    fs.unlink(filePath, () => {});
    console.error(err);
    res.status(500).json({ error: 'Prediction failed', details: err.message });
  }
});

export default router;
