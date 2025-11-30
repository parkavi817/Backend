import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { Blob } from "buffer";
import { Client } from "@gradio/client";

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
    const imageBuffer = fs.readFileSync(filePath);

    // Convert buffer → Blob (THIS is what Gradio expects)
    const blob = new Blob([imageBuffer]);

    // Send correct object
    const result = await client.predict("/predict", {
      image: blob,
    });

    fs.unlink(filePath, () => {});
    res.json(result.data);
  } catch (err) {
    fs.unlink(filePath, () => {});
    console.error(err);
    res.status(500).json({ error: "Prediction failed", details: err.message });
  }
});

export default router;
