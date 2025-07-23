"""
Quick Start Script for Cancer Diagnosis AI System
This script helps you get the system up and running quickly.
"""

import os
import sys
import subprocess
import time
import requests
from pathlib import Path

def print_banner():
    """Print the system banner"""
    print("=" * 60)
    print("AI Cancer Diagnosis System - Quick Start")
    print("=" * 60)
    print()

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        print("ERROR: Python 3.8 or higher is required")
        print(f"Current version: {sys.version}")
        return False
    print(f"OK - Python version: {sys.version.split()[0]}")
    return True

def check_dependencies():
    """Check if required files exist"""
    required_files = [
        "requirements.txt",
        "Cancer_Data.csv",
        "app/main.py",
        "app/models.py",
        "app/ml_models.py"
    ]
    
    missing_files = []
    for file in required_files:
        if not Path(file).exists():
            missing_files.append(file)
    
    if missing_files:
        print("ERROR: Missing required files:")
        for file in missing_files:
            print(f"   - {file}")
        return False
    
    print("OK - All required files found")
    return True

def install_dependencies():
    """Install Python dependencies"""
    print("Installing Python dependencies...")
    try:
        # Use python -m pip for better compatibility
        result = subprocess.run([
            sys.executable, "-m", "pip", "install", "-r", "requirements.txt"
        ], capture_output=True, text=True, check=True)
        print("OK - Dependencies installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"ERROR: Installing dependencies failed: {e}")
        print(f"Error output: {e.stderr}")
        return False

def train_models():
    """Train the ML models"""
    print("Training machine learning models...")
    try:
        # Import and train models
        from app.ml_models import CancerDiagnosisModels
        
        ml_models = CancerDiagnosisModels()
        X, y = ml_models.load_data()
        results = ml_models.train_models(X, y)
        ml_models.save_models()
        
        print("OK - Models trained and saved successfully")
        print(f"   - Training samples: {len(X)}")
        print(f"   - Models created: {len(results)}")
        return True
    except Exception as e:
        print(f"ERROR: Training models failed: {e}")
        return False

def start_backend():
    """Start the FastAPI backend"""
    print("Starting backend server...")
    try:
        # Start the server in a subprocess
        process = subprocess.Popen([
            sys.executable, "-m", "uvicorn", "app.main:app", 
            "--host", "0.0.0.0", "--port", "8000", "--reload"
        ])
        
        # Wait a bit for the server to start
        time.sleep(3)
        
        # Test if the server is running
        try:
            response = requests.get("http://localhost:8000/health", timeout=5)
            if response.status_code == 200:
                print("OK - Backend server is running at http://localhost:8000")
                print("   - API Documentation: http://localhost:8000/docs")
                print("   - Health Check: http://localhost:8000/health")
                return process
            else:
                print("ERROR: Backend server failed to start properly")
                process.terminate()
                return None
        except requests.exceptions.RequestException:
            print("ERROR: Backend server failed to start")
            process.terminate()
            return None
            
    except Exception as e:
        print(f"ERROR: Starting backend failed: {e}")
        return None

def check_frontend():
    """Check if frontend is available"""
    print("Checking frontend setup...")
    
    frontend_dir = Path("frontend")
    if not frontend_dir.exists():
        print("WARNING: Frontend directory not found")
        print("   To set up frontend, run:")
        print("   cd frontend && npm install && npm start")
        return False
    
    package_json = frontend_dir / "package.json"
    if not package_json.exists():
        print("WARNING: Frontend package.json not found")
        return False
    
    print("OK - Frontend directory found")
    print("   To start frontend, run:")
    print("   cd frontend && npm install && npm start")
    return True

def main():
    """Main quick start function"""
    print_banner()
    
    # Check Python version
    if not check_python_version():
        sys.exit(1)
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    # Install dependencies
    if not install_dependencies():
        sys.exit(1)
    
    # Train models
    if not train_models():
        sys.exit(1)
    
    # Check frontend
    check_frontend()
    
    print("\n" + "=" * 60)
    print("SETUP COMPLETED SUCCESSFULLY!")
    print("=" * 60)
    
    # Ask if user wants to start the backend
    response = input("\nDo you want to start the backend server now? (y/n): ")
    if response.lower() in ['y', 'yes']:
        process = start_backend()
        if process:
            print("\nBackend server is running!")
            print("Press Ctrl+C to stop the server")
            try:
                process.wait()
            except KeyboardInterrupt:
                print("\nStopping server...")
                process.terminate()
                process.wait()
                print("OK - Server stopped")
    
    print("\nNEXT STEPS:")
    print("1. Start backend: python start.py")
    print("2. Start frontend: cd frontend && npm install && npm start")
    print("3. Open browser: http://localhost:3000")
    print("4. API docs: http://localhost:8000/docs")
    print("\nFor deployment instructions, see DEPLOYMENT.md")

if __name__ == "__main__":
    main() 