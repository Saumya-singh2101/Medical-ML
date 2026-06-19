import tensorflow as tf
import numpy as np

model = tf.keras.models.load_model("saved_models/skin_disease_model.h5")

class_names = ["acne", "eczema", "normal"]

def predict_image(img_array):
    img_array = tf.image.resize(img_array, (224, 224))
    img_array = img_array / 255.0
    img_array = np.expand_dims(img_array, axis=0)

    prediction = model.predict(img_array)
    predicted_class = class_names[np.argmax(prediction)]

    return predicted_class

print("Model loaded successfully ✔")