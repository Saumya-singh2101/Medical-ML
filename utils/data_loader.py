import tensorflow as tf

IMG_SIZE = (224, 224)
BATCH_SIZE = 32

def load_data(data_dir):

    # Load train dataset
    train_ds_raw = tf.keras.preprocessing.image_dataset_from_directory(
        data_dir + "/train",
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE
    )

    # Load val dataset
    val_ds_raw = tf.keras.preprocessing.image_dataset_from_directory(
        data_dir + "/val",
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE
    )

    # IMPORTANT: store class names BEFORE tf.data operations
    class_names = train_ds_raw.class_names

    # Normalization layer
    normalization = tf.keras.layers.Rescaling(1./255)

    train_ds = train_ds_raw.map(lambda x, y: (normalization(x), y))
    val_ds = val_ds_raw.map(lambda x, y: (normalization(x), y))

    # Performance optimization
    train_ds = train_ds.cache().prefetch(tf.data.AUTOTUNE)
    val_ds = val_ds.cache().prefetch(tf.data.AUTOTUNE)

    return train_ds, val_ds, class_names