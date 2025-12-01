import express from "express";
import multer from "multer";
import fs from "fs";
import { client } from "@gradio/client";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ error: "No file uploaded" });

    const filePath = req.file.path;

    // Connect to your HuggingFace Space
    const gradio = await client("https://parkavi0987-agriml.hf.space/");

    // Run prediction using your function name "/predict"
    const result = await gradio.predict("/predict", {
      image: fs.createReadStream(filePath)
    });

    fs.unlinkSync(filePath);

    // result.data contains: { Disease, Confidence, Solution }
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
