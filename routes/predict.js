import express from "express";
import multer from "multer";
import fs from "fs";
import fetch from "node-fetch";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

const API_BASE = "https://parkavi0987-agriml.hf.space";

router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const imageBuffer = fs.readFileSync(req.file.path);
    const imageBase64 = imageBuffer.toString("base64");

    const payload = {
      data: [imageBase64],  // send base64 directly
      fn_index: 2,          // adjust fn_index according to your Space
      session_hash: "eavwkd1eh3m"
    };

    const predictResp = await fetch(`${API_BASE}/api/predict/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await predictResp.json();
    console.log("Prediction result:", result);

    fs.unlinkSync(req.file.path);
    res.json(result);

  } catch (error) {
    console.error("Prediction error:", error);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: "Prediction failed", details: error.message });
  }
});

export default router;
