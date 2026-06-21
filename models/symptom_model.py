import pandas as pd
import joblib
import torch
import numpy as np
from transformers import AutoTokenizer, AutoModel
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

# =========================
# LOAD DATA
# =========================
df = pd.read_csv("data/Symptom2Disease.csv")

X = df["text"].astype(str).tolist()
y = df["label"]

# =========================
# BIOCLINICALBERT MODEL
# =========================
MODEL_NAME = "emilyalsentzer/Bio_ClinicalBERT"

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModel.from_pretrained(MODEL_NAME)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)
model.eval()


# =========================
# EMBEDDING FUNCTION
# =========================
def get_embedding(text_list):
    embeddings = []

    for text in text_list:
        inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=128)
        inputs = {k: v.to(device) for k, v in inputs.items()}

        with torch.no_grad():
            outputs = model(**inputs)
            cls_embedding = outputs.last_hidden_state[:, 0, :].squeeze().cpu().numpy()

        embeddings.append(cls_embedding)

    return np.array(embeddings)


# =========================
# CONVERT TEXT → EMBEDDINGS
# =========================
print("Encoding with BioClinicalBERT...")
X_emb = get_embedding(X)

# =========================
# TRAIN TEST SPLIT
# =========================
X_train, X_test, y_train, y_test = train_test_split(
    X_emb, y, test_size=0.2, random_state=42
)

# =========================
# CLASSIFIER
# =========================
clf = LogisticRegression(max_iter=2000)
clf.fit(X_train, y_train)

# =========================
# EVALUATION
# =========================
preds = clf.predict(X_test)
print("Accuracy:", accuracy_score(y_test, preds))

# =========================
# SAVE MODELS
# =========================
joblib.dump(clf, "artifacts/clinical_model.pkl")
joblib.dump(tokenizer, "artifacts/tokenizer.pkl")

print("✅ BioClinicalBERT model saved!")