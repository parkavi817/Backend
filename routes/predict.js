import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { Client } from "@gradio/client";
import { Blob } from "buffer";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

let client;
(async () => {
  client = await Client.connect("Parkavi0987/Agriml");
})();

router.post("/", upload.single("file"), async (req, res) => {
  console.log("REQ FILE:", req.file);  // 👈 VERY IMPORTANT LOG

  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    const buffer = fs.readFileSync(req.file.path);
    const blob = new Blob([buffer], { type: req.file.mimetype });

    const result = await client.predict("/predict", { image: blob });

    fs.unlinkSync(req.file.path);

    return res.json(result.data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: "Prediction failed",
      details: err.message,
    });
  }
});

export default router;
