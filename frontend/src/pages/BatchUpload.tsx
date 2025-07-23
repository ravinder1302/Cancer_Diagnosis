import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import {
  DocumentArrowUpIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

const BatchUpload: React.FC = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [multiModalFiles, setMultiModalFiles] = useState<{
    radiological?: File | null;
    pathological?: File | null;
    genomics?: File | null;
    clinical?: File | null;
    pro?: File | null;
  }>({});
  const navigate = useNavigate();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        setUploadedFile(file);
      } else {
        setError("Please upload a CSV file");
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
    },
    multiple: false,
  });

  const handleMultiModalFile = (type: string, file: File | null) => {
    setMultiModalFiles((prev) => ({ ...prev, [type]: file }));
  };

  const handleUpload = async () => {
    if (!uploadedFile) return;

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", uploadedFile);
    if (multiModalFiles.radiological)
      formData.append("radiological_image_file", multiModalFiles.radiological);
    if (multiModalFiles.pathological)
      formData.append("pathological_image_file", multiModalFiles.pathological);
    if (multiModalFiles.genomics)
      formData.append("genomics_data_file", multiModalFiles.genomics);
    if (multiModalFiles.clinical)
      formData.append("clinical_records_file", multiModalFiles.clinical);
    if (multiModalFiles.pro)
      formData.append("patient_reported_outcomes_file", multiModalFiles.pro);

    const API_URL = process.env.REACT_APP_API_URL || "";
    try {
      const response = await axios.post(`${API_URL}/predict/batch`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(progress);
          }
        },
      });

      // Store results in localStorage
      localStorage.setItem("batchResults", JSON.stringify(response.data));
      localStorage.removeItem("diagnosisResults");

      // Navigate to results page
      navigate("/results");
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          "An error occurred during batch processing"
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const downloadTemplate = () => {
    const template = `radius_mean,texture_mean,perimeter_mean,area_mean,smoothness_mean,compactness_mean,concavity_mean,concave_points_mean,symmetry_mean,fractal_dimension_mean,radius_se,texture_se,perimeter_se,area_se,smoothness_se,compactness_se,concavity_se,concave_points_se,symmetry_se,fractal_dimension_se,radius_worst,texture_worst,perimeter_worst,area_worst,smoothness_worst,compactness_worst,concavity_worst,concave_points_worst,symmetry_worst,fractal_dimension_worst
17.99,10.38,122.8,1001,0.1184,0.2776,0.3001,0.1471,0.2419,0.07871,1.095,0.9053,8.589,153.4,0.006399,0.04904,0.05373,0.01587,0.03003,0.006193,25.38,17.33,184.6,2019,0.1622,0.6656,0.7119,0.2654,0.4601,0.1189
20.57,17.77,132.9,1326,0.08474,0.07864,0.0869,0.07017,0.1812,0.05667,0.5435,0.7339,3.398,74.08,0.005225,0.01308,0.0186,0.0134,0.01389,0.003532,24.99,23.41,158.8,1956,0.1238,0.1866,0.2416,0.186,0.275,0.08902`;

    const blob = new Blob([template], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cancer_diagnosis_template.csv";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-lg rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Batch Upload</h1>
          <p className="mt-1 text-sm text-gray-600">
            Upload a CSV file with multiple samples for batch cancer diagnosis
          </p>
          <p className="mt-1 text-xs text-blue-700">
            Optionally, upload additional files (images, genomics, clinical,
            outcomes) for multi-modal analysis. File names should match sample
            IDs in the CSV if per-sample, or provide a single file for all
            samples.
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Instructions
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>
                      Upload a CSV file with 30 columns (cell characteristics)
                    </li>
                    <li>Each row represents one sample</li>
                    <li>Column headers should match the template format</li>
                    <li>Maximum file size: 10MB</li>
                    <li>Supported format: CSV only</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Template Download */}
          <div className="flex justify-center">
            <button
              onClick={downloadTemplate}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <DocumentTextIcon className="h-4 w-4 mr-2" />
              Download CSV Template
            </button>
          </div>

          {/* Upload Area */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-blue-400 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <input {...getInputProps()} />
            <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              {isDragActive ? (
                <p className="text-lg font-medium text-blue-600">
                  Drop the CSV file here
                </p>
              ) : (
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    Drag and drop a CSV file here, or click to select
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Supports CSV files up to 10MB
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* File Info */}
          {uploadedFile && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex items-center">
                <DocumentTextIcon className="h-5 w-5 text-green-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    File Selected
                  </h3>
                  <p className="text-sm text-green-700">
                    {uploadedFile.name} (
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Multi-modal file uploads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Radiological Images (zip or image file)
              </label>
              <input
                type="file"
                accept=".zip,image/*"
                onChange={(e) =>
                  handleMultiModalFile(
                    "radiological",
                    e.target.files?.[0] || null
                  )
                }
                className="mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Pathological Images (zip or image file)
              </label>
              <input
                type="file"
                accept=".zip,image/*"
                onChange={(e) =>
                  handleMultiModalFile(
                    "pathological",
                    e.target.files?.[0] || null
                  )
                }
                className="mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Genomics Data (zip, text, or csv)
              </label>
              <input
                type="file"
                accept=".zip,.txt,.csv"
                onChange={(e) =>
                  handleMultiModalFile("genomics", e.target.files?.[0] || null)
                }
                className="mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Clinical Records (zip, text, or csv)
              </label>
              <input
                type="file"
                accept=".zip,.txt,.csv"
                onChange={(e) =>
                  handleMultiModalFile("clinical", e.target.files?.[0] || null)
                }
                className="mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Patient-Reported Outcomes (zip, text, or csv)
              </label>
              <input
                type="file"
                accept=".zip,.txt,.csv"
                onChange={(e) =>
                  handleMultiModalFile("pro", e.target.files?.[0] || null)
                }
                className="mt-1"
              />
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">{error}</div>
                </div>
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Processing...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => {
                setUploadedFile(null);
                setError(null);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Clear
            </button>
            <button
              onClick={handleUpload}
              disabled={!uploadedFile || isUploading}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? "Processing..." : "Process Batch"}
            </button>
          </div>
        </div>
      </div>

      {/* CSV Format Information */}
      <div className="mt-8 bg-white shadow-lg rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Required CSV Format
          </h2>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Column Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Example Value
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    radius_mean
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    Mean radius of the cell nucleus
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    17.99
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    texture_mean
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    Mean texture (standard deviation of gray-scale values)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    10.38
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ...
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    (30 total columns)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ...
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchUpload;
