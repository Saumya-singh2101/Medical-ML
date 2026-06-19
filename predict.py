import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import load_img, img_to_array

model = load_model("skin_disease_model.h5")

img = load_img("test.jpg", target_size=(224,224))
img = img_to_array(img)
img = img / 255.0
img = np.expand_dims(img, axis=0)

pred = model.predict(img)

classes = ["acne", "eczema", "normal"]

print("Prediction:", classes[np.argmax(pred)])
print("Confidence:", np.max(pred))