from models.model_architecture import build_model
from utils.data_loader import load_data
import tensorflow as tf

DATA_DIR = "data"

# Load data
train_ds, val_ds, class_names = load_data(DATA_DIR)

print("Classes:", class_names)

# Build model
model = build_model(num_classes=len(class_names))

# Compile
model.compile(
    optimizer="adam",
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"]
)

# Train
history = model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=5
)

# Save model
model.save("saved_models/skin_disease_model.h5")

print("Model training complete ✔")