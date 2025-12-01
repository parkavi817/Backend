import express from "express";
import multer from "multer";
import fs from "fs";
import { client } from "@gradio/client";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// =====================
// 🔍 DEBUG ENDPOINT
// =====================
router.get("/debug", async (req, res) => {
  try {
    const gradio = await client("https://parkavi0987-agriml.hf.space/");
    const api = await gradio.view_api();
    console.log("Gradio API:", api);
    res.json(api);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================
// 🔥 PREDICTION ENDPOINT
// =====================
router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ error: "No file uploaded" });

    const filePath = req.file.path;

    // Connect to HF Space
    const gradio = await client("https://parkavi0987-agriml.hf.space/");

    // ❗ TEMP: use "/predict_1" after debug
    const result = await gradio.predict("/predict", {
      image: fs.createReadStream(filePath)
    });

    fs.unlinkSync(filePath);

    return res.json({
      result: result.data.Disease,
      confidence: result.data.Confidence,
      solution: result.data.Solution
    });

  } catch (err) {
    console.error("Prediction error:", err);
    return res.status(500).json({
      error: "Prediction failed",
      details: err.message
    });
  }
});

export default router;
