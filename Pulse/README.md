# PULSE — AI Diagnostics Console

A full login + dashboard app for your two ML models (skin image classifier +
symptom-based text classifier), with a dark neon theme.

```
project/
├── backend/        Flask API: auth + both model endpoints
└── frontend/        React + Tailwind app: login + dashboard
```

## 1. Backend setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Copy your real model files in:
- `skin_disease_model.h5` → place in `backend/` (same folder as `app.py`)
- `artifacts/clinical_model.pkl` → place in `backend/artifacts/`
- If you use the Groq explanation layer, add `services/groq_service.py`
  (the one referenced in your original `app.py`) into `backend/services/`.
  If it's missing, the API still works — `explanation` will just be `null`.

Run it:
```bash
python app.py
```
Runs on `http://localhost:5000`. A `users.db` SQLite file is created
automatically on first run — no setup needed there.

### Endpoints
| Method | Route                     | Auth | Body |
|--------|---------------------------|------|------|
| POST   | `/api/auth/register`      | no   | `{username, password, email?}` |
| POST   | `/api/auth/login`         | no   | `{username, password}` |
| GET    | `/api/auth/verify`        | yes  | — |
| POST   | `/api/predict/skin`       | yes  | multipart form, field `image` |
| POST   | `/api/predict/symptoms`   | yes  | `{symptoms: "..."}` |

All authenticated routes expect `Authorization: Bearer <token>`.

## 2. Frontend setup

```bash
cd frontend
npm install
npm run dev
```
Runs on `http://localhost:5173`. By default it talks to
`http://localhost:5000` — override with a `.env` file:
```
VITE_API_BASE=http://localhost:5000
```

## 3. What's dynamic

- Signup/login is real: passwords are hashed with bcrypt, sessions use JWT,
  users persist in SQLite (`backend/users.db`).
- The skin scan section sends the uploaded image to `/api/predict/skin`,
  which runs your exact `predict.py` preprocessing (resize 224×224,
  normalize, `model.predict`) and returns prediction + confidence per class.
- The symptom section sends typed text to `/api/predict/symptoms`, which
  reuses your existing Bio_ClinicalBERT embedding + sklearn classifier +
  Groq explanation pipeline from your original `app.py`.
- Both result panels render live confidence bars from whatever the model
  actually returns — nothing is hardcoded.

## Notes / things to double check

- `CLASSES = ["acne", "eczema", "normal"]` in `backend/skin_predict.py` must
  match the exact order your model was trained on — copied directly from
  your `predict.py`/`accuracy.py`.
- Your original `app.py` had a duplicate `app = Flask(__name__)` / `CORS(app)`
  after `app.run()` (dead code, never executes) — removed in the new version,
  `CORS(app)` now runs once at the top, correctly.
- For production, set a real `JWT_SECRET` environment variable instead of
  the dev default in `backend/auth.py`.
