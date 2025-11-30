import express from "express";
import multer from "multer";
import fs from "fs";
import FormData from "form-data";
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
    
    // Create FormData with the correct structure for Gradio
    const form = new FormData();
    
    // For Hugging Face Spaces, we need to send the file in the expected format
    form.append("data", JSON.stringify([{
      data: `data:${req.file.mimetype};base64,${buffer.toString("base64")}`,
      name: req.file.originalname
    }]));
    
    form.append("fn_index", "0");

    const apiResponse = await fetch(`${SPACE_URL}/run/predict`, {
      method: "POST",
      headers: {
        ...form.getHeaders(),
      },
      body: form
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      throw new Error(`API ${apiResponse.status}: ${errorText}`);
    }

    const result = await apiResponse.json();
    
    // Clean up uploaded file
    fs.unlinkSync(req.file.path);
    
    return res.json(result.data);

  } catch (err) {
    console.error("Prediction error:", err);
    
    // Clean up file on error too
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
