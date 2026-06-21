from flask import Flask, request, jsonify
import joblib
import torch
import numpy as np
from transformers import AutoTokenizer, AutoModel
from services.groq_service import explain_with_groq
from flask_cors import CORS

app = Flask(__name__)

MODEL_NAME = "emilyalsentzer/Bio_ClinicalBERT"

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModel.from_pretrained(MODEL_NAME)

clf = joblib.load("artifacts/clinical_model.pkl")

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)
model.eval()


def embed(text):
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=128)
    inputs = {k: v.to(device) for k, v in inputs.items()}

    with torch.no_grad():
        outputs = model(**inputs)
        return outputs.last_hidden_state[:, 0, :].cpu().numpy()


@app.route("/", methods=["GET"])
def home():
    return {"message": "BioClinicalBERT Disease Predictor API running"}


@app.route("/predict", methods=["POST"])
def predict():
    data = request.json

    if "symptoms" not in data:
        return {"error": "Please provide symptoms"}, 400

    text = data["symptoms"]

    # ML PREDICTION
    emb = embed(text)
    pred = clf.predict(emb)[0]
    probs = clf.predict_proba(emb)[0]

    top_idx = probs.argsort()[-3:][::-1]

    top_3 = [
        {
            "disease": clf.classes_[i],
            "confidence": float(probs[i])
        }
        for i in top_idx
    ]

    # ======================
    # GROQ LAYER (ADDED)
    # ======================
    explanation = explain_with_groq(text, pred, top_3)

    return jsonify({
        "input": text,
        "prediction": pred,
        "top_3": top_3,
        "explanation": explanation
    })


if __name__ == "__main__":
    app.run(debug=True)

    app = Flask(__name__)
CORS(app)