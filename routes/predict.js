import express from "express";
import multer from "multer";
import fs from "fs";
import fetch from "node-fetch";
import FormData from "form-data";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

const API_BASE = "https://parkavi0987-agriml.hf.space";

router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // STEP 1: upload the file to HuggingFace Space
    const form = new FormData();
    form.append("file", fs.createReadStream(req.file.path));

    const uploadResp = await fetch(`${API_BASE}/file=upload`, {
      method: "POST",
      body: form,
    });

    const uploadJson = await uploadResp.json();
    console.log("Upload response:", uploadJson);

    const uploadedPath = uploadJson.file.path;

    // STEP 2: call the predict endpoint using the uploaded path
    const payload = {
      data: [{ path: uploadedPath }],
      fn_index: 2,
      session_hash: "eavwkd1eh3m",
      trigger_id: 11
    };

    const predictResp = await fetch(`${API_BASE}/api/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await predictResp.json();
    console.log("Prediction result:", result);

    // cleanup local file
    fs.unlinkSync(req.file.path);

    return res.json(result);

  } catch (error) {
    console.error("Prediction error:", error);

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ error: "Prediction failed", details: error.message });
  }
});

export default router;
