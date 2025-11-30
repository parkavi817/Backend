import express from "express";
import multer from "multer";
import fs from "fs";
import { FormData, fileFrom } from "node:fs";  // Native Node 18+

const router = express.Router();
const upload = multer({ dest: "uploads/" });

const SPACE_URL = "https://parkavi0987-agriml.hf.space";  // ✅ Correct format

router.post("/", upload.single("file"), async (req, res) => {
  console.log("REQ FILE:", req.file);

  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    // ✅ Native File from disk path
    const file = await fileFrom(req.file.path, req.file.originalname);
    
    const form = new FormData();
    form.append("data", file);
    form.append("fn_index", "0");

    const apiResponse = await fetch(`${SPACE_URL}/api/predict`, {
      method: "POST",
      body: form
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      throw new Error(`API ${apiResponse.status}: ${errorText}`);
    }

    const result = await apiResponse.json();
    
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
