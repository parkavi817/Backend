import express from "express";
import multer from "multer";
import fs from "fs";
import fetch from "node-fetch";
import FormData from "form-data";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

const API_BASE = "https://parkavi0987-agriml.hf.space";

router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) 
      return res.status(400).json({ error: "No file uploaded" });

    // Build multipart form
    const form = new FormData();
    form.append("file", fs.createReadStream(req.file.path), req.file.originalname);
    // --------------^^^^ MUST MATCH FLASK ----------------

    // Send directly to HF Space /predict endpoint
    const hfResp = await fetch(`${API_BASE}/predict`, {
      method: "POST",
      body: form,
      headers: form.getHeaders(),
    });

    const result = await hfResp.json();
    console.log("HF Response:", result);

    fs.unlinkSync(req.file.path); // cleanup

    return res.json(result);

  } catch (err) {
    console.error("Prediction error:", err);
    if (req.file && fs.existsSync(req.file.path))
      fs.unlinkSync(req.file.path);

    res.status(500).json({ error: "Prediction failed", details: err.message });
  }
});

export default router;
