import numpy as np
import os
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import load_img, img_to_array

from sklearn.metrics import accuracy_score, confusion_matrix, classification_report
import seaborn as sns
import matplotlib.pyplot as plt

# ----------------------------
# 1. LOAD MODEL
# ----------------------------
model = load_model("skin_disease_model.h5")

# ----------------------------
# 2. DEFINE CLASSES
# (must match training order)
# ----------------------------
classes = ["acne", "eczema", "normal"]

# ----------------------------
# 3. LOAD TEST DATASET
# EXPECTED STRUCTURE:
# test/
#   acne/
#   eczema/
#   normal/
# ----------------------------
test_dir = "data/test"

y_true = []
y_pred = []

# ----------------------------
# 4. LOOP THROUGH TEST IMAGES
# ----------------------------
for class_name in classes:
    folder_path = os.path.join(test_dir, class_name)

    for img_name in os.listdir(folder_path):
        img_path = os.path.join(folder_path, img_name)

        # load image
        img = load_img(img_path, target_size=(224, 224))
        img = img_to_array(img)
        img = img / 255.0
        img = np.expand_dims(img, axis=0)

        # predict
        pred = model.predict(img, verbose=0)
        predicted_class = classes[np.argmax(pred)]

        # store results
        y_true.append(class_name)
        y_pred.append(predicted_class)

# ----------------------------
# 5. ACCURACY
# ----------------------------
acc = accuracy_score(y_true, y_pred)
print("\n🔥 Accuracy:", acc)

# ----------------------------
# 6. CLASSIFICATION REPORT
# ----------------------------
print("\n📊 Classification Report:")
print(classification_report(y_true, y_pred))

# ----------------------------
# 7. CONFUSION MATRIX
# ----------------------------
cm = confusion_matrix(y_true, y_pred)

plt.figure(figsize=(6, 5))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
            xticklabels=classes,
            yticklabels=classes)

plt.xlabel("Predicted Label")
plt.ylabel("True Label")
plt.title("Confusion Matrix")
plt.show()