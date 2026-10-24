"""
AI Smart Fire Alert System - DNN Model Training Script
Trains a Deep Neural Network (DNN) with TensorFlow / Keras for Zone 1 fire classification.
"""

import os
import pickle
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

def train_fire_model(
    dataset_path="fire_dataset.csv",
    model_save_path="fire_dnn_model.keras",
    scaler_save_path="scaler.pkl",
    plot_save_path="training_history.png"
):
    print("=" * 60)
    print("Starting Deep Neural Network Training for Fire Classification")
    print("=" * 60)
    
    if not os.path.exists(dataset_path):
        from generate_dataset import generate_fire_dataset
        print(f"Dataset {dataset_path} not found. Generating now...")
        generate_fire_dataset(output_path=dataset_path)

    # 1. Load dataset
    df = pd.read_csv(dataset_path)
    X = df[['temperature', 'humidity', 'smoke', 'flame']].values
    y = df['label'].values
    
    print(f"Loaded {len(df)} samples across 4 features: [temperature, humidity, smoke, flame]")

    # 2. Split into Train (80%) and Test (20%)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    print(f"Training set: {len(X_train)} samples | Testing set: {len(X_test)} samples")

    # 3. Feature Scaling (StandardScaler)
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Save scaler for real-time inference
    with open(scaler_save_path, 'wb') as f:
        pickle.dump(scaler, f)
    print(f"StandardScaler saved to: {scaler_save_path}")

    # 4. Build Keras Feed-Forward DNN Architecture
    # Input (4) -> Dense(32, ReLU) -> Dropout(0.2) -> Dense(16, ReLU) -> Dense(3, Softmax)
    model = keras.Sequential([
        layers.Input(shape=(4,)),
        layers.Dense(32, activation='relu', name='hidden_layer_1'),
        layers.Dropout(0.15, name='dropout_1'),
        layers.Dense(16, activation='relu', name='hidden_layer_2'),
        layers.Dense(3, activation='softmax', name='output_softmax')
    ])

    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=0.002),
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy']
    )

    model.summary()

    # 5. Train Model
    epochs = 25
    batch_size = 32
    print(f"\nTraining DNN for {epochs} epochs...")
    history = model.fit(
        X_train_scaled, y_train,
        validation_data=(X_test_scaled, y_test),
        epochs=epochs,
        batch_size=batch_size,
        verbose=1
    )

    # 6. Evaluate on Test Set
    test_loss, test_acc = model.evaluate(X_test_scaled, y_test, verbose=0)
    print("\n" + "=" * 60)
    print(f"Model Evaluation on Independent Test Set:")
    print(f"Test Accuracy: {test_acc * 100:.2f}%")
    print(f"Test Loss:     {test_loss:.4f}")
    print("=" * 60)

    # 7. Save Model
    model.save(model_save_path)
    print(f"Trained DNN model saved to: {model_save_path}")

    # 8. Save Training History Curves
    plt.figure(figsize=(10, 4))

    # Accuracy Plot
    plt.subplot(1, 2, 1)
    plt.plot(history.history['accuracy'], label='Train Accuracy', color='#10b981', linewidth=2)
    plt.plot(history.history['val_accuracy'], label='Val Accuracy', color='#06b6d4', linewidth=2, linestyle='--')
    plt.title('DNN Accuracy over Epochs')
    plt.xlabel('Epoch')
    plt.ylabel('Accuracy')
    plt.legend()
    plt.grid(True, alpha=0.3)

    # Loss Plot
    plt.subplot(1, 2, 2)
    plt.plot(history.history['loss'], label='Train Loss', color='#ef4444', linewidth=2)
    plt.plot(history.history['val_loss'], label='Val Loss', color='#f59e0b', linewidth=2, linestyle='--')
    plt.title('DNN Loss over Epochs')
    plt.xlabel('Epoch')
    plt.ylabel('Loss')
    plt.legend()
    plt.grid(True, alpha=0.3)

    plt.tight_layout()
    plt.savefig(plot_save_path, dpi=200)
    plt.close()
    print(f"Training curves saved to: {plot_save_path}")

    return model, scaler

if __name__ == "__main__":
    train_fire_model()
