import os
import sys

print('Python version:', sys.version)

try:
    import sklearn
    print('scikit-learn version:', sklearn.__version__)
except ImportError:
    print('scikit-learn not installed')

try:
    import xgboost
    print('xgboost version:', xgboost.__version__)
except ImportError:
    print('xgboost not installed')

try:
    import pandas as pd
    print('pandas version:', pd.__version__)
except ImportError:
    print('pandas not installed')

try:
    import joblib
    print('joblib version:', joblib.__version__)
except ImportError:
    print('joblib not installed')

print('\nModel/scaler .pkl file sizes in models/:')
models_dir = 'models'
if os.path.exists(models_dir):
    for fname in os.listdir(models_dir):
        if fname.endswith('.pkl'):
            fpath = os.path.join(models_dir, fname)
            print(f'{fname}: {os.path.getsize(fpath)} bytes')
else:
    print('models/ directory does not exist') 