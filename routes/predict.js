from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import base64
from PIL import Image
import io

app = Flask(__name__)
CORS(app)

# -------------------- HF Space Model URL --------------------
# Your Hugging Face Space endpoint for prediction
HF_SPACE_URL = "https://hf.space/embed/Parkavi0987/Agriml/+/api/predict/"

# -------------------- ROUTE --------------------
@app.route("/api/predict", methods=["POST"])
def predict():
    try:
        if "file" not in request.files:
            return jsonify({"error": "No image provided"}), 400

        file = request.files["file"]

        # Convert uploaded image to base64 for HF Space API
        img_bytes = file.read()
        img_b64 = base64.b64encode(img_bytes).decode("utf-8")

        # Send request to Hugging Face Space
        payload = {"data": [img_b64]}
        response = requests.post(HF_SPACE_URL, json=payload)

        if response.status_code != 200:
            return jsonify({
                "error": "ML model API failed",
                "details": response.text
            }), 500

        # Return HF prediction to frontend
        hf_result = response.json()
        return jsonify({
            "prediction": hf_result.get("data", [])
        })

    except Exception as e:
        return jsonify({
            "error": "Prediction failed",
            "details": str(e)
        }), 500

# -------------------- RUN SERVER --------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
