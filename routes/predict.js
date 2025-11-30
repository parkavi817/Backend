import express from "express";
import multer from "multer";
import fs from "fs";
import fetch from "node-fetch";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Use the more specific /api/predict endpoint for modern Gradio Spaces
const API_URL = "https://parkavi0987-agriml.hf.space/api/predict";

router.post("/", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    // Read the file and convert it to a base64 data URL
    const buffer = fs.readFileSync(req.file.path);
    const base64Image = buffer.toString("base64");
    const mimeType = req.file.mimetype;
    const dataUrl = `data:${mimeType};base64,${base64Image}`;

    // Construct the payload exactly as the Gradio UI does
    // Check the Payload tab in your browser's dev tools to confirm the structure
    const payload = {
      data: [
        {
          data: dataUrl,
          name: req.file.originalname,
        },
      ],
      fn_index: 0, // This is often 0, but verify in the Request Payload from your browser
    };

    console.log("Sending payload to API:", JSON.stringify(payload, null, 2));

    const apiResponse = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error("API Error Response:", errorText);
      throw new Error(`API Error ${apiResponse.status}: ${errorText}`);
    }

    const result = await apiResponse.json();
    console.log("API Success Response:", result);

    // Clean up the temporary file
    fs.unlinkSync(req.file.path);

    // The actual prediction is usually in result.data[0]
    return res.json({ prediction: result.data[0] });

  } catch (err) {
    console.error("Prediction error:", err);

    // Clean up the temporary file on error as well
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).json({
      error: "Prediction failed",
      details: err.message,
    });
  }
});

export default router;
