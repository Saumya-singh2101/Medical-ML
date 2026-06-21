import joblib
import torch
import numpy as np
from transformers import AutoTokenizer, AutoModel

# =========================
# LOAD MODEL
# =========================
MODEL_NAME = "emilyalsentzer/Bio_ClinicalBERT"

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModel.from_pretrained(MODEL_NAME)

clf = joblib.load("artifacts/clinical_model.pkl")

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)
model.eval()


# =========================
# EMBEDDING FUNCTION
# =========================
def embed(text):
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=128)
    inputs = {k: v.to(device) for k, v in inputs.items()}

    with torch.no_grad():
        outputs = model(**inputs)
        return outputs.last_hidden_state[:, 0, :].cpu().numpy()


# =========================
# CHAT LOOP
# =========================
while True:
    text = input("\nEnter symptoms (or exit): ")

    if text.lower() == "exit":
        break

    emb = embed(text)

    pred = clf.predict(emb)[0]
    probs = clf.predict_proba(emb)[0]

    top_idx = probs.argsort()[-3:][::-1]

    print("\n🔍 Prediction:", pred)

    print("\n📊 Top 3:")
    for i in top_idx:
        print(f"- {clf.classes_[i]}: {probs[i]:.4f}")