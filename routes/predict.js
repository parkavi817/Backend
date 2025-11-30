import express from "express";
import multer from "multer";
import fs from "fs";
import fetch from "node-fetch";
import FormData from "form-data";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

const API_BASE = "https://parkavi0987-agriml.hf.space"; // Your Gradio/Flask backend

router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ error: "No file uploaded" });

    // Build multipart form
    const form = new FormData();
    form.append("file", fs.createReadStream(req.file.path), req.file.originalname);
    // must match the input name in your backend (Gradio/Flask expects 'file')

    // Send to backend
    const hfResp = await fetch(`${API_BASE}/predict`, {
      method: "POST",
      body: form,
      headers: form.getHeaders(),
    });

    const result = await hfResp.json();
    console.log("Prediction result:", result);

    // Cleanup uploaded temp file
    fs.unlinkSync(req.file.path);

    return res.json(result);

  } catch (err) {
    console.error("Prediction error:", err);
    if (req.file && fs.existsSync(req.file.path))
      fs.unlinkSync(req.file.path);

    return res.status(500).json({ error: "Prediction failed", details: err.message });
  }
});

export default router;
