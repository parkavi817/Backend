import express from "express";
import multer from "multer";
import fs from "fs";
import { Client, handle_file } from "@gradio/client";  // ✅ Add handle_file import

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
    
    // ✅ Use handle_file for proper Gradio file handling
    const fileRef = handle_file(buffer);

    // ✅ Pass file reference directly
    const result = await client.predict("/predict", {
      image: fileRef  // Works for single image input
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

