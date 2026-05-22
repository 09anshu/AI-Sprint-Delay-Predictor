"""
app.py — Flask API for sprint delay prediction.

Endpoints:
  POST /predict — Accepts sprint parameters, returns delay prediction.
  GET  /health  — Health check endpoint.

Expected Input (JSON):
  {
    "teamSize": 10,
    "sprintDuration": 14,
    "storyPoints": 50,
    "bugs": 5,
    "riskLevel": "Medium",
    "dependencies": 3
  }

Output (JSON):
  {
    "delayed": true,
    "label": "Delayed",
    "severity": "High",
    "confidence": 0.85,
    "riskLevel": "High"
  }
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os

app = Flask(__name__)
CORS(app)

# ─── Load Model & Artifacts ────────────────────────────────────────────────────
model_dir = os.path.dirname(__file__)
model = joblib.load(os.path.join(model_dir, 'model.pkl'))
label_encoder = joblib.load(os.path.join(model_dir, 'label_encoder.pkl'))
feature_names = joblib.load(os.path.join(model_dir, 'features.pkl'))

print(f"[OK] Model loaded with features: {feature_names}")


def map_risk_level_to_numeric(risk_level):
    """Map text risk level to numeric value for features that need it."""
    mapping = {'Low': 0.2, 'Medium': 0.5, 'High': 0.8, 'Critical': 1.0}
    return mapping.get(risk_level, 0.5)


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({'status': 'ok', 'model': 'loaded'})


@app.route('/predict', methods=['POST'])
def predict():
    """
    Predict sprint delay based on input parameters.
    
    Maps user-friendly sprint inputs to the model's expected features:
      - Team_Size ← teamSize
      - Estimated_Timeline_Months ← sprintDuration (days → normalized)
      - Complexity_Score ← storyPoints (normalized to 1-10 scale)
      - Historical_Risk_Incidents ← bugs
      - External_Dependencies_Count ← dependencies
      - Stakeholder_Count ← derived from team size
      - Change_Request_Frequency ← derived from risk level
      - Team_Turnover_Rate ← moderate default
      - Vendor_Reliability_Score ← inverse of risk
      - Budget_Utilization_Rate ← derived
    """
    try:
        data = request.get_json()
        
        # Extract input parameters
        team_size = int(data.get('teamSize', 5))
        sprint_duration = int(data.get('sprintDuration', 14))
        story_points = int(data.get('storyPoints', 30))
        bugs = int(data.get('bugs', 0))
        risk_level = data.get('riskLevel', 'Medium')
        dependencies = int(data.get('dependencies', 0))
        
        risk_numeric = map_risk_level_to_numeric(risk_level)
        
        # Map sprint inputs to model features
        # Feature order must match training: features list
        feature_values = [
            team_size,                                    # Team_Size
            sprint_duration / 30.0 * 12,                  # Estimated_Timeline_Months (normalize days to months scale)
            min(story_points / 10.0, 10.0),               # Complexity_Score (normalize to 1-10)
            bugs,                                          # Historical_Risk_Incidents
            dependencies,                                  # External_Dependencies_Count
            max(3, team_size // 2),                        # Stakeholder_Count (derived)
            bugs * 0.3 + risk_numeric * 2,                 # Change_Request_Frequency (derived)
            risk_numeric * 0.5,                            # Team_Turnover_Rate (derived from risk)
            1.0 - risk_numeric * 0.5,                      # Vendor_Reliability_Score (inverse of risk)
            0.7 + risk_numeric * 0.3,                      # Budget_Utilization_Rate (derived)
        ]
        
        # Reshape for prediction as DataFrame
        import pandas as pd
        X = pd.DataFrame([feature_values], columns=feature_names)
        
        # Get prediction and probabilities
        prediction = model.predict(X)[0]
        probabilities = model.predict_proba(X)[0]
        confidence = float(np.max(probabilities))
        
        # Decode prediction
        risk_label = label_encoder.inverse_transform([prediction])[0]
        
        # Map to delay prediction
        delayed = risk_label in ['High', 'Critical']
        
        # Map to severity
        severity_map = {'Low': 'Low', 'Medium': 'Medium', 'High': 'High', 'Critical': 'High'}
        severity = severity_map.get(risk_label, 'Medium')
        
        # Build response
        response = {
            'delayed': delayed,
            'label': 'Delayed' if delayed else 'Not Delayed',
            'severity': severity,
            'confidence': round(confidence, 2),
            'riskLevel': risk_label,
            'probabilities': {
                label: round(float(prob), 3)
                for label, prob in zip(label_encoder.classes_, probabilities)
            }
        }
        
        print(f"[PREDICTION] Prediction: {response['label']} | Severity: {severity} | Confidence: {confidence:.2f}")
        return jsonify(response)
        
    except Exception as e:
        print(f"[ERROR] Error: {str(e)}")
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    print("[START] Starting ML Prediction API on port 5001...")
    app.run(host='0.0.0.0', port=5001, debug=True)
