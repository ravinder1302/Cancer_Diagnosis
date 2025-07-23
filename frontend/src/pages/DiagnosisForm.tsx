import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";

interface DiagnosisFormData {
  radius_mean: number;
  texture_mean: number;
  perimeter_mean: number;
  area_mean: number;
  smoothness_mean: number;
  compactness_mean: number;
  concavity_mean: number;
  concave_points_mean: number;
  symmetry_mean: number;
  fractal_dimension_mean: number;
  radius_se: number;
  texture_se: number;
  perimeter_se: number;
  area_se: number;
  smoothness_se: number;
  compactness_se: number;
  concavity_se: number;
  concave_points_se: number;
  symmetry_se: number;
  fractal_dimension_se: number;
  radius_worst: number;
  texture_worst: number;
  perimeter_worst: number;
  area_worst: number;
  smoothness_worst: number;
  compactness_worst: number;
  concavity_worst: number;
  concave_points_worst: number;
  symmetry_worst: number;
  fractal_dimension_worst: number;
  radiological_image?: string;
  radiological_image_file?: FileList;
  pathological_image?: string;
  pathological_image_file?: FileList;
  genomics_data?: string;
  genomics_data_file?: FileList;
  clinical_records?: string;
  clinical_records_file?: FileList;
  patient_reported_outcomes?: string;
  patient_reported_outcomes_file?: FileList;
}

const DiagnosisForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DiagnosisFormData>();

  const onSubmit = async (data: DiagnosisFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key.endsWith("_file") && value && (value as FileList).length > 0) {
          formData.append(key, (value as FileList)[0]);
        } else if (
          !key.endsWith("_file") &&
          value !== undefined &&
          value !== null &&
          value !== ""
        ) {
          formData.append(key, value as any);
        }
      });
      const API_URL = process.env.REACT_APP_API_URL || "";
      const response = await axios.post(
        `${API_URL}/predict/comprehensive`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      localStorage.setItem("diagnosisResults", JSON.stringify(response.data));
      localStorage.removeItem("batchResults");
      navigate("/results");
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "An error occurred during prediction"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    reset();
    setError(null);
  };

  const featureGroups = [
    {
      title: "Mean Values",
      features: [
        {
          name: "radius_mean",
          label: "Radius Mean",
          description: "Mean radius of the cell nucleus",
        },
        {
          name: "texture_mean",
          label: "Texture Mean",
          description: "Mean texture (standard deviation of gray-scale values)",
        },
        {
          name: "perimeter_mean",
          label: "Perimeter Mean",
          description: "Mean perimeter of the cell nucleus",
        },
        {
          name: "area_mean",
          label: "Area Mean",
          description: "Mean area of the cell nucleus",
        },
        {
          name: "smoothness_mean",
          label: "Smoothness Mean",
          description: "Mean smoothness (local variation in radius lengths)",
        },
        {
          name: "compactness_mean",
          label: "Compactness Mean",
          description: "Mean compactness (perimeter² / area - 1.0)",
        },
        {
          name: "concavity_mean",
          label: "Concavity Mean",
          description:
            "Mean concavity (severity of concave portions of the contour)",
        },
        {
          name: "concave_points_mean",
          label: "Concave Points Mean",
          description: "Mean number of concave portions of the contour",
        },
        {
          name: "symmetry_mean",
          label: "Symmetry Mean",
          description: "Mean symmetry of the cell nucleus",
        },
        {
          name: "fractal_dimension_mean",
          label: "Fractal Dimension Mean",
          description: "Mean fractal dimension (coastline approximation)",
        },
      ],
    },
    {
      title: "Standard Error Values",
      features: [
        {
          name: "radius_se",
          label: "Radius SE",
          description: "Standard error of radius",
        },
        {
          name: "texture_se",
          label: "Texture SE",
          description: "Standard error of texture",
        },
        {
          name: "perimeter_se",
          label: "Perimeter SE",
          description: "Standard error of perimeter",
        },
        {
          name: "area_se",
          label: "Area SE",
          description: "Standard error of area",
        },
        {
          name: "smoothness_se",
          label: "Smoothness SE",
          description: "Standard error of smoothness",
        },
        {
          name: "compactness_se",
          label: "Compactness SE",
          description: "Standard error of compactness",
        },
        {
          name: "concavity_se",
          label: "Concavity SE",
          description: "Standard error of concavity",
        },
        {
          name: "concave_points_se",
          label: "Concave Points SE",
          description: "Standard error of concave points",
        },
        {
          name: "symmetry_se",
          label: "Symmetry SE",
          description: "Standard error of symmetry",
        },
        {
          name: "fractal_dimension_se",
          label: "Fractal Dimension SE",
          description: "Standard error of fractal dimension",
        },
      ],
    },
    {
      title: "Worst Values",
      features: [
        {
          name: "radius_worst",
          label: "Radius Worst",
          description: "Largest radius of the cell nucleus",
        },
        {
          name: "texture_worst",
          label: "Texture Worst",
          description: "Largest texture value",
        },
        {
          name: "perimeter_worst",
          label: "Perimeter Worst",
          description: "Largest perimeter of the cell nucleus",
        },
        {
          name: "area_worst",
          label: "Area Worst",
          description: "Largest area of the cell nucleus",
        },
        {
          name: "smoothness_worst",
          label: "Smoothness Worst",
          description: "Largest smoothness value",
        },
        {
          name: "compactness_worst",
          label: "Compactness Worst",
          description: "Largest compactness value",
        },
        {
          name: "concavity_worst",
          label: "Concavity Worst",
          description: "Largest concavity value",
        },
        {
          name: "concave_points_worst",
          label: "Concave Points Worst",
          description: "Largest number of concave portions",
        },
        {
          name: "symmetry_worst",
          label: "Symmetry Worst",
          description: "Largest symmetry value",
        },
        {
          name: "fractal_dimension_worst",
          label: "Fractal Dimension Worst",
          description: "Largest fractal dimension value",
        },
      ],
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-lg rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">
            Cancer Diagnosis Form
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Enter the cell characteristics to get a comprehensive AI-powered
            cancer diagnosis
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    {typeof error === "string"
                      ? error
                      : Array.isArray(error)
                      ? (error as any[]).map((e: any, i: number) => (
                          <div key={i}>{e.msg || JSON.stringify(e)}</div>
                        ))
                      : error && (error as any).msg
                      ? (error as any).msg
                      : JSON.stringify(error)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {featureGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                  {group.title}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Enter the {group.title.toLowerCase()} for each cell
                  characteristic
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {group.features.map((feature) => (
                  <div key={feature.name} className="space-y-2">
                    <label
                      htmlFor={feature.name}
                      className="block text-sm font-medium text-gray-700"
                    >
                      {feature.label}
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      id={feature.name}
                      {...register(feature.name as keyof DiagnosisFormData, {
                        required: `${feature.label} is required`,
                        min: {
                          value: 0,
                          message: `${feature.label} must be positive`,
                        },
                      })}
                      className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                        errors[feature.name as keyof DiagnosisFormData]
                          ? "border-red-300"
                          : ""
                      }`}
                      placeholder="0.000"
                    />
                    {errors[feature.name as keyof DiagnosisFormData] && (
                      <p className="text-sm text-red-600">
                        {
                          errors[feature.name as keyof DiagnosisFormData]
                            ?.message
                        }
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="flex flex-col gap-6 pt-6 border-t border-gray-200">
            {/* Multi-modal data fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Radiological Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Radiological Image (URL or file)
                </label>
                <input
                  type="text"
                  placeholder="Paste image URL or description"
                  {...register("radiological_image")}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm mt-1"
                />
                <input
                  type="file"
                  accept="image/*"
                  {...register("radiological_image_file")}
                  className="mt-2"
                />
              </div>
              {/* Pathological Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Pathological Image (URL or file)
                </label>
                <input
                  type="text"
                  placeholder="Paste image URL or description"
                  {...register("pathological_image")}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm mt-1"
                />
                <input
                  type="file"
                  accept="image/*"
                  {...register("pathological_image_file")}
                  className="mt-2"
                />
              </div>
              {/* Genomics Data */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Genomics Data (text, file, or URL)
                </label>
                <input
                  type="text"
                  placeholder="Paste genomics data, file name, or URL"
                  {...register("genomics_data")}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm mt-1"
                />
                <input
                  type="file"
                  {...register("genomics_data_file")}
                  className="mt-2"
                />
              </div>
              {/* Clinical Records */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Clinical Records (text, file, or URL)
                </label>
                <input
                  type="text"
                  placeholder="Paste clinical records, file name, or URL"
                  {...register("clinical_records")}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm mt-1"
                />
                <input
                  type="file"
                  {...register("clinical_records_file")}
                  className="mt-2"
                />
              </div>
              {/* Patient-Reported Outcomes */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Patient-Reported Outcomes (text, file, or URL)
                </label>
                <input
                  type="text"
                  placeholder="Paste outcomes, file name, or URL"
                  {...register("patient_reported_outcomes")}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm mt-1"
                />
                <input
                  type="file"
                  {...register("patient_reported_outcomes_file")}
                  className="mt-2"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Reset Form
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Analyzing...
                </div>
              ) : (
                "Get Diagnosis"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DiagnosisForm;
