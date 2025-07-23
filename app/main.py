from fastapi import FastAPI, HTTPException, UploadFile, File, Depends, status, Body, Request, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
import pandas as pd
import numpy as np
import time
from datetime import datetime, timedelta
from typing import List
import io
import motor.motor_asyncio
import os
from passlib.context import CryptContext
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel

from .models import (
    CancerFeatures, DiagnosisResponse, CancerTypeResponse, MetastasisResponse,
    TissueChangeResponse, PrognosisResponse, TherapyResponse, GeneticResponse,
    ComprehensiveResponse, BatchRequest, BatchResponse, ModelInfo, HealthResponse
)
from .ml_models import CancerDiagnosisModels

# Initialize FastAPI app
app = FastAPI(
    title="AI Cancer Diagnosis System",
    description="Comprehensive AI system for cancer diagnosis and prognosis prediction",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize ML models
ml_models = CancerDiagnosisModels()
start_time = time.time()

# MongoDB Atlas connection
MONGODB_URL = os.getenv("MONGODB_URL") or "mongodb+srv://abdulhadiakanni:RkMyRt1OcbCpg2sH@cancer.hgkqiep.mongodb.net/?retryWrites=true&w=majority&appName=Cancer"
mongo_client = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URL)
db = mongo_client["cancer_diagnosis"]
users_collection = db["users"]

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = os.getenv("SECRET_KEY") or "supersecretkey"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# Admin registration code
ADMIN_REG_CODE = os.getenv("ADMIN_REG_CODE") or "admin-setup-2024"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

class Token(BaseModel):
    access_token: str
    token_type: str

# Utility functions
async def get_user(username: str):
    return await users_collection.find_one({"username": username})

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = await get_user(username)
    if user is None:
        raise credentials_exception
    return user

@app.on_event("startup")
async def startup_event():
    """Initialize models on startup"""
    try:
        # Try to load existing models
        ml_models.load_models()
        print("Loaded existing models")
    except:
        # Train new models if none exist
        print("Training new models...")
        X, y = ml_models.load_data()
        results = ml_models.train_models(X, y)
        ml_models.save_models()
        print("Models trained and saved")

@app.get("/", response_class=HTMLResponse)
async def root():
    """Root endpoint with basic information"""
    return """
    <html>
        <head>
            <title>AI Cancer Diagnosis System</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                .container { max-width: 800px; margin: 0 auto; }
                .header { background: #f0f0f0; padding: 20px; border-radius: 5px; }
                .endpoints { margin-top: 20px; }
                .endpoint { background: #e8f4f8; padding: 10px; margin: 5px 0; border-radius: 3px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🤖 AI Cancer Diagnosis System</h1>
                    <p>A comprehensive AI system for cancer diagnosis and prognosis prediction</p>
                </div>
                
                <div class="endpoints">
                    <h2>Available Endpoints:</h2>
                    <div class="endpoint">
                        <strong>POST /predict/diagnosis</strong> - Cancer diagnosis (Malignant/Benign)
                    </div>
                    <div class="endpoint">
                        <strong>POST /predict/cancer-type</strong> - Cancer type classification
                    </div>
                    <div class="endpoint">
                        <strong>POST /predict/metastasis</strong> - Metastasis status
                    </div>
                    <div class="endpoint">
                        <strong>POST /predict/tissue-change</strong> - Tissue change classification
                    </div>
                    <div class="endpoint">
                        <strong>POST /predict/prognosis</strong> - Prognosis prediction
                    </div>
                    <div class="endpoint">
                        <strong>POST /predict/therapy</strong> - Therapeutic recommendations
                    </div>
                    <div class="endpoint">
                        <strong>POST /predict/genetic</strong> - Genetic cause identification
                    </div>
                    <div class="endpoint">
                        <strong>POST /predict/comprehensive</strong> - All predictions at once
                    </div>
                    <div class="endpoint">
                        <strong>POST /predict/batch</strong> - Batch processing via CSV
                    </div>
                    <div class="endpoint">
                        <strong>GET /health</strong> - System health check
                    </div>
                    <div class="endpoint">
                        <strong>GET /models/info</strong> - Model information
                    </div>
                </div>
                
                <p><a href="/docs">📚 API Documentation</a></p>
            </div>
        </body>
    </html>
    """

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    uptime = time.time() - start_time
    models_loaded = len(ml_models.models) > 0
    
    return HealthResponse(
        status="healthy" if models_loaded else "initializing",
        models_loaded=models_loaded,
        api_version="1.0.0",
        uptime=uptime
    )

@app.get("/models/info", response_model=List[ModelInfo])
async def get_model_info():
    """Get information about trained models"""
    info = ml_models.get_model_info()
    model_info_list = []
    
    for name, details in info.items():
        model_info_list.append(ModelInfo(
            model_name=details['model_name'],
            accuracy=0.95,  # Placeholder - would be actual metrics
            precision=0.94,
            recall=0.93,
            f1_score=0.94,
            last_updated=details['last_updated'],
            training_samples=details['training_samples'],
            features_used=details['features_used']
        ))
    
    return model_info_list

@app.post("/predict/diagnosis", response_model=DiagnosisResponse)
async def predict_diagnosis(
    radius_mean: float = Form(...),
    texture_mean: float = Form(...),
    perimeter_mean: float = Form(...),
    area_mean: float = Form(...),
    smoothness_mean: float = Form(...),
    compactness_mean: float = Form(...),
    concavity_mean: float = Form(...),
    concave_points_mean: float = Form(...),
    symmetry_mean: float = Form(...),
    fractal_dimension_mean: float = Form(...),
    radius_se: float = Form(...),
    texture_se: float = Form(...),
    perimeter_se: float = Form(...),
    area_se: float = Form(...),
    smoothness_se: float = Form(...),
    compactness_se: float = Form(...),
    concavity_se: float = Form(...),
    concave_points_se: float = Form(...),
    symmetry_se: float = Form(...),
    fractal_dimension_se: float = Form(...),
    radius_worst: float = Form(...),
    texture_worst: float = Form(...),
    perimeter_worst: float = Form(...),
    area_worst: float = Form(...),
    smoothness_worst: float = Form(...),
    compactness_worst: float = Form(...),
    concavity_worst: float = Form(...),
    concave_points_worst: float = Form(...),
    symmetry_worst: float = Form(...),
    fractal_dimension_worst: float = Form(...),
    radiological_image: str = Form(None),
    radiological_image_file: UploadFile = File(None),
    pathological_image: str = Form(None),
    pathological_image_file: UploadFile = File(None),
    genomics_data: str = Form(None),
    genomics_data_file: UploadFile = File(None),
    clinical_records: str = Form(None),
    clinical_records_file: UploadFile = File(None),
    patient_reported_outcomes: str = Form(None),
    patient_reported_outcomes_file: UploadFile = File(None)
):
    """Predict cancer diagnosis (Malignant/Benign) with multi-modal data support"""
    try:
        # Helper to save file and return path
        async def save_upload(file: UploadFile, prefix: str):
            if file is not None:
                folder = "uploads"
                os.makedirs(folder, exist_ok=True)
                file_path = os.path.join(folder, f"{prefix}_{file.filename}")
                with open(file_path, "wb") as f:
                    f.write(await file.read())
                return file_path
            return None

        radiological_image_path = await save_upload(radiological_image_file, "radiological")
        pathological_image_path = await save_upload(pathological_image_file, "pathological")
        genomics_data_path = await save_upload(genomics_data_file, "genomics")
        clinical_records_path = await save_upload(clinical_records_file, "clinical")
        patient_reported_outcomes_path = await save_upload(patient_reported_outcomes_file, "pro")

        features = CancerFeatures(
            radius_mean=radius_mean,
            texture_mean=texture_mean,
            perimeter_mean=perimeter_mean,
            area_mean=area_mean,
            smoothness_mean=smoothness_mean,
            compactness_mean=compactness_mean,
            concavity_mean=concavity_mean,
            concave_points_mean=concave_points_mean,
            symmetry_mean=symmetry_mean,
            fractal_dimension_mean=fractal_dimension_mean,
            radius_se=radius_se,
            texture_se=texture_se,
            perimeter_se=perimeter_se,
            area_se=area_se,
            smoothness_se=smoothness_se,
            compactness_se=compactness_se,
            concavity_se=concavity_se,
            concave_points_se=concave_points_se,
            symmetry_se=symmetry_se,
            fractal_dimension_se=fractal_dimension_se,
            radius_worst=radius_worst,
            texture_worst=texture_worst,
            perimeter_worst=perimeter_worst,
            area_worst=area_worst,
            smoothness_worst=smoothness_worst,
            compactness_worst=compactness_worst,
            concavity_worst=concavity_worst,
            concave_points_worst=concave_points_worst,
            symmetry_worst=symmetry_worst,
            fractal_dimension_worst=fractal_dimension_worst,
            radiological_image=radiological_image_path or radiological_image,
            pathological_image=pathological_image_path or pathological_image,
            genomics_data=genomics_data_path or genomics_data,
            clinical_records=clinical_records_path or clinical_records,
            patient_reported_outcomes=patient_reported_outcomes_path or patient_reported_outcomes
        )
        features_array = features.to_array()
        result = ml_models.predict_diagnosis(features_array)
        return DiagnosisResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.post("/predict/cancer-type", response_model=CancerTypeResponse)
async def predict_cancer_type(
    radius_mean: float = Form(...),
    texture_mean: float = Form(...),
    perimeter_mean: float = Form(...),
    area_mean: float = Form(...),
    smoothness_mean: float = Form(...),
    compactness_mean: float = Form(...),
    concavity_mean: float = Form(...),
    concave_points_mean: float = Form(...),
    symmetry_mean: float = Form(...),
    fractal_dimension_mean: float = Form(...),
    radius_se: float = Form(...),
    texture_se: float = Form(...),
    perimeter_se: float = Form(...),
    area_se: float = Form(...),
    smoothness_se: float = Form(...),
    compactness_se: float = Form(...),
    concavity_se: float = Form(...),
    concave_points_se: float = Form(...),
    symmetry_se: float = Form(...),
    fractal_dimension_se: float = Form(...),
    radius_worst: float = Form(...),
    texture_worst: float = Form(...),
    perimeter_worst: float = Form(...),
    area_worst: float = Form(...),
    smoothness_worst: float = Form(...),
    compactness_worst: float = Form(...),
    concavity_worst: float = Form(...),
    concave_points_worst: float = Form(...),
    symmetry_worst: float = Form(...),
    fractal_dimension_worst: float = Form(...),
    radiological_image: str = Form(None),
    radiological_image_file: UploadFile = File(None),
    pathological_image: str = Form(None),
    pathological_image_file: UploadFile = File(None),
    genomics_data: str = Form(None),
    genomics_data_file: UploadFile = File(None),
    clinical_records: str = Form(None),
    clinical_records_file: UploadFile = File(None),
    patient_reported_outcomes: str = Form(None),
    patient_reported_outcomes_file: UploadFile = File(None)
):
    """Predict cancer type"""
    try:
        async def save_upload(file: UploadFile, prefix: str):
            if file is not None:
                folder = "uploads"
                os.makedirs(folder, exist_ok=True)
                file_path = os.path.join(folder, f"{prefix}_{file.filename}")
                with open(file_path, "wb") as f:
                    f.write(await file.read())
                return file_path
            return None
        radiological_image_path = await save_upload(radiological_image_file, "radiological")
        pathological_image_path = await save_upload(pathological_image_file, "pathological")
        genomics_data_path = await save_upload(genomics_data_file, "genomics")
        clinical_records_path = await save_upload(clinical_records_file, "clinical")
        patient_reported_outcomes_path = await save_upload(patient_reported_outcomes_file, "pro")
        features = CancerFeatures(
            radius_mean=radius_mean,
            texture_mean=texture_mean,
            perimeter_mean=perimeter_mean,
            area_mean=area_mean,
            smoothness_mean=smoothness_mean,
            compactness_mean=compactness_mean,
            concavity_mean=concavity_mean,
            concave_points_mean=concave_points_mean,
            symmetry_mean=symmetry_mean,
            fractal_dimension_mean=fractal_dimension_mean,
            radius_se=radius_se,
            texture_se=texture_se,
            perimeter_se=perimeter_se,
            area_se=area_se,
            smoothness_se=smoothness_se,
            compactness_se=compactness_se,
            concavity_se=concavity_se,
            concave_points_se=concave_points_se,
            symmetry_se=symmetry_se,
            fractal_dimension_se=fractal_dimension_se,
            radius_worst=radius_worst,
            texture_worst=texture_worst,
            perimeter_worst=perimeter_worst,
            area_worst=area_worst,
            smoothness_worst=smoothness_worst,
            compactness_worst=compactness_worst,
            concavity_worst=concavity_worst,
            concave_points_worst=concave_points_worst,
            symmetry_worst=symmetry_worst,
            fractal_dimension_worst=fractal_dimension_worst,
            radiological_image=radiological_image_path or radiological_image,
            pathological_image=pathological_image_path or pathological_image,
            genomics_data=genomics_data_path or genomics_data,
            clinical_records=clinical_records_path or clinical_records,
            patient_reported_outcomes=patient_reported_outcomes_path or patient_reported_outcomes
        )
        features_array = features.to_array()
        result = ml_models.predict_cancer_type(features_array)
        return CancerTypeResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.post("/predict/metastasis", response_model=MetastasisResponse)
async def predict_metastasis(
    radius_mean: float = Form(...),
    texture_mean: float = Form(...),
    perimeter_mean: float = Form(...),
    area_mean: float = Form(...),
    smoothness_mean: float = Form(...),
    compactness_mean: float = Form(...),
    concavity_mean: float = Form(...),
    concave_points_mean: float = Form(...),
    symmetry_mean: float = Form(...),
    fractal_dimension_mean: float = Form(...),
    radius_se: float = Form(...),
    texture_se: float = Form(...),
    perimeter_se: float = Form(...),
    area_se: float = Form(...),
    smoothness_se: float = Form(...),
    compactness_se: float = Form(...),
    concavity_se: float = Form(...),
    concave_points_se: float = Form(...),
    symmetry_se: float = Form(...),
    fractal_dimension_se: float = Form(...),
    radius_worst: float = Form(...),
    texture_worst: float = Form(...),
    perimeter_worst: float = Form(...),
    area_worst: float = Form(...),
    smoothness_worst: float = Form(...),
    compactness_worst: float = Form(...),
    concavity_worst: float = Form(...),
    concave_points_worst: float = Form(...),
    symmetry_worst: float = Form(...),
    fractal_dimension_worst: float = Form(...),
    radiological_image: str = Form(None),
    radiological_image_file: UploadFile = File(None),
    pathological_image: str = Form(None),
    pathological_image_file: UploadFile = File(None),
    genomics_data: str = Form(None),
    genomics_data_file: UploadFile = File(None),
    clinical_records: str = Form(None),
    clinical_records_file: UploadFile = File(None),
    patient_reported_outcomes: str = Form(None),
    patient_reported_outcomes_file: UploadFile = File(None)
):
    try:
        async def save_upload(file: UploadFile, prefix: str):
            if file is not None:
                folder = "uploads"
                os.makedirs(folder, exist_ok=True)
                file_path = os.path.join(folder, f"{prefix}_{file.filename}")
                with open(file_path, "wb") as f:
                    f.write(await file.read())
                return file_path
            return None
        radiological_image_path = await save_upload(radiological_image_file, "radiological")
        pathological_image_path = await save_upload(pathological_image_file, "pathological")
        genomics_data_path = await save_upload(genomics_data_file, "genomics")
        clinical_records_path = await save_upload(clinical_records_file, "clinical")
        patient_reported_outcomes_path = await save_upload(patient_reported_outcomes_file, "pro")
        features = CancerFeatures(
            radius_mean=radius_mean,
            texture_mean=texture_mean,
            perimeter_mean=perimeter_mean,
            area_mean=area_mean,
            smoothness_mean=smoothness_mean,
            compactness_mean=compactness_mean,
            concavity_mean=concavity_mean,
            concave_points_mean=concave_points_mean,
            symmetry_mean=symmetry_mean,
            fractal_dimension_mean=fractal_dimension_mean,
            radius_se=radius_se,
            texture_se=texture_se,
            perimeter_se=perimeter_se,
            area_se=area_se,
            smoothness_se=smoothness_se,
            compactness_se=compactness_se,
            concavity_se=concavity_se,
            concave_points_se=concave_points_se,
            symmetry_se=symmetry_se,
            fractal_dimension_se=fractal_dimension_se,
            radius_worst=radius_worst,
            texture_worst=texture_worst,
            perimeter_worst=perimeter_worst,
            area_worst=area_worst,
            smoothness_worst=smoothness_worst,
            compactness_worst=compactness_worst,
            concavity_worst=concavity_worst,
            concave_points_worst=concave_points_worst,
            symmetry_worst=symmetry_worst,
            fractal_dimension_worst=fractal_dimension_worst,
            radiological_image=radiological_image_path or radiological_image,
            pathological_image=pathological_image_path or pathological_image,
            genomics_data=genomics_data_path or genomics_data,
            clinical_records=clinical_records_path or clinical_records,
            patient_reported_outcomes=patient_reported_outcomes_path or patient_reported_outcomes
        )
        features_array = features.to_array()
        result = ml_models.predict_metastasis(features_array)
        return MetastasisResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.post("/predict/tissue-change", response_model=TissueChangeResponse)
async def predict_tissue_change(
    radius_mean: float = Form(...),
    texture_mean: float = Form(...),
    perimeter_mean: float = Form(...),
    area_mean: float = Form(...),
    smoothness_mean: float = Form(...),
    compactness_mean: float = Form(...),
    concavity_mean: float = Form(...),
    concave_points_mean: float = Form(...),
    symmetry_mean: float = Form(...),
    fractal_dimension_mean: float = Form(...),
    radius_se: float = Form(...),
    texture_se: float = Form(...),
    perimeter_se: float = Form(...),
    area_se: float = Form(...),
    smoothness_se: float = Form(...),
    compactness_se: float = Form(...),
    concavity_se: float = Form(...),
    concave_points_se: float = Form(...),
    symmetry_se: float = Form(...),
    fractal_dimension_se: float = Form(...),
    radius_worst: float = Form(...),
    texture_worst: float = Form(...),
    perimeter_worst: float = Form(...),
    area_worst: float = Form(...),
    smoothness_worst: float = Form(...),
    compactness_worst: float = Form(...),
    concavity_worst: float = Form(...),
    concave_points_worst: float = Form(...),
    symmetry_worst: float = Form(...),
    fractal_dimension_worst: float = Form(...),
    radiological_image: str = Form(None),
    radiological_image_file: UploadFile = File(None),
    pathological_image: str = Form(None),
    pathological_image_file: UploadFile = File(None),
    genomics_data: str = Form(None),
    genomics_data_file: UploadFile = File(None),
    clinical_records: str = Form(None),
    clinical_records_file: UploadFile = File(None),
    patient_reported_outcomes: str = Form(None),
    patient_reported_outcomes_file: UploadFile = File(None)
):
    try:
        async def save_upload(file: UploadFile, prefix: str):
            if file is not None:
                folder = "uploads"
                os.makedirs(folder, exist_ok=True)
                file_path = os.path.join(folder, f"{prefix}_{file.filename}")
                with open(file_path, "wb") as f:
                    f.write(await file.read())
                return file_path
            return None
        radiological_image_path = await save_upload(radiological_image_file, "radiological")
        pathological_image_path = await save_upload(pathological_image_file, "pathological")
        genomics_data_path = await save_upload(genomics_data_file, "genomics")
        clinical_records_path = await save_upload(clinical_records_file, "clinical")
        patient_reported_outcomes_path = await save_upload(patient_reported_outcomes_file, "pro")
        features = CancerFeatures(
            radius_mean=radius_mean,
            texture_mean=texture_mean,
            perimeter_mean=perimeter_mean,
            area_mean=area_mean,
            smoothness_mean=smoothness_mean,
            compactness_mean=compactness_mean,
            concavity_mean=concavity_mean,
            concave_points_mean=concave_points_mean,
            symmetry_mean=symmetry_mean,
            fractal_dimension_mean=fractal_dimension_mean,
            radius_se=radius_se,
            texture_se=texture_se,
            perimeter_se=perimeter_se,
            area_se=area_se,
            smoothness_se=smoothness_se,
            compactness_se=compactness_se,
            concavity_se=concavity_se,
            concave_points_se=concave_points_se,
            symmetry_se=symmetry_se,
            fractal_dimension_se=fractal_dimension_se,
            radius_worst=radius_worst,
            texture_worst=texture_worst,
            perimeter_worst=perimeter_worst,
            area_worst=area_worst,
            smoothness_worst=smoothness_worst,
            compactness_worst=compactness_worst,
            concavity_worst=concavity_worst,
            concave_points_worst=concave_points_worst,
            symmetry_worst=symmetry_worst,
            fractal_dimension_worst=fractal_dimension_worst,
            radiological_image=radiological_image_path or radiological_image,
            pathological_image=pathological_image_path or pathological_image,
            genomics_data=genomics_data_path or genomics_data,
            clinical_records=clinical_records_path or clinical_records,
            patient_reported_outcomes=patient_reported_outcomes_path or patient_reported_outcomes
        )
        features_array = features.to_array()
        result = ml_models.predict_tissue_change(features_array)
        return TissueChangeResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.post("/predict/prognosis", response_model=PrognosisResponse)
async def predict_prognosis(
    radius_mean: float = Form(...),
    texture_mean: float = Form(...),
    perimeter_mean: float = Form(...),
    area_mean: float = Form(...),
    smoothness_mean: float = Form(...),
    compactness_mean: float = Form(...),
    concavity_mean: float = Form(...),
    concave_points_mean: float = Form(...),
    symmetry_mean: float = Form(...),
    fractal_dimension_mean: float = Form(...),
    radius_se: float = Form(...),
    texture_se: float = Form(...),
    perimeter_se: float = Form(...),
    area_se: float = Form(...),
    smoothness_se: float = Form(...),
    compactness_se: float = Form(...),
    concavity_se: float = Form(...),
    concave_points_se: float = Form(...),
    symmetry_se: float = Form(...),
    fractal_dimension_se: float = Form(...),
    radius_worst: float = Form(...),
    texture_worst: float = Form(...),
    perimeter_worst: float = Form(...),
    area_worst: float = Form(...),
    smoothness_worst: float = Form(...),
    compactness_worst: float = Form(...),
    concavity_worst: float = Form(...),
    concave_points_worst: float = Form(...),
    symmetry_worst: float = Form(...),
    fractal_dimension_worst: float = Form(...),
    radiological_image: str = Form(None),
    radiological_image_file: UploadFile = File(None),
    pathological_image: str = Form(None),
    pathological_image_file: UploadFile = File(None),
    genomics_data: str = Form(None),
    genomics_data_file: UploadFile = File(None),
    clinical_records: str = Form(None),
    clinical_records_file: UploadFile = File(None),
    patient_reported_outcomes: str = Form(None),
    patient_reported_outcomes_file: UploadFile = File(None)
):
    """Predict prognosis"""
    try:
        async def save_upload(file: UploadFile, prefix: str):
            if file is not None:
                folder = "uploads"
                os.makedirs(folder, exist_ok=True)
                file_path = os.path.join(folder, f"{prefix}_{file.filename}")
                with open(file_path, "wb") as f:
                    f.write(await file.read())
                return file_path
            return None
        radiological_image_path = await save_upload(radiological_image_file, "radiological")
        pathological_image_path = await save_upload(pathological_image_file, "pathological")
        genomics_data_path = await save_upload(genomics_data_file, "genomics")
        clinical_records_path = await save_upload(clinical_records_file, "clinical")
        patient_reported_outcomes_path = await save_upload(patient_reported_outcomes_file, "pro")
        features = CancerFeatures(
            radius_mean=radius_mean,
            texture_mean=texture_mean,
            perimeter_mean=perimeter_mean,
            area_mean=area_mean,
            smoothness_mean=smoothness_mean,
            compactness_mean=compactness_mean,
            concavity_mean=concavity_mean,
            concave_points_mean=concave_points_mean,
            symmetry_mean=symmetry_mean,
            fractal_dimension_mean=fractal_dimension_mean,
            radius_se=radius_se,
            texture_se=texture_se,
            perimeter_se=perimeter_se,
            area_se=area_se,
            smoothness_se=smoothness_se,
            compactness_se=compactness_se,
            concavity_se=concavity_se,
            concave_points_se=concave_points_se,
            symmetry_se=symmetry_se,
            fractal_dimension_se=fractal_dimension_se,
            radius_worst=radius_worst,
            texture_worst=texture_worst,
            perimeter_worst=perimeter_worst,
            area_worst=area_worst,
            smoothness_worst=smoothness_worst,
            compactness_worst=compactness_worst,
            concavity_worst=concavity_worst,
            concave_points_worst=concave_points_worst,
            symmetry_worst=symmetry_worst,
            fractal_dimension_worst=fractal_dimension_worst,
            radiological_image=radiological_image_path or radiological_image,
            pathological_image=pathological_image_path or pathological_image,
            genomics_data=genomics_data_path or genomics_data,
            clinical_records=clinical_records_path or clinical_records,
            patient_reported_outcomes=patient_reported_outcomes_path or patient_reported_outcomes
        )
        features_array = features.to_array()
        result = ml_models.predict_prognosis(features_array)
        return PrognosisResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.post("/predict/therapy", response_model=TherapyResponse)
async def predict_therapy(
    radius_mean: float = Form(...),
    texture_mean: float = Form(...),
    perimeter_mean: float = Form(...),
    area_mean: float = Form(...),
    smoothness_mean: float = Form(...),
    compactness_mean: float = Form(...),
    concavity_mean: float = Form(...),
    concave_points_mean: float = Form(...),
    symmetry_mean: float = Form(...),
    fractal_dimension_mean: float = Form(...),
    radius_se: float = Form(...),
    texture_se: float = Form(...),
    perimeter_se: float = Form(...),
    area_se: float = Form(...),
    smoothness_se: float = Form(...),
    compactness_se: float = Form(...),
    concavity_se: float = Form(...),
    concave_points_se: float = Form(...),
    symmetry_se: float = Form(...),
    fractal_dimension_se: float = Form(...),
    radius_worst: float = Form(...),
    texture_worst: float = Form(...),
    perimeter_worst: float = Form(...),
    area_worst: float = Form(...),
    smoothness_worst: float = Form(...),
    compactness_worst: float = Form(...),
    concavity_worst: float = Form(...),
    concave_points_worst: float = Form(...),
    symmetry_worst: float = Form(...),
    fractal_dimension_worst: float = Form(...),
    radiological_image: str = Form(None),
    radiological_image_file: UploadFile = File(None),
    pathological_image: str = Form(None),
    pathological_image_file: UploadFile = File(None),
    genomics_data: str = Form(None),
    genomics_data_file: UploadFile = File(None),
    clinical_records: str = Form(None),
    clinical_records_file: UploadFile = File(None),
    patient_reported_outcomes: str = Form(None),
    patient_reported_outcomes_file: UploadFile = File(None)
):
    """Predict therapeutic recommendations"""
    try:
        async def save_upload(file: UploadFile, prefix: str):
            if file is not None:
                folder = "uploads"
                os.makedirs(folder, exist_ok=True)
                file_path = os.path.join(folder, f"{prefix}_{file.filename}")
                with open(file_path, "wb") as f:
                    f.write(await file.read())
                return file_path
            return None
        radiological_image_path = await save_upload(radiological_image_file, "radiological")
        pathological_image_path = await save_upload(pathological_image_file, "pathological")
        genomics_data_path = await save_upload(genomics_data_file, "genomics")
        clinical_records_path = await save_upload(clinical_records_file, "clinical")
        patient_reported_outcomes_path = await save_upload(patient_reported_outcomes_file, "pro")
        features = CancerFeatures(
            radius_mean=radius_mean,
            texture_mean=texture_mean,
            perimeter_mean=perimeter_mean,
            area_mean=area_mean,
            smoothness_mean=smoothness_mean,
            compactness_mean=compactness_mean,
            concavity_mean=concavity_mean,
            concave_points_mean=concave_points_mean,
            symmetry_mean=symmetry_mean,
            fractal_dimension_mean=fractal_dimension_mean,
            radius_se=radius_se,
            texture_se=texture_se,
            perimeter_se=perimeter_se,
            area_se=area_se,
            smoothness_se=smoothness_se,
            compactness_se=compactness_se,
            concavity_se=concavity_se,
            concave_points_se=concave_points_se,
            symmetry_se=symmetry_se,
            fractal_dimension_se=fractal_dimension_se,
            radius_worst=radius_worst,
            texture_worst=texture_worst,
            perimeter_worst=perimeter_worst,
            area_worst=area_worst,
            smoothness_worst=smoothness_worst,
            compactness_worst=compactness_worst,
            concavity_worst=concavity_worst,
            concave_points_worst=concave_points_worst,
            symmetry_worst=symmetry_worst,
            fractal_dimension_worst=fractal_dimension_worst,
            radiological_image=radiological_image_path or radiological_image,
            pathological_image=pathological_image_path or pathological_image,
            genomics_data=genomics_data_path or genomics_data,
            clinical_records=clinical_records_path or clinical_records,
            patient_reported_outcomes=patient_reported_outcomes_path or patient_reported_outcomes
        )
        features_array = features.to_array()
        result = ml_models.predict_therapy(features_array)
        return TherapyResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.post("/predict/genetic", response_model=GeneticResponse)
async def predict_genetic(
    radius_mean: float = Form(...),
    texture_mean: float = Form(...),
    perimeter_mean: float = Form(...),
    area_mean: float = Form(...),
    smoothness_mean: float = Form(...),
    compactness_mean: float = Form(...),
    concavity_mean: float = Form(...),
    concave_points_mean: float = Form(...),
    symmetry_mean: float = Form(...),
    fractal_dimension_mean: float = Form(...),
    radius_se: float = Form(...),
    texture_se: float = Form(...),
    perimeter_se: float = Form(...),
    area_se: float = Form(...),
    smoothness_se: float = Form(...),
    compactness_se: float = Form(...),
    concavity_se: float = Form(...),
    concave_points_se: float = Form(...),
    symmetry_se: float = Form(...),
    fractal_dimension_se: float = Form(...),
    radius_worst: float = Form(...),
    texture_worst: float = Form(...),
    perimeter_worst: float = Form(...),
    area_worst: float = Form(...),
    smoothness_worst: float = Form(...),
    compactness_worst: float = Form(...),
    concavity_worst: float = Form(...),
    concave_points_worst: float = Form(...),
    symmetry_worst: float = Form(...),
    fractal_dimension_worst: float = Form(...),
    radiological_image: str = Form(None),
    radiological_image_file: UploadFile = File(None),
    pathological_image: str = Form(None),
    pathological_image_file: UploadFile = File(None),
    genomics_data: str = Form(None),
    genomics_data_file: UploadFile = File(None),
    clinical_records: str = Form(None),
    clinical_records_file: UploadFile = File(None),
    patient_reported_outcomes: str = Form(None),
    patient_reported_outcomes_file: UploadFile = File(None)
):
    """Predict genetic factors"""
    try:
        async def save_upload(file: UploadFile, prefix: str):
            if file is not None:
                folder = "uploads"
                os.makedirs(folder, exist_ok=True)
                file_path = os.path.join(folder, f"{prefix}_{file.filename}")
                with open(file_path, "wb") as f:
                    f.write(await file.read())
                return file_path
            return None
        radiological_image_path = await save_upload(radiological_image_file, "radiological")
        pathological_image_path = await save_upload(pathological_image_file, "pathological")
        genomics_data_path = await save_upload(genomics_data_file, "genomics")
        clinical_records_path = await save_upload(clinical_records_file, "clinical")
        patient_reported_outcomes_path = await save_upload(patient_reported_outcomes_file, "pro")
        features = CancerFeatures(
            radius_mean=radius_mean,
            texture_mean=texture_mean,
            perimeter_mean=perimeter_mean,
            area_mean=area_mean,
            smoothness_mean=smoothness_mean,
            compactness_mean=compactness_mean,
            concavity_mean=concavity_mean,
            concave_points_mean=concave_points_mean,
            symmetry_mean=symmetry_mean,
            fractal_dimension_mean=fractal_dimension_mean,
            radius_se=radius_se,
            texture_se=texture_se,
            perimeter_se=perimeter_se,
            area_se=area_se,
            smoothness_se=smoothness_se,
            compactness_se=compactness_se,
            concavity_se=concavity_se,
            concave_points_se=concave_points_se,
            symmetry_se=symmetry_se,
            fractal_dimension_se=fractal_dimension_se,
            radius_worst=radius_worst,
            texture_worst=texture_worst,
            perimeter_worst=perimeter_worst,
            area_worst=area_worst,
            smoothness_worst=smoothness_worst,
            compactness_worst=compactness_worst,
            concavity_worst=concavity_worst,
            concave_points_worst=concave_points_worst,
            symmetry_worst=symmetry_worst,
            fractal_dimension_worst=fractal_dimension_worst,
            radiological_image=radiological_image_path or radiological_image,
            pathological_image=pathological_image_path or pathological_image,
            genomics_data=genomics_data_path or genomics_data,
            clinical_records=clinical_records_path or clinical_records,
            patient_reported_outcomes=patient_reported_outcomes_path or patient_reported_outcomes
        )
        features_array = features.to_array()
        result = ml_models.predict_genetic(features_array)
        return GeneticResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.post("/predict/comprehensive", response_model=ComprehensiveResponse)
async def predict_comprehensive(
    radius_mean: float = Form(...),
    texture_mean: float = Form(...),
    perimeter_mean: float = Form(...),
    area_mean: float = Form(...),
    smoothness_mean: float = Form(...),
    compactness_mean: float = Form(...),
    concavity_mean: float = Form(...),
    concave_points_mean: float = Form(...),
    symmetry_mean: float = Form(...),
    fractal_dimension_mean: float = Form(...),
    radius_se: float = Form(...),
    texture_se: float = Form(...),
    perimeter_se: float = Form(...),
    area_se: float = Form(...),
    smoothness_se: float = Form(...),
    compactness_se: float = Form(...),
    concavity_se: float = Form(...),
    concave_points_se: float = Form(...),
    symmetry_se: float = Form(...),
    fractal_dimension_se: float = Form(...),
    radius_worst: float = Form(...),
    texture_worst: float = Form(...),
    perimeter_worst: float = Form(...),
    area_worst: float = Form(...),
    smoothness_worst: float = Form(...),
    compactness_worst: float = Form(...),
    concavity_worst: float = Form(...),
    concave_points_worst: float = Form(...),
    symmetry_worst: float = Form(...),
    fractal_dimension_worst: float = Form(...),
    radiological_image: str = Form(None),
    radiological_image_file: UploadFile = File(None),
    pathological_image: str = Form(None),
    pathological_image_file: UploadFile = File(None),
    genomics_data: str = Form(None),
    genomics_data_file: UploadFile = File(None),
    clinical_records: str = Form(None),
    clinical_records_file: UploadFile = File(None),
    patient_reported_outcomes: str = Form(None),
    patient_reported_outcomes_file: UploadFile = File(None)
):
    """Make comprehensive predictions for all aspects"""
    try:
        async def save_upload(file: UploadFile, prefix: str):
            if file is not None:
                folder = "uploads"
                os.makedirs(folder, exist_ok=True)
                file_path = os.path.join(folder, f"{prefix}_{file.filename}")
                with open(file_path, "wb") as f:
                    f.write(await file.read())
                return file_path
            return None
        radiological_image_path = await save_upload(radiological_image_file, "radiological")
        pathological_image_path = await save_upload(pathological_image_file, "pathological")
        genomics_data_path = await save_upload(genomics_data_file, "genomics")
        clinical_records_path = await save_upload(clinical_records_file, "clinical")
        patient_reported_outcomes_path = await save_upload(patient_reported_outcomes_file, "pro")
        features = CancerFeatures(
            radius_mean=radius_mean,
            texture_mean=texture_mean,
            perimeter_mean=perimeter_mean,
            area_mean=area_mean,
            smoothness_mean=smoothness_mean,
            compactness_mean=compactness_mean,
            concavity_mean=concavity_mean,
            concave_points_mean=concave_points_mean,
            symmetry_mean=symmetry_mean,
            fractal_dimension_mean=fractal_dimension_mean,
            radius_se=radius_se,
            texture_se=texture_se,
            perimeter_se=perimeter_se,
            area_se=area_se,
            smoothness_se=smoothness_se,
            compactness_se=compactness_se,
            concavity_se=concavity_se,
            concave_points_se=concave_points_se,
            symmetry_se=symmetry_se,
            fractal_dimension_se=fractal_dimension_se,
            radius_worst=radius_worst,
            texture_worst=texture_worst,
            perimeter_worst=perimeter_worst,
            area_worst=area_worst,
            smoothness_worst=smoothness_worst,
            compactness_worst=compactness_worst,
            concavity_worst=concavity_worst,
            concave_points_worst=concave_points_worst,
            symmetry_worst=symmetry_worst,
            fractal_dimension_worst=fractal_dimension_worst,
            radiological_image=radiological_image_path or radiological_image,
            pathological_image=pathological_image_path or pathological_image,
            genomics_data=genomics_data_path or genomics_data,
            clinical_records=clinical_records_path or clinical_records,
            patient_reported_outcomes=patient_reported_outcomes_path or patient_reported_outcomes
        )
        features_array = features.to_array()
        result = ml_models.predict_comprehensive(features_array)
        return ComprehensiveResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.post("/predict/batch", response_model=BatchResponse)
async def predict_batch(file: UploadFile = File(...)):
    """Process batch predictions from CSV file"""
    try:
        # Read CSV file
        content = await file.read()
        df = pd.read_csv(io.StringIO(content.decode('utf-8')))
        
        # Validate required columns
        required_columns = [
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
        
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            raise HTTPException(
                status_code=400, 
                detail=f"Missing required columns: {missing_columns}"
            )
        
        predictions = []
        for _, row in df.iterrows():
            # Convert row to CancerFeatures
            features_dict = {col: float(row[col]) for col in required_columns}
            features = CancerFeatures(**features_dict)
            
            # Make comprehensive prediction
            features_array = features.to_array()
            result = ml_models.predict_comprehensive(features_array)
            predictions.append(ComprehensiveResponse(**result))
        
        # Create summary
        summary = {
            "total_samples": len(predictions),
            "malignant_count": sum(1 for p in predictions if p.diagnosis.prediction == "Malignant"),
            "benign_count": sum(1 for p in predictions if p.diagnosis.prediction == "Benign"),
            "high_risk_count": sum(1 for p in predictions if p.overall_risk == "High Risk")
        }
        
        return BatchResponse(predictions=predictions, summary=summary)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch processing error: {str(e)}")

@app.post("/retrain")
async def retrain_models():
    """Retrain all models with current data"""
    try:
        X, y = ml_models.load_data()
        results = ml_models.train_models(X, y)
        ml_models.save_models()
        
        return {
            "message": "Models retrained successfully",
            "results": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Retraining error: {str(e)}")

# Registration endpoint
@app.post("/register")
async def register(
    username: str = Form(...),
    password: str = Form(...),
    role: str = Form("user"),
    admin_code: str = Form(None)
):
    if await get_user(username):
        raise HTTPException(status_code=400, detail="Username already registered")
    if role == "admin":
        if admin_code != ADMIN_REG_CODE:
            raise HTTPException(status_code=403, detail="Invalid admin registration code")
    hashed_password = get_password_hash(password)
    user = {"username": username, "hashed_password": hashed_password, "role": role}
    await users_collection.insert_one(user)
    return {"msg": f"User '{username}' registered successfully as {role}."}

# Login endpoint
@app.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await get_user(form_data.username)
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    access_token = create_access_token(data={"sub": user["username"], "role": user["role"]})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/save-guidelines")
async def save_guidelines(guidelines: dict = Body(...), current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    try:
        with open("guidelines.json", "w") as f:
            import json
            json.dump(guidelines, f, indent=2)
        return {"msg": "Guidelines saved successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save guidelines: {str(e)}")

@app.get("/users")
async def get_users(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    users = []
    async for user in users_collection.find({}, {"_id": 0, "hashed_password": 0}):
        users.append(user)
    return users

@app.post("/delete-user")
async def delete_user(data: dict, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    username = data.get("username")
    if not username or username == current_user.get("username"):
        raise HTTPException(status_code=400, detail="Cannot delete self or invalid username")
    result = await users_collection.delete_one({"username": username})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"msg": f"User '{username}' deleted."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 