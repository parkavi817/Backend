import express from "express";
import multer from "multer";
import fs from "fs";
import FormData from "form-data";  // npm install form-data
import fetch from "node-fetch";    // npm install node-fetch

const router = express.Router();
const upload = multer({ dest: "uploads/" });

const SPACE_URL = "https://parkavi0987-agriml.hf.space";  // Your Space URL

router.post("/", upload.single("file"), async (req, res) => {
  console.log("REQ FILE:", req.file);

  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    // Read file as buffer
    const buffer = fs.readFileSync(req.file.path);
    
    // Create FormData with file
    const form = new FormData();
    form.append("data", buffer, req.file.originalname);
    form.append("fn_index", "0");  // predict fn index (usually 0)

    // Direct API call to Gradio Space
    const apiResponse = await fetch(`${SPACE_URL}/api/predict/`, {
      method: "POST",
      body: form
    });

    if (!apiResponse.ok) {
      throw new Error(`API error: ${apiResponse.status}`);
    }

    const result = await apiResponse.json();
    
    fs.unlinkSync(req.file.path);
    return res.json(result.data);  // Exact same format as UI

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: "Prediction failed",
      details: err.message
    });
  }
});

export default router;
