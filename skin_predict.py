"""
Wraps the user's skin_disease_model.h5 (predict.py logic) as a reusable function
that takes raw image bytes instead of reading from a fixed file path.
"""
import io
import os
import numpy as np

MODEL_PATH = os.environ.get("SKIN_MODEL_PATH", "skin_disease_model.h5")
CLASSES = ["acne", "eczema", "normal"]  # must match training order

_model = None
_load_error = None


def _get_model():
    global _model, _load_error
    if _model is not None:
        return _model
    if _load_error is not None:
        raise _load_error
    try:
        from tensorflow.keras.models import load_model
        _model = load_model(MODEL_PATH)
        return _model
    except Exception as e:  # noqa: BLE001
        _load_error = e
        raise


def predict_skin_image(file_bytes: bytes):
    """
    Takes raw image bytes (e.g. from a Flask file upload), runs the same
    preprocessing as predict.py (resize to 224x224, normalize 0-1), and
    returns the predicted class + confidence + full class probabilities.
    """
    from tensorflow.keras.preprocessing.image import img_to_array
    from PIL import Image

    model = _get_model()

    img = Image.open(io.BytesIO(file_bytes)).convert("RGB")
    img = img.resize((224, 224))
    arr = img_to_array(img)
    arr = arr / 255.0
    arr = np.expand_dims(arr, axis=0)

    pred = model.predict(arr, verbose=0)[0]
    top_idx = int(np.argmax(pred))

    return {
        "prediction": CLASSES[top_idx],
        "confidence": float(pred[top_idx]),
        "all_probabilities": {CLASSES[i]: float(pred[i]) for i in range(len(CLASSES))},
    }
