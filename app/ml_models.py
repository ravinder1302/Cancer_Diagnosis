import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report
from sklearn.impute import SimpleImputer
import xgboost as xgb
import joblib
import os
from typing import Dict, List, Tuple, Any
import random
from datetime import datetime
import json

class CancerDiagnosisModels:
    """Machine learning models for cancer diagnosis"""
    
    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.imputers = {}
        self.model_info = {}
        self.feature_names = [
            'radius_mean', 'texture_mean', 'perimeter_mean', 'area_mean',
            'smoothness_mean', 'compactness_mean', 'concavity_mean',
            'concave_points_mean', 'symmetry_mean', 'fractal_dimension_mean',
            'radius_se', 'texture_se', 'perimeter_se', 'area_se',
            'smoothness_se', 'compactness_se', 'concavity_se',
            'concave_points_se', 'symmetry_se', 'fractal_dimension_se',
            'radius_worst', 'texture_worst', 'perimeter_worst', 'area_worst',
            'smoothness_worst', 'compactness_worst', 'concavity_worst',
            'concave_points_worst', 'symmetry_worst', 'fractal_dimension_worst'
        ]
        # New: Load guidelines for evidence-based recommendations
        self.guidelines = self.load_guidelines()
        
    def load_data(self, file_path: str = "Cancer_Data.csv") -> Tuple[pd.DataFrame, pd.Series]:
        """Load and preprocess the cancer dataset"""
        # Read CSV and handle any extra columns
        df = pd.read_csv(file_path)
        
        # Remove any unnamed columns (like Unnamed: 32)
        unnamed_cols = [col for col in df.columns if 'Unnamed' in col]
        if unnamed_cols:
            print(f"Removing unnamed columns: {unnamed_cols}")
            df = df.drop(columns=unnamed_cols)
        
        # Check for missing values
        missing_values = df.isnull().sum()
        if missing_values.sum() > 0:
            print(f"Found missing values: {missing_values[missing_values > 0]}")
        
        # Convert diagnosis to binary (M=1, B=0)
        df['diagnosis'] = (df['diagnosis'] == 'M').astype(int)
        
        # Separate features and target
        X = df.drop(['id', 'diagnosis'], axis=1)
        y = df['diagnosis']
        
        # Handle any missing values in features
        if X.isnull().sum().sum() > 0:
            print("Handling missing values in features...")
            imputer = SimpleImputer(strategy='mean')
            X = pd.DataFrame(imputer.fit_transform(X), columns=X.columns, index=X.index)
        
        # Ensure all data is numeric
        X = X.astype(float)
        
        # Remove any infinite values
        X = X.replace([np.inf, -np.inf], np.nan)
        if X.isnull().sum().sum() > 0:
            imputer = SimpleImputer(strategy='mean')
            X = pd.DataFrame(imputer.fit_transform(X), columns=X.columns, index=X.index)
        
        print(f"Data loaded: {X.shape[0]} samples, {X.shape[1]} features")
        print(f"Target distribution: {y.value_counts().to_dict()}")
        
        return X, y
    
    def create_synthetic_labels(self, y: pd.Series) -> Dict[str, pd.Series]:
        """Create synthetic labels for additional prediction tasks"""
        np.random.seed(42)
        random.seed(42)
        
        labels = {}
        
        # Cancer type (synthetic based on features)
        cancer_types = ['Ductal Carcinoma', 'Lobular Carcinoma', 'Inflammatory Breast Cancer', 'Paget Disease']
        labels['cancer_type'] = pd.Series(np.random.choice(cancer_types, size=len(y)), index=y.index)
        
        # Metastasis status
        metastasis = ['Primary', 'Metastatic']
        labels['metastasis'] = pd.Series(np.random.choice(metastasis, size=len(y), p=[0.8, 0.2]), index=y.index)
        
        # Tissue change
        tissue_changes = ['Hyperplasia', 'Dysplasia', 'Carcinoma in situ']
        labels['tissue_change'] = pd.Series(np.random.choice(tissue_changes, size=len(y)), index=y.index)
        
        # Prognosis (based on diagnosis)
        prognosis = []
        for diagnosis in y:
            if diagnosis == 1:  # Malignant
                prognosis.append(np.random.choice(['Poor', 'Fair', 'Good'], p=[0.4, 0.4, 0.2]))
            else:  # Benign
                prognosis.append(np.random.choice(['Excellent', 'Good'], p=[0.7, 0.3]))
        labels['prognosis'] = pd.Series(prognosis, index=y.index)
        
        return labels
    
    def train_models(self, X: pd.DataFrame, y: pd.Series) -> Dict[str, Any]:
        """Train all models for different prediction tasks"""
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Create synthetic labels
        synthetic_labels = self.create_synthetic_labels(y)
        
        # Train models for each task
        tasks = {
            'diagnosis': y,
            'cancer_type': synthetic_labels['cancer_type'],
            'metastasis': synthetic_labels['metastasis'],
            'tissue_change': synthetic_labels['tissue_change'],
            'prognosis': synthetic_labels['prognosis']
        }
        
        results = {}
        
        for task_name, task_y in tasks.items():
            print(f"Training {task_name} model...")
            
            # Split for this task
            X_train_task, X_test_task, y_train_task, y_test_task = train_test_split(
                X, task_y, test_size=0.2, random_state=42
            )
            
            # Handle missing values if any
            if X_train_task.isnull().sum().sum() > 0:
                imputer = SimpleImputer(strategy='mean')
                X_train_task = pd.DataFrame(imputer.fit_transform(X_train_task), columns=X_train_task.columns, index=X_train_task.index)
                X_test_task = pd.DataFrame(imputer.transform(X_test_task), columns=X_test_task.columns, index=X_test_task.index)
                self.imputers[task_name] = imputer
            
            # Scale features
            scaler = StandardScaler()
            X_train_scaled = scaler.fit_transform(X_train_task)
            X_test_scaled = scaler.transform(X_test_task)
            
            # Choose model based on task
            if task_name == 'diagnosis':
                model = xgb.XGBClassifier(random_state=42, n_estimators=100)
            else:
                model = RandomForestClassifier(n_estimators=100, random_state=42)
            
            # Train model
            model.fit(X_train_scaled, y_train_task)
            
            # Evaluate
            y_pred = model.predict(X_test_scaled)
            y_pred_proba = model.predict_proba(X_test_scaled)
            
            # Calculate metrics
            accuracy = accuracy_score(y_test_task, y_pred)
            precision = precision_score(y_test_task, y_pred, average='weighted')
            recall = recall_score(y_test_task, y_pred, average='weighted')
            f1 = f1_score(y_test_task, y_pred, average='weighted')
            
            # Store results
            self.models[task_name] = model
            self.scalers[task_name] = scaler
            
            results[task_name] = {
                'accuracy': accuracy,
                'precision': precision,
                'recall': recall,
                'f1_score': f1,
                'classes': model.classes_.tolist() if hasattr(model, 'classes_') else None
            }
            
            print(f"{task_name} - Accuracy: {accuracy:.3f}, F1: {f1:.3f}")
        
        return results
    
    def predict_diagnosis(self, features: np.ndarray) -> Dict[str, Any]:
        """Predict cancer diagnosis"""
        # Debug: print input features
        print("[DEBUG] Input features for diagnosis prediction:")
        print(features)
        if 'diagnosis' not in self.models:
            raise ValueError("Diagnosis model not trained")
        # Ensure features is a DataFrame with correct columns
        if isinstance(features, np.ndarray):
            features = pd.DataFrame(features, columns=self.feature_names)
        print("[DEBUG] DataFrame columns:", features.columns.tolist())
        features_scaled = self.scalers['diagnosis'].transform(features)
        print("[DEBUG] features_scaled shape:", features_scaled.shape)
        print("[DEBUG] Model predict output:", self.models['diagnosis'].predict(features_scaled))
        print("[DEBUG] Model predict_proba output:", self.models['diagnosis'].predict_proba(features_scaled))
        
        # Predict
        prediction = self.models['diagnosis'].predict(features_scaled)[0]
        probabilities = self.models['diagnosis'].predict_proba(features_scaled)[0]
        
        # Map prediction
        diagnosis_map = {0: 'Benign', 1: 'Malignant'}
        prediction_label = diagnosis_map[prediction]
        
        # Calculate confidence
        confidence = max(probabilities)
        
        # Determine risk level
        if prediction_label == 'Malignant':
            if confidence > 0.9:
                risk_level = "High Risk"
                recommendations = [
                    "Immediate consultation with oncologist",
                    "Biopsy confirmation required",
                    "Consider imaging studies (MRI, CT scan)",
                    "Genetic counseling recommended"
                ]
            else:
                risk_level = "Moderate Risk"
                recommendations = [
                    "Follow-up with specialist",
                    "Additional diagnostic tests",
                    "Regular monitoring required"
                ]
        else:
            if confidence > 0.9:
                risk_level = "Low Risk"
                recommendations = [
                    "Regular follow-up in 6 months",
                    "Continue routine screening",
                    "Monitor for any changes"
                ]
            else:
                risk_level = "Uncertain"
                recommendations = [
                    "Additional testing recommended",
                    "Close monitoring required",
                    "Consider second opinion"
                ]
        
        return {
            'prediction': prediction_label,
            'confidence': float(confidence),
            'probability': {
                'benign': float(probabilities[0]),
                'malignant': float(probabilities[1])
            },
            'risk_level': risk_level,
            'recommendations': recommendations
        }
    
    def predict_cancer_type(self, features: np.ndarray) -> Dict[str, Any]:
        """Predict cancer type"""
        if 'cancer_type' not in self.models:
            raise ValueError("Cancer type model not trained")
        if isinstance(features, np.ndarray):
            features = pd.DataFrame(features, columns=self.feature_names)
        features_scaled = self.scalers['cancer_type'].transform(features)
        prediction = self.models['cancer_type'].predict(features_scaled)[0]
        probabilities = self.models['cancer_type'].predict_proba(features_scaled)[0]
        
        confidence = max(probabilities)
        
        # Cancer characteristics
        characteristics = {
            'Ductal Carcinoma': 'Most common type, originates in milk ducts',
            'Lobular Carcinoma': 'Originates in milk-producing glands',
            'Inflammatory Breast Cancer': 'Aggressive, affects skin and lymph vessels',
            'Paget Disease': 'Rare, affects nipple and areola'
        }
        
        return {
            'prediction': prediction,
            'confidence': float(confidence),
            'probability': dict(zip(self.models['cancer_type'].classes_, probabilities)),
            'characteristics': {prediction: characteristics.get(prediction, 'Unknown characteristics')}
        }
    
    def predict_metastasis(self, features: np.ndarray) -> Dict[str, Any]:
        """Predict metastasis status"""
        if 'metastasis' not in self.models:
            raise ValueError("Metastasis model not trained")
        if isinstance(features, np.ndarray):
            features = pd.DataFrame(features, columns=self.feature_names)
        features_scaled = self.scalers['metastasis'].transform(features)
        prediction = self.models['metastasis'].predict(features_scaled)[0]
        probabilities = self.models['metastasis'].predict_proba(features_scaled)[0]
        
        confidence = max(probabilities)
        
        # Determine stage and spread risk
        if prediction == 'Metastatic':
            stage = "Stage IV"
            spread_risk = "High - Cancer has spread to distant organs"
        else:
            stage = "Stage I-III"
            spread_risk = "Low - Cancer localized to primary site"
        
        return {
            'prediction': prediction,
            'confidence': float(confidence),
            'probability': dict(zip(self.models['metastasis'].classes_, probabilities)),
            'stage': stage,
            'spread_risk': spread_risk
        }
    
    def predict_tissue_change(self, features: np.ndarray) -> Dict[str, Any]:
        """Predict tissue change type"""
        if 'tissue_change' not in self.models:
            raise ValueError("Tissue change model not trained")
        if isinstance(features, np.ndarray):
            features = pd.DataFrame(features, columns=self.feature_names)
        features_scaled = self.scalers['tissue_change'].transform(features)
        prediction = self.models['tissue_change'].predict(features_scaled)[0]
        probabilities = self.models['tissue_change'].predict_proba(features_scaled)[0]
        
        confidence = max(probabilities)
        
        # Determine severity and progression risk
        severity_map = {
            'Hyperplasia': 'Mild',
            'Dysplasia': 'Moderate',
            'Carcinoma in situ': 'Severe'
        }
        
        progression_map = {
            'Hyperplasia': 'Low risk of progression',
            'Dysplasia': 'Moderate risk of progression',
            'Carcinoma in situ': 'High risk of progression to invasive cancer'
        }
        
        return {
            'prediction': prediction,
            'confidence': float(confidence),
            'probability': dict(zip(self.models['tissue_change'].classes_, probabilities)),
            'severity': severity_map.get(prediction, 'Unknown'),
            'progression_risk': progression_map.get(prediction, 'Unknown')
        }
    
    def predict_prognosis(self, features: np.ndarray) -> Dict[str, Any]:
        """Predict prognosis"""
        if 'prognosis' not in self.models:
            raise ValueError("Prognosis model not trained")
        if isinstance(features, np.ndarray):
            features = pd.DataFrame(features, columns=self.feature_names)
        features_scaled = self.scalers['prognosis'].transform(features)
        prediction = self.models['prognosis'].predict(features_scaled)[0]
        probabilities = self.models['prognosis'].predict_proba(features_scaled)[0]
        
        confidence = max(probabilities)
        
        # Survival rates and monitoring
        survival_rates = {
            'Excellent': 0.98,
            'Good': 0.85,
            'Fair': 0.65,
            'Poor': 0.35
        }
        
        monitoring_schedules = {
            'Excellent': 'Annual screening',
            'Good': '6-month follow-up',
            'Fair': '3-month monitoring',
            'Poor': 'Monthly monitoring'
        }
        
        risk_factors = [
            'Age over 50',
            'Family history',
            'Previous cancer diagnosis',
            'Lifestyle factors'
        ]
        
        return {
            'prediction': prediction,
            'confidence': float(confidence),
            'survival_rate': survival_rates.get(prediction, 0.5),
            'risk_factors': risk_factors,
            'monitoring_schedule': monitoring_schedules.get(prediction, 'Individualized')
        }
    
    def load_guidelines(self, file_path: str = "guidelines.json") -> dict:
        """Load structured guideline data for evidence-based recommendations"""
        try:
            with open(file_path, "r") as f:
                guidelines = json.load(f)
            print(f"[INFO] Loaded guidelines from {file_path}")
            return guidelines
        except Exception as e:
            print(f"[WARN] Could not load guidelines: {e}")
            return {}

    def predict_therapy(self, diagnosis_result: Dict[str, Any]) -> Dict[str, Any]:
        """Recommend therapy based on diagnosis, using guidelines if available"""
        diagnosis = diagnosis_result['prediction']
        confidence = diagnosis_result['confidence']
        # Try evidence-based recommendation first
        guideline_key = f"{diagnosis}".lower()
        if self.guidelines and guideline_key in self.guidelines:
            print(f"[INFO] Using guideline-based therapy for {guideline_key}")
            return self.guidelines[guideline_key]
        # Fallback: current logic
        if diagnosis == 'Malignant':
            if confidence > 0.9:
                primary_treatment = "Surgery + Chemotherapy + Radiation"
                urgency = "Immediate"
                success_rate = 0.85
            else:
                primary_treatment = "Surgery + Targeted Therapy"
                urgency = "High Priority"
                success_rate = 0.75
        else:
            primary_treatment = "Active Surveillance"
            urgency = "Low Priority"
            success_rate = 0.95
        alternative_treatments = [
            "Immunotherapy",
            "Hormone Therapy",
            "Clinical Trials"
        ]
        side_effects = [
            "Fatigue",
            "Nausea",
            "Hair loss",
            "Immune suppression"
        ]
        return {
            'primary_treatment': primary_treatment,
            'alternative_treatments': alternative_treatments,
            'urgency': urgency,
            'success_rate': success_rate,
            'side_effects': side_effects
        }
    
    def predict_genetic(self, features: np.ndarray) -> Dict[str, Any]:
        print("[DEBUG] predict_genetic called")
        # Defensive: ensure features is a numpy array
        if isinstance(features, pd.DataFrame):
            features = features.values
        elif not isinstance(features, np.ndarray):
            features = np.array(features)
        
        mutations = []
        risk_genes = []

        if features[0, 0] > 15:
            mutations.append("BRCA1 mutation")
            risk_genes.append("BRCA1")
        if features[0, 1] > 20:
            mutations.append("BRCA2 mutation")
            risk_genes.append("BRCA2")
        if features[0, 2] > 100:
            mutations.append("TP53 mutation")
            risk_genes.append("TP53")
        if not mutations:
            mutations.append("No significant mutations detected")

        # Ensure all outputs are lists of strings
        mutations = [str(m) for m in mutations]
        risk_genes = [str(g) for g in risk_genes]

        if len(risk_genes) > 1:
            hereditary_risk = "High hereditary risk"
            family_screening = ["Immediate family screening recommended"]
        elif len(risk_genes) == 1:
            hereditary_risk = "Moderate hereditary risk"
            family_screening = ["Consider family screening"]
        else:
            hereditary_risk = "Low hereditary risk"
            family_screening = ["Routine family history assessment"]

        return {
            'mutations': mutations,
            'risk_genes': risk_genes,
            'hereditary_risk': hereditary_risk,
            'family_screening': family_screening
        }
    
    def predict_comprehensive(self, features: np.ndarray) -> Dict[str, Any]:
        """Make comprehensive predictions"""
        print("[DEBUG] Input features for comprehensive prediction:")
        print(features)
        if isinstance(features, np.ndarray):
            features = pd.DataFrame(features, columns=self.feature_names)
        print("[DEBUG] DataFrame columns:", features.columns.tolist())

        try:
            diagnosis = self.predict_diagnosis(features)
            print("[DEBUG] diagnosis:", diagnosis)
        except Exception as e:
            print("[ERROR] diagnosis failed:", e)
            raise

        try:
            cancer_type = self.predict_cancer_type(features)
            print("[DEBUG] cancer_type:", cancer_type)
        except Exception as e:
            print("[ERROR] cancer_type failed:", e)
            raise

        try:
            metastasis = self.predict_metastasis(features)
            print("[DEBUG] metastasis:", metastasis)
        except Exception as e:
            print("[ERROR] metastasis failed:", e)
            raise

        try:
            tissue_change = self.predict_tissue_change(features)
            print("[DEBUG] tissue_change:", tissue_change)
        except Exception as e:
            print("[ERROR] tissue_change failed:", e)
            raise

        try:
            prognosis = self.predict_prognosis(features)
            print("[DEBUG] prognosis:", prognosis)
        except Exception as e:
            print("[ERROR] prognosis failed:", e)
            raise

        try:
            therapy = self.predict_therapy(diagnosis)
            print("[DEBUG] therapy:", therapy)
        except Exception as e:
            print("[ERROR] therapy failed:", e)
            raise

        try:
            genetic = self.predict_genetic(features)
            print("[DEBUG] genetic:", genetic)
        except Exception as e:
            print("[ERROR] genetic failed:", e)
            raise

        # Defensive patch: guarantee all frontend-expected fields are present
        if 'subtypes' not in cancer_type or not isinstance(cancer_type['subtypes'], list):
            cancer_type['subtypes'] = []
        if 'locations' not in metastasis or not isinstance(metastasis['locations'], list):
            metastasis['locations'] = []
        therapy['recommendations'] = [therapy['primary_treatment']] + therapy.get('alternative_treatments', [])
        therapy['priority'] = therapy.get('urgency', '')
        therapy['timeline'] = 'Immediate' if therapy.get('urgency', '').lower().startswith('immediate') else 'Routine'
        genetic['risk_score'] = 1.0 if genetic.get('mutations') and genetic['mutations'][0] != 'No significant mutations detected' else 0.0
        confidence_score = diagnosis.get('confidence', 0.0)
        timestamp = datetime.now().isoformat()

        # Determine overall risk
        if diagnosis['prediction'] == 'Malignant' and diagnosis['confidence'] > 0.8:
            overall_risk = "High Risk"
            next_steps = [
                "Immediate consultation with oncologist",
                "Complete diagnostic workup",
                "Treatment planning",
                "Support services consultation"
            ]
        elif diagnosis['prediction'] == 'Malignant':
            overall_risk = "Moderate Risk"
            next_steps = [
                "Specialist consultation",
                "Additional diagnostic tests",
                "Close monitoring",
                "Lifestyle modifications"
            ]
        else:
            overall_risk = "Low Risk"
            next_steps = [
                "Regular follow-up",
                "Continue screening",
                "Healthy lifestyle maintenance",
                "Annual check-ups"
            ]

        # Ensure all expected list fields are present and are lists
        if 'locations' not in metastasis or not isinstance(metastasis['locations'], list):
            metastasis['locations'] = []
        if 'subtypes' not in cancer_type or not isinstance(cancer_type['subtypes'], list):
            cancer_type['subtypes'] = []
        if 'risk_factors' not in prognosis or not isinstance(prognosis['risk_factors'], list):
            prognosis['risk_factors'] = []
        if 'mutations' not in genetic or not isinstance(genetic['mutations'], list):
            genetic['mutations'] = []
        if 'family_screening' not in genetic or not isinstance(genetic['family_screening'], list):
            genetic['family_screening'] = []
        if 'recommendations' not in therapy or not isinstance(therapy['recommendations'], list):
            therapy['recommendations'] = []

        # FINAL DEFENSIVE PATCH: Guarantee all frontend-expected list fields are always present and are lists
        for obj, field, default in [
            (metastasis, 'locations', []),
            (cancer_type, 'subtypes', []),
            (prognosis, 'risk_factors', []),
            (genetic, 'mutations', []),
            (genetic, 'family_screening', []),
            (therapy, 'recommendations', []),
        ]:
            if field not in obj or not isinstance(obj[field], list):
                obj[field] = default

        print("PATCHED RESPONSE:", {
            'diagnosis': diagnosis,
            'cancer_type': cancer_type,
            'metastasis': metastasis,
            'tissue_change': tissue_change,
            'prognosis': prognosis,
            'therapy': therapy,
            'genetic': genetic,
            'overall_risk': overall_risk,
            'next_steps': next_steps,
            'confidence_score': confidence_score,
            'timestamp': timestamp
        })
        return {
            'diagnosis': diagnosis,
            'cancer_type': cancer_type,
            'metastasis': metastasis,
            'tissue_change': tissue_change,
            'prognosis': prognosis,
            'therapy': therapy,
            'genetic': genetic,
            'overall_risk': overall_risk,
            'next_steps': next_steps,
            'confidence_score': confidence_score,
            'timestamp': timestamp
        }
    
    def save_models(self, path: str = "models/"):
        """Save trained models"""
        os.makedirs(path, exist_ok=True)
        
        for name, model in self.models.items():
            joblib.dump(model, f"{path}/{name}_model.pkl")
        
        for name, scaler in self.scalers.items():
            joblib.dump(scaler, f"{path}/{name}_scaler.pkl")
    
    def load_models(self, path: str = "models/"):
        """Load trained models"""
        model_files = [f for f in os.listdir(path) if f.endswith('_model.pkl')]
        
        for model_file in model_files:
            name = model_file.replace('_model.pkl', '')
            self.models[name] = joblib.load(f"{path}/{model_file}")
            
            # Load corresponding scaler
            scaler_file = f"{name}_scaler.pkl"
            if os.path.exists(f"{path}/{scaler_file}"):
                self.scalers[name] = joblib.load(f"{path}/{scaler_file}")
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about trained models"""
        info = {}
        
        for name, model in self.models.items():
            info[name] = {
                'model_name': name,
                'model_type': type(model).__name__,
                'features_used': self.feature_names,
                'last_updated': datetime.now().isoformat(),
                'training_samples': len(self.feature_names)
            }
        
        return info 