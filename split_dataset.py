import os
import shutil
import random

# Paths
DATA_DIR = "data"
CLASSES = ["acne", "eczema", "normal"]

# Only valid image formats
VALID_EXTENSIONS = (".png", ".jpg", ".jpeg", ".webp")

# Split ratios
SPLIT_RATIO = {
    "train": 0.7,
    "val": 0.15,
    "test": 0.15
}

def create_dir(path):
    if not os.path.exists(path):
        os.makedirs(path)

def get_images(folder_path):
    """Return only valid image files (ignore folders like 'datasets')"""
    return [
        f for f in os.listdir(folder_path)
        if os.path.isfile(os.path.join(folder_path, f))  # must be a file
        and f.lower().endswith(VALID_EXTENSIONS)
    ]

def split_data():
    for cls in CLASSES:
        class_path = os.path.join(DATA_DIR, cls)

        if not os.path.exists(class_path):
            print(f"Skipping missing folder: {class_path}")
            continue

        images = get_images(class_path)

        if len(images) == 0:
            print(f"No images found in {cls}")
            continue

        random.shuffle(images)

        train_end = int(len(images) * SPLIT_RATIO["train"])
        val_end = int(len(images) * (SPLIT_RATIO["train"] + SPLIT_RATIO["val"]))

        train_imgs = images[:train_end]
        val_imgs = images[train_end:val_end]
        test_imgs = images[val_end:]

        for split_name, split_imgs in zip(
            ["train", "val", "test"],
            [train_imgs, val_imgs, test_imgs]
        ):
            split_class_dir = os.path.join(DATA_DIR, split_name, cls)
            create_dir(split_class_dir)

            for img in split_imgs:
                src = os.path.join(class_path, img)
                dst = os.path.join(split_class_dir, img)

                try:
                    shutil.copy(src, dst)
                except Exception as e:
                    print(f"Skipping {src} due to error: {e}")

        print(f"{cls} done → train:{len(train_imgs)} val:{len(val_imgs)} test:{len(test_imgs)}")

if __name__ == "__main__":
    split_data()