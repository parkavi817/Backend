import express from "express";
import multer from "multer";
import fs from "fs";
import fetch from "node-fetch";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

const SPACE_URL = "https://parkavi0987-agriml.hf.space";

router.post("/", upload.single("file"), async (req, res) => {
  console.log("REQ FILE:", req.file);

  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    const buffer = fs.readFileSync(req.file.path);
    const base64Image = buffer.toString("base64");
    const mimeType = req.file.mimetype;

    // Create the payload that Gradio expects
    const payload = {
      data: [
        `data:${mimeType};base64,${base64Image}`
      ],
      fn_index: 0
    };

    const apiResponse = await fetch(`${SPACE_URL}/run/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload)
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      throw new Error(`API ${apiResponse.status}: ${errorText}`);
    }

    const result = await apiResponse.json();
    
    fs.unlinkSync(req.file.path);
    return res.json(result.data);

  } catch (err) {
    console.error("Prediction error:", err);
    
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    return res.status(500).json({
      error: "Prediction failed", 
      details: err.message
    });
  }
});

export default router;
