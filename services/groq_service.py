"""
Groq-powered explanation layer. Takes a prediction (skin condition or
symptom-based disease) and returns a short, structured, human-readable
explanation: what it is, how to prevent/manage it, and a safety disclaimer.

Requires GROQ_API_KEY in your .env file.
"""
import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

_client = None


def _get_client():
    global _client
    if _client is None:
        api_key = os.environ.get("GROQ_API_KEY")
        if not api_key:
            raise RuntimeError("GROQ_API_KEY not set in environment/.env")
        _client = Groq(api_key=api_key)
    return _client


def explain_with_groq(text: str, pred: str, top_3: list) -> str:
    """
    text: the input description (typed symptoms, or a generated description
          of an image-scan result)
    pred: the top predicted condition/disease name
    top_3: list of {"disease": ..., "confidence": ...} dicts
    """
    client = _get_client()

    top_3_str = ", ".join(f"{t['disease']} ({t['confidence']:.0%})" for t in top_3)

    prompt = f"""You are a careful, friendly medical-information assistant.
A machine learning model analyzed the following input and produced a prediction.

Input: {text}
Top prediction: {pred}
Other possibilities considered: {top_3_str}

Write a short, clear explanation with exactly these three parts, using these
exact headers:

**What it is:** 1-3 sentences explaining what "{pred}" is in plain language.

**Prevention & care tips:** 2-4 short bullet points on how to prevent it or
manage symptoms day to day.

**Important:** One sentence reminding the user this is an AI-generated
prediction, not a medical diagnosis, and that they should consult a licensed
doctor or dermatologist for an accurate diagnosis and treatment.

Keep the whole response under 150 words. Do not add any other sections."""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.4,
        max_tokens=350,
    )
    return response.choices[0].message.content.strip()
