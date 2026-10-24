"""
AI Smart Fire Alert System - Dataset Generation Script
Generates a realistic simulated dataset for training the Zone 1 Fire Classification DNN.

Features:
- temperature (°C): Ambient and elevated thermal readings
- humidity (%): Relative humidity levels
- smoke (PPM): MQ-2 gas sensor concentration
- flame (0 or 1): Optical infrared detector (0 = absent, 1 = detected)

Labels:
- 0 = SAFE
- 1 = WARNING
- 2 = DANGER
"""

import numpy as np
import pandas as pd
import os

def generate_fire_dataset(num_samples_per_class=1000, output_path="fire_dataset.csv"):
    np.random.seed(42)
    
    # -------------------------------------------------------------
    # 1. SAFE CLASS (Label = 0)
    # Normal room temperature, typical humidity, clean air, no flame
    # -------------------------------------------------------------
    temp_safe = np.random.normal(loc=24.5, scale=3.0, size=num_samples_per_class)
    temp_safe = np.clip(temp_safe, 16.0, 32.0)
    
    hum_safe = np.random.normal(loc=60.0, scale=6.0, size=num_samples_per_class)
    hum_safe = np.clip(hum_safe, 45.0, 85.0)
    
    smoke_safe = np.random.normal(loc=115.0, scale=25.0, size=num_samples_per_class)
    smoke_safe = np.clip(smoke_safe, 40.0, 220.0)
    
    flame_safe = np.zeros(num_samples_per_class, dtype=int)
    label_safe = np.zeros(num_samples_per_class, dtype=int)
    
    df_safe = pd.DataFrame({
        'temperature': np.round(temp_safe, 1),
        'humidity': np.round(hum_safe, 1),
        'smoke': np.round(smoke_safe).astype(int),
        'flame': flame_safe,
        'label': label_safe
    })
    
    # -------------------------------------------------------------
    # 2. WARNING CLASS (Label = 1)
    # Pre-combustion or abnormal condition: elevated temp, moderate smoke, low hum, usually no flame
    # -------------------------------------------------------------
    temp_warn = np.random.normal(loc=42.0, scale=3.5, size=num_samples_per_class)
    temp_warn = np.clip(temp_warn, 35.0, 49.0)
    
    hum_warn = np.random.normal(loc=38.0, scale=4.5, size=num_samples_per_class)
    hum_warn = np.clip(hum_warn, 28.0, 45.0)
    
    smoke_warn = np.random.normal(loc=420.0, scale=60.0, size=num_samples_per_class)
    smoke_warn = np.clip(smoke_warn, 260.0, 580.0)
    
    # 98% no flame, 2% rare momentary flicker
    flame_warn = np.random.choice([0, 1], size=num_samples_per_class, p=[0.98, 0.02])
    label_warn = np.ones(num_samples_per_class, dtype=int)
    
    df_warn = pd.DataFrame({
        'temperature': np.round(temp_warn, 1),
        'humidity': np.round(hum_warn, 1),
        'smoke': np.round(smoke_warn).astype(int),
        'flame': flame_warn,
        'label': label_warn
    })
    
    # -------------------------------------------------------------
    # 3. DANGER CLASS (Label = 2)
    # Critical fire condition: high temp, low humidity, heavy smoke, flame confirmed
    # -------------------------------------------------------------
    temp_danger = np.random.normal(loc=65.0, scale=6.0, size=num_samples_per_class)
    temp_danger = np.clip(temp_danger, 50.0, 95.0)
    
    hum_danger = np.random.normal(loc=22.0, scale=4.0, size=num_samples_per_class)
    hum_danger = np.clip(hum_danger, 10.0, 32.0)
    
    smoke_danger = np.random.normal(loc=820.0, scale=75.0, size=num_samples_per_class)
    smoke_danger = np.clip(smoke_danger, 600.0, 1000.0)
    
    # Flame confirmed in >95% of danger cases (or heavy smoke + extreme thermal spike)
    flame_danger = np.random.choice([1, 0], size=num_samples_per_class, p=[0.95, 0.05])
    label_danger = np.full(num_samples_per_class, 2, dtype=int)
    
    df_danger = pd.DataFrame({
        'temperature': np.round(temp_danger, 1),
        'humidity': np.round(hum_danger, 1),
        'smoke': np.round(smoke_danger).astype(int),
        'flame': flame_danger,
        'label': label_danger
    })
    
    # -------------------------------------------------------------
    # Combine and Shuffle
    # -------------------------------------------------------------
    df_combined = pd.concat([df_safe, df_warn, df_danger], ignore_index=True)
    df_combined = df_combined.sample(frac=1.0, random_state=42).reset_index(drop=True)
    
    df_combined.to_csv(output_path, index=False)
    print(f"Dataset successfully generated with {len(df_combined)} samples.")
    print(f"Saved to: {os.path.abspath(output_path)}")
    print("\nClass Distribution:")
    print(df_combined['label'].value_counts().rename({0: 'SAFE (0)', 1: 'WARNING (1)', 2: 'DANGER (2)'}))
    return df_combined

if __name__ == "__main__":
    generate_fire_dataset()
