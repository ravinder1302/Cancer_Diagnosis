import pandas as pd

# Load the CSV
df = pd.read_csv('Cancer_Data.csv')

# Rename columns with spaces to underscores for concave_points fields
rename_map = {
    'concave points_mean': 'concave_points_mean',
    'concave points_se': 'concave_points_se',
    'concave points_worst': 'concave_points_worst',
}
df.rename(columns=rename_map, inplace=True)

# Save the updated CSV
df.to_csv('Cancer_Data.csv', index=False)

print('CSV headers fixed and saved to Cancer_Data.csv') 