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
  if (!req.file)
    return res.status(400).json({ error: "No file uploaded" });

  const filePath = path.resolve(req.file.path);

  try {
    const buffer = fs.readFileSync(filePath);

    // MUST send a Blob
    const blob = new Blob([buffer], { type: req.file.mimetype });

    const result = await client.predict("/predict", {
      image: blob
    });

    fs.unlinkSync(filePath);

    res.json(result.data);
  } catch (error) {
    fs.unlinkSync(filePath);
    console.error(error);
    res.status(500).json({ error: "Prediction failed", details: error.message });
  }
});

export default router;
