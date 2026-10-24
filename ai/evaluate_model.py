"""
AI Smart Fire Alert System - Model Evaluation Script
Computes precision, recall, F1-score, and confusion matrix on test dataset.
"""

import os
import pickle
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
import tensorflow as tf

def evaluate_fire_model(
    dataset_path="fire_dataset.csv",
    model_path="fire_dnn_model.keras",
    scaler_path="scaler.pkl",
    cm_plot_path="confusion_matrix.png"
):
    print("=" * 60)
    print("Evaluating Trained Fire Classification DNN")
    print("=" * 60)

    # 1. Load test data
    df = pd.read_csv(dataset_path)
    X = df[['temperature', 'humidity', 'smoke', 'flame']].values
    y = df['label'].values

    _, X_test, _, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    # 2. Load Scaler and Model
    with open(scaler_path, 'rb') as f:
        scaler = pickle.load(f)
    model = tf.keras.models.load_model(model_path)

    # 3. Predict on Test Set
    X_test_scaled = scaler.transform(X_test)
    y_probs = model.predict(X_test_scaled)
    y_pred = np.argmax(y_probs, axis=1)

    # 4. Metrics
    target_names = ['SAFE (0)', 'WARNING (1)', 'DANGER (2)']
    report = classification_report(y_test, y_pred, target_names=target_names)
    cm = confusion_matrix(y_test, y_pred)

    print("\nDetailed Classification Report:")
    print(report)

    print("\nConfusion Matrix:")
    print(cm)

    # 5. Plot and save confusion matrix
    plt.figure(figsize=(6, 5))
    plt.imshow(cm, interpolation='nearest', cmap=plt.cm.Blues)
    plt.title('Confusion Matrix - DNN Fire Classifier', fontsize=12)
    plt.colorbar()
    tick_marks = np.arange(len(target_names))
    plt.xticks(tick_marks, target_names, rotation=25)
    plt.yticks(tick_marks, target_names)

    # Add numeric labels to cells
    thresh = cm.max() / 2.0
    for i in range(cm.shape[0]):
        for j in range(cm.shape[1]):
            plt.text(
                j, i, format(cm[i, j], 'd'),
                horizontalalignment="center",
                color="white" if cm[i, j] > thresh else "black",
                fontweight='bold'
            )

    plt.ylabel('True Class')
    plt.xlabel('Predicted Class')
    plt.tight_layout()
    plt.savefig(cm_plot_path, dpi=200)
    plt.close()

    print(f"\nConfusion matrix visualization saved to: {cm_plot_path}")
    print("=" * 60)

if __name__ == "__main__":
    evaluate_fire_model()
