from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Union
import numpy as np

class CancerFeatures(BaseModel):
    """Input features for cancer diagnosis"""
    radius_mean: float = Field(..., ge=0, description="Mean radius")
    texture_mean: float = Field(..., ge=0, description="Mean texture")
    perimeter_mean: float = Field(..., ge=0, description="Mean perimeter")
    area_mean: float = Field(..., ge=0, description="Mean area")
    smoothness_mean: float = Field(..., ge=0, description="Mean smoothness")
    compactness_mean: float = Field(..., ge=0, description="Mean compactness")
    concavity_mean: float = Field(..., ge=0, description="Mean concavity")
    concave_points_mean: float = Field(..., ge=0, description="Mean concave points")
    symmetry_mean: float = Field(..., ge=0, description="Mean symmetry")
    fractal_dimension_mean: float = Field(..., ge=0, description="Mean fractal dimension")
    radius_se: float = Field(..., ge=0, description="Radius standard error")
    texture_se: float = Field(..., ge=0, description="Texture standard error")
    perimeter_se: float = Field(..., ge=0, description="Perimeter standard error")
    area_se: float = Field(..., ge=0, description="Area standard error")
    smoothness_se: float = Field(..., ge=0, description="Smoothness standard error")
    compactness_se: float = Field(..., ge=0, description="Compactness standard error")
    concavity_se: float = Field(..., ge=0, description="Concavity standard error")
    concave_points_se: float = Field(..., ge=0, description="Concave points standard error")
    symmetry_se: float = Field(..., ge=0, description="Symmetry standard error")
    fractal_dimension_se: float = Field(..., ge=0, description="Fractal dimension standard error")
    radius_worst: float = Field(..., ge=0, description="Worst radius")
    texture_worst: float = Field(..., ge=0, description="Worst texture")
    perimeter_worst: float = Field(..., ge=0, description="Worst perimeter")
    area_worst: float = Field(..., ge=0, description="Worst area")
    smoothness_worst: float = Field(..., ge=0, description="Worst smoothness")
    compactness_worst: float = Field(..., ge=0, description="Worst compactness")
    concavity_worst: float = Field(..., ge=0, description="Worst concavity")
    concave_points_worst: float = Field(..., ge=0, description="Worst concave points")
    symmetry_worst: float = Field(..., ge=0, description="Worst symmetry")
    fractal_dimension_worst: float = Field(..., ge=0, description="Worst fractal dimension")

    # Multi-modal data fields (all optional, flexible: can be text, file name, or URL)
    radiological_image: Optional[str] = Field(None, description="Radiological image (URL, file name, or base64 string)")
    pathological_image: Optional[str] = Field(None, description="Pathological image (URL, file name, or base64 string)")
    genomics_data: Optional[str] = Field(None, description="Genomics data (text, file name, or URL)")
    clinical_records: Optional[str] = Field(None, description="Clinical records (text, file name, or URL)")
    patient_reported_outcomes: Optional[str] = Field(None, description="Patient-reported outcomes (text, file name, or URL)")

    def to_array(self) -> np.ndarray:
        """Convert to numpy array for model prediction"""
        return np.array([
            self.radius_mean, self.texture_mean, self.perimeter_mean, self.area_mean,
            self.smoothness_mean, self.compactness_mean, self.concavity_mean,
            self.concave_points_mean, self.symmetry_mean, self.fractal_dimension_mean,
            self.radius_se, self.texture_se, self.perimeter_se, self.area_se,
            self.smoothness_se, self.compactness_se, self.concavity_se,
            self.concave_points_se, self.symmetry_se, self.fractal_dimension_se,
            self.radius_worst, self.texture_worst, self.perimeter_worst, self.area_worst,
            self.smoothness_worst, self.compactness_worst, self.concavity_worst,
            self.concave_points_worst, self.symmetry_worst, self.fractal_dimension_worst
        ]).reshape(1, -1)

class DiagnosisResponse(BaseModel):
    """Response for cancer diagnosis prediction"""
    prediction: str = Field(..., description="Predicted diagnosis (Malignant/Benign)")
    confidence: float = Field(..., ge=0, le=1, description="Confidence score")
    probability: Dict[str, float] = Field(..., description="Class probabilities")
    risk_level: str = Field(..., description="Risk level assessment")
    recommendations: List[str] = Field(..., description="Medical recommendations")

class CancerTypeResponse(BaseModel):
    """Response for cancer type prediction"""
    prediction: str = Field(..., description="Predicted cancer type")
    confidence: float = Field(..., ge=0, le=1, description="Confidence score")
    probability: Dict[str, float] = Field(..., description="Type probabilities")
    characteristics: Dict[str, str] = Field(..., description="Cancer characteristics")
    subtypes: List[str] = Field(..., description="Cancer subtypes")

class MetastasisResponse(BaseModel):
    """Response for metastasis prediction"""
    prediction: str = Field(..., description="Metastasis status")
    confidence: float = Field(..., ge=0, le=1, description="Confidence score")
    probability: Dict[str, float] = Field(..., description="Status probabilities")
    stage: str = Field(..., description="Cancer stage")
    spread_risk: str = Field(..., description="Risk of spread")
    locations: List[str] = Field(..., description="Metastasis locations")

class TissueChangeResponse(BaseModel):
    """Response for tissue change prediction"""
    prediction: str = Field(..., description="Tissue change type")
    confidence: float = Field(..., ge=0, le=1, description="Confidence score")
    probability: Dict[str, float] = Field(..., description="Change type probabilities")
    severity: str = Field(..., description="Severity level")
    progression_risk: str = Field(..., description="Progression risk")

class PrognosisResponse(BaseModel):
    """Response for prognosis prediction"""
    prediction: str = Field(..., description="Prognosis outcome")
    confidence: float = Field(..., ge=0, le=1, description="Confidence score")
    survival_rate: float = Field(..., ge=0, le=1, description="5-year survival rate")
    risk_factors: List[str] = Field(..., description="Identified risk factors")
    monitoring_schedule: str = Field(..., description="Recommended monitoring")

class TherapyResponse(BaseModel):
    """Response for therapy recommendations"""
    primary_treatment: str = Field(..., description="Primary treatment recommendation")
    alternative_treatments: List[str] = Field(..., description="Alternative options")
    urgency: str = Field(..., description="Treatment urgency")
    success_rate: float = Field(..., ge=0, le=1, description="Expected success rate")
    side_effects: List[str] = Field(..., description="Potential side effects")
    recommendations: List[str] = Field(..., description="Therapy recommendations")
    priority: str = Field(..., description="Therapy priority")
    timeline: str = Field(..., description="Therapy timeline")

class GeneticResponse(BaseModel):
    """Response for genetic analysis"""
    mutations: List[str] = Field(..., description="Identified genetic mutations")
    risk_genes: List[str] = Field(..., description="High-risk genes")
    hereditary_risk: str = Field(..., description="Hereditary risk assessment")
    family_screening: List[str] = Field(..., description="Family screening recommendations")
    risk_score: float = Field(..., description="Genetic risk score")

class ComprehensiveResponse(BaseModel):
    """Comprehensive prediction response"""
    diagnosis: DiagnosisResponse
    cancer_type: CancerTypeResponse
    metastasis: MetastasisResponse
    tissue_change: TissueChangeResponse
    prognosis: PrognosisResponse
    therapy: TherapyResponse
    genetic: GeneticResponse
    overall_risk: str = Field(..., description="Overall risk assessment")
    next_steps: List[str] = Field(..., description="Recommended next steps")
    confidence_score: float = Field(..., description="System confidence score")
    timestamp: str = Field(..., description="Prediction timestamp")

class BatchRequest(BaseModel):
    """Batch prediction request"""
    samples: List[CancerFeatures] = Field(..., description="List of samples to predict")

class BatchResponse(BaseModel):
    """Batch prediction response"""
    predictions: List[ComprehensiveResponse] = Field(..., description="Predictions for all samples")
    summary: Dict[str, int] = Field(..., description="Summary statistics")

class ModelInfo(BaseModel):
    """Model information and performance metrics"""
    name: str
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    last_updated: str
    training_samples: int
    features_used: List[str]

class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    models_loaded: bool
    api_version: str
    uptime: float

class User(BaseModel):
    username: str = Field(..., description="Username")
    hashed_password: str = Field(..., description="Hashed password")
    role: str = Field(default="admin", description="User role (admin/user)") 