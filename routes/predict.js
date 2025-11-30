import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { Client } from "@gradio/client";
import { File } from "buffer";    // ✅ FIX: File polyfill for Node.js

const router = express.Router();
const upload = multer({ dest: "uploads/" });

let client;

// Connect to Gradio Space
(async () => {
  client = await Client.connect("Parkavi0987/Agriml");
})();

router.post("/", upload.single("file"), async (req, res) => {
  console.log("REQ FILE:", req.file);

  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    const buffer = fs.readFileSync(req.file.path);

    // ✅ Create real File object for Gradio
    const file = new File(
      [buffer],
      req.file.originalname,
      { type: req.file.mimetype }
    );

    // ✅ Correct Gradio input
    const result = await client.predict("/predict", {
      image: file
    });

    fs.unlinkSync(req.file.path);

    return res.json(result.data);

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: "Prediction failed",
      details: err.message
    });
  }
});

export default router;
