import matplotlib.pyplot as plt
import tensorflow as tf

DATA_DIR = "data/train"   # use train set for visualization
IMG_SIZE = (224, 224)
BATCH_SIZE = 32

# Load dataset
dataset = tf.keras.preprocessing.image_dataset_from_directory(
    DATA_DIR,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE
)

class_names = dataset.class_names
print("Classes:", class_names)

# Take one batch
for images, labels in dataset.take(1):
    plt.figure(figsize=(10, 10))

    for i in range(9):  # show 9 images
        ax = plt.subplot(3, 3, i + 1)
        plt.imshow(images[i].numpy().astype("uint8"))
        plt.title(class_names[labels[i]])
        plt.axis("off")

    plt.show()