"""
Main API: serves auth (signup/login/verify), symptom-based prediction
(Bio_ClinicalBERT + sklearn classifier + Groq explanation), and
skin-image prediction (Keras CNN).

Run: python app.py
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import auth
from skin_predict import predict_skin_image

app = Flask(__name__)

CORS(app, resources={
    r"/api/*": {
        "origins": [
            "https://medical-o3qnxpdle-saumya-singh2101s-projects.vercel.app",
            "http://localhost:5173"
        ]
    }
})
CORS(app, supports_credentials=True)

auth.init_db()

# ---------------------------------------------------------------------------
# Lazy-loaded symptom model (BioClinicalBERT embeddings + sklearn classifier)
# Loaded on first use so the server still starts even if artifacts aren't
# present yet (e.g. while developing the frontend).
# ---------------------------------------------------------------------------
_symptom_state = {"tokenizer": None, "model": None, "clf": None, "device": None, "error": None}


def _load_symptom_model():
    if _symptom_state["clf"] is not None:
        return
    if _symptom_state["error"] is not None:
        raise _symptom_state["error"]
    try:
        import joblib
        import torch
        from transformers import AutoTokenizer, AutoModel

        MODEL_NAME = "emilyalsentzer/Bio_ClinicalBERT"
        tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
        model = AutoModel.from_pretrained(MODEL_NAME)
        clf = joblib.load("artifacts/clinical_model.pkl")

        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        model.to(device)
        model.eval()

        _symptom_state.update(
            {"tokenizer": tokenizer, "model": model, "clf": clf, "device": device}
        )
    except Exception as e:  # noqa: BLE001
        _symptom_state["error"] = e
        raise


def _embed_text(text: str):
    import torch

    tokenizer = _symptom_state["tokenizer"]
    model = _symptom_state["model"]
    device = _symptom_state["device"]

    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=128)
    inputs = {k: v.to(device) for k, v in inputs.items()}
    with torch.no_grad():
        outputs = model(**inputs)
        return outputs.last_hidden_state[:, 0, :].cpu().numpy()


def _explain_with_groq(text, pred, top_3):
    try:
        from services.groq_service import explain_with_groq
        return explain_with_groq(text, pred, top_3)
    except Exception as e:  # noqa: BLE001
        print("GROQ ERROR (symptoms):", repr(e))
        return None


def _explain_skin_with_groq(prediction, confidence, all_probs):
    """
    Reuses the same groq_service.explain_with_groq(text, pred, top_3) signature
    so we don't need a second function in groq_service.py. We just frame the
    "text" as a description of the image result instead of typed symptoms.
    """
    try:
        from services.groq_service import explain_with_groq

        pseudo_text = (
            f"A skin image was analyzed by a CNN classifier. "
            f"Predicted condition: {prediction} (confidence {confidence:.0%})."
        )
        top_3 = sorted(
            [{"disease": cls, "confidence": p} for cls, p in all_probs.items()],
            key=lambda x: x["confidence"],
            reverse=True,
        )[:3]
        return explain_with_groq(pseudo_text, prediction, top_3)
    except Exception as e:  # noqa: BLE001
        print("GROQ ERROR (skin):", repr(e))
        return None


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------
@app.route("/", methods=["GET"])
def home():
    return {"message": "ML Diagnostics API running"}


# ---------------------------------------------------------------------------
# Auth routes
# ---------------------------------------------------------------------------
@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.get_json(force=True, silent=True) or {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""
    email = (data.get("email") or "").strip() or None

    if not username or not password:
        return jsonify({"error": "Username and password are required."}), 400

    try:
        user = auth.register_user(username, password, email)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    token = auth.make_token(user["id"], user["username"])
    return jsonify({"token": token, "user": user})


@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json(force=True, silent=True) or {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""

    if not username or not password:
        return jsonify({"error": "Username and password are required."}), 400

    try:
        user = auth.authenticate_user(username, password)
    except ValueError as e:
        return jsonify({"error": str(e)}), 401

    token = auth.make_token(user["id"], user["username"])
    return jsonify({"token": token, "user": user})


@app.route("/api/auth/verify", methods=["GET"])
@auth.login_required
def verify():
    return jsonify({"user": request.user})


# ---------------------------------------------------------------------------
# Symptom prediction (text)
# ---------------------------------------------------------------------------
@app.route("/api/predict/symptoms", methods=["POST"])
@auth.login_required
def predict_symptoms():
    data = request.get_json(force=True, silent=True) or {}
    text = (data.get("symptoms") or "").strip()

    if not text:
        return jsonify({"error": "Please provide symptoms"}), 400

    try:
        _load_symptom_model()
    except Exception as e:  # noqa: BLE001
        return jsonify({"error": f"Symptom model not available: {e}"}), 503

    clf = _symptom_state["clf"]
    emb = _embed_text(text)
    pred = clf.predict(emb)[0]
    probs = clf.predict_proba(emb)[0]

    top_idx = probs.argsort()[-3:][::-1]
    top_3 = [{"disease": clf.classes_[i], "confidence": float(probs[i])} for i in top_idx]

    explanation = _explain_with_groq(text, pred, top_3)

    return jsonify({
        "input": text,
        "prediction": pred,
        "top_3": top_3,
        "explanation": explanation,
    })


# ---------------------------------------------------------------------------
# Skin image prediction
# ---------------------------------------------------------------------------
@app.route("/api/predict/skin", methods=["POST"])
@auth.login_required
def predict_skin():
    if "image" not in request.files:
        return jsonify({"error": "Please upload an image file under field name 'image'"}), 400

    file = request.files["image"]
    file_bytes = file.read()

    if not file_bytes:
        return jsonify({"error": "Empty file"}), 400

    try:
        result = predict_skin_image(file_bytes)
    except Exception as e:  # noqa: BLE001
        return jsonify({"error": f"Skin model not available: {e}"}), 503

    result["explanation"] = _explain_skin_with_groq(
        result["prediction"], result["confidence"], result["all_probabilities"]
    )

    return jsonify(result)



if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
