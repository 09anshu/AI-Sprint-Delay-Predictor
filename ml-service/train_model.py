"""
train_model.py — Train a Random Forest classifier for sprint delay prediction.

Uses the project_risk_raw_dataset.csv to train a model that predicts:
  - Whether a sprint will be delayed (Delayed / Not Delayed)
  - Severity level (Low / Medium / High)

The trained model and label encoders are saved for use by the Flask API.
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, accuracy_score
import joblib
import os

# ─── Load Dataset ───────────────────────────────────────────────────────────────
print("📂 Loading dataset...")
dataset_path = os.path.join(os.path.dirname(__file__), '..', 'project_risk_raw_dataset.csv')
df = pd.read_csv(dataset_path)
print(f"   Loaded {len(df)} records with {len(df.columns)} columns")

# ─── Feature Engineering ────────────────────────────────────────────────────────
# Select features that map to sprint-related inputs
features = [
    'Team_Size',
    'Estimated_Timeline_Months',       # maps to sprint duration
    'Complexity_Score',                 # maps to story points complexity
    'Historical_Risk_Incidents',       # maps to bugs count
    'External_Dependencies_Count',     # maps to dependencies
    'Stakeholder_Count',
    'Change_Request_Frequency',
    'Team_Turnover_Rate',
    'Vendor_Reliability_Score',
    'Budget_Utilization_Rate',
]

target = 'Risk_Level'

print(f"\n📊 Features: {features}")
print(f"   Target: {target}")
print(f"   Target distribution:\n{df[target].value_counts()}")

# ─── Prepare Data ───────────────────────────────────────────────────────────────
X = df[features].copy()
y = df[target].copy()

# Encode target labels: Low=0, Medium=1, High=2, Critical=3
label_encoder = LabelEncoder()
label_encoder.fit(['Low', 'Medium', 'High', 'Critical'])
y_encoded = label_encoder.transform(y)

# ─── Split Data ─────────────────────────────────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
)
print(f"\n✂️  Train: {len(X_train)} | Test: {len(X_test)}")

# ─── Train Model ────────────────────────────────────────────────────────────────
print("\n🤖 Training Random Forest Classifier...")
model = RandomForestClassifier(
    n_estimators=200,
    max_depth=15,
    min_samples_split=5,
    min_samples_leaf=2,
    random_state=42,
    n_jobs=-1
)
model.fit(X_train, y_train)

# ─── Evaluate ───────────────────────────────────────────────────────────────────
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"\n📈 Model Accuracy: {accuracy:.4f} ({accuracy*100:.1f}%)")
print("\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=label_encoder.classes_))

# ─── Feature Importance ─────────────────────────────────────────────────────────
importances = model.feature_importances_
print("\n🔍 Feature Importances:")
for feat, imp in sorted(zip(features, importances), key=lambda x: x[1], reverse=True):
    print(f"   {feat}: {imp:.4f}")

# ─── Save Model & Encoders ─────────────────────────────────────────────────────
model_dir = os.path.dirname(__file__)
joblib.dump(model, os.path.join(model_dir, 'model.pkl'))
joblib.dump(label_encoder, os.path.join(model_dir, 'label_encoder.pkl'))
joblib.dump(features, os.path.join(model_dir, 'features.pkl'))

print("\n✅ Model saved to ml-service/model.pkl")
print("✅ Label encoder saved to ml-service/label_encoder.pkl")
print("✅ Features list saved to ml-service/features.pkl")
print("\n🎉 Training complete! Run 'python app.py' to start the prediction API.")
