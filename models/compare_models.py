import pandas as pd
import os

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer

from sklearn.naive_bayes import MultinomialNB
from sklearn.linear_model import LogisticRegression
from sklearn.svm import LinearSVC
from sklearn.ensemble import RandomForestClassifier

from sklearn.metrics import accuracy_score, f1_score

print("\n🚀 COMPARE MODELS SCRIPT RUNNING\n")

# =========================
# LOAD DATA
# =========================

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

csv_path = os.path.join(
    BASE_DIR,
    "data",
    "Symptom2Disease.csv"
)

df = pd.read_csv(csv_path)

X = df["text"]
y = df["label"]

# =========================
# CLEANING
# =========================

STOP_WORDS = [
    "mild",
    "severe",
    "patient",
    "feeling",
    "feels",
    "suffering"
]

def clean_text(text):
    text = str(text).lower()

    for w in STOP_WORDS:
        text = text.replace(w, "")

    return text

X = X.apply(clean_text)

# =========================
# TRAIN TEST SPLIT
# =========================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

# =========================
# TF-IDF
# =========================

vectorizer = TfidfVectorizer(
    lowercase=True,
    stop_words="english",
    ngram_range=(1, 2),
    max_features=20000,
    sublinear_tf=True
)

X_train_vec = vectorizer.fit_transform(X_train)
X_test_vec = vectorizer.transform(X_test)

# =========================
# MODELS
# =========================

models = {
    "Naive Bayes": MultinomialNB(),

    "Logistic Regression": LogisticRegression(
        max_iter=5000,
        class_weight="balanced",
        C=0.5
    ),

    "Linear SVM": LinearSVC(),

    "Random Forest": RandomForestClassifier(
        n_estimators=200,
        random_state=42
    )
}

# =========================
# EVALUATION
# =========================

results = []

for name, model in models.items():

    print(f"Training {name}...")

    model.fit(X_train_vec, y_train)

    predictions = model.predict(X_test_vec)

    accuracy = accuracy_score(y_test, predictions)

    f1 = f1_score(
        y_test,
        predictions,
        average="weighted"
    )

    results.append([
        name,
        round(accuracy, 4),
        round(f1, 4)
    ])

# =========================
# RESULTS TABLE
# =========================

results_df = pd.DataFrame(
    results,
    columns=[
        "Model",
        "Accuracy",
        "Weighted F1"
    ]
)

results_df = results_df.sort_values(
    by="Weighted F1",
    ascending=False
)

print("\n🏆 MODEL COMPARISON\n")
print(results_df.to_string(index=False))