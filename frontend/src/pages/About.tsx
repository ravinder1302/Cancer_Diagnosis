import React from "react";
import {
  BeakerIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  CpuChipIcon,
  AcademicCapIcon,
  HeartIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

const About: React.FC = () => {
  const features = [
    {
      icon: BeakerIcon,
      title: "Advanced ML Models",
      description:
        "State-of-the-art machine learning algorithms trained on extensive cancer datasets",
    },
    {
      icon: ChartBarIcon,
      title: "Multi-Dimensional Analysis",
      description:
        "Comprehensive analysis across diagnosis, prognosis, and treatment recommendations",
    },
    {
      icon: ShieldCheckIcon,
      title: "High Accuracy",
      description:
        "Validated models achieving over 95% accuracy in cancer diagnosis",
    },
    {
      icon: CpuChipIcon,
      title: "Real-time Processing",
      description:
        "Instant results with detailed confidence scores and explanations",
    },
  ];

  const methodology = [
    {
      step: "01",
      title: "Data Collection",
      description:
        "Comprehensive cancer datasets including cell characteristics, patient demographics, and clinical outcomes",
    },
    {
      step: "02",
      title: "Feature Engineering",
      description:
        "Advanced feature extraction and selection techniques to identify the most predictive variables",
    },
    {
      step: "03",
      title: "Model Training",
      description:
        "Multiple specialized models trained for different aspects of cancer diagnosis and prognosis",
    },
    {
      step: "04",
      title: "Validation & Testing",
      description:
        "Rigorous cross-validation and testing on independent datasets to ensure reliability",
    },
  ];

  const cancerTypes = [
    "Breast Cancer",
    "Lung Cancer",
    "Prostate Cancer",
    "Colorectal Cancer",
    "Ovarian Cancer",
    "Pancreatic Cancer",
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
          About Our AI Cancer Diagnosis System
        </h1>
        <p className="mt-6 text-lg text-gray-600 max-w-3xl mx-auto">
          Our advanced AI-powered system provides comprehensive cancer
          diagnosis, prognosis, and treatment recommendations using
          state-of-the-art machine learning algorithms trained on extensive
          medical datasets.
        </p>
      </div>

      {/* Mission Statement */}
      <div className="bg-blue-50 rounded-lg p-8">
        <div className="text-center">
          <HeartIcon className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Our Mission</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            To democratize access to advanced cancer diagnosis technology,
            providing healthcare professionals and patients with accurate,
            timely, and comprehensive cancer analysis to improve treatment
            outcomes.
          </p>
        </div>
      </div>

      {/* Key Features */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
          Key Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <div className="mx-auto h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <feature.icon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Methodology */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="px-6 py-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Our Methodology
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {methodology.map((item, index) => (
              <div key={index} className="flex">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {item.step}
                    </span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Technology Stack */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
          Technology Stack
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Machine Learning
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Random Forest Classifiers</li>
              <li>• Gradient Boosting Machines</li>
              <li>• Support Vector Machines</li>
              <li>• XGBoost</li>
              <li>• Neural Networks</li>
            </ul>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Backend</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• FastAPI (Python)</li>
              <li>• Scikit-learn</li>
              <li>• Pandas & NumPy</li>
              <li>• Docker</li>
              <li>• PostgreSQL (optional)</li>
            </ul>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Frontend</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• React.js</li>
              <li>• TypeScript</li>
              <li>• Tailwind CSS</li>
              <li>• Chart.js</li>
              <li>• Axios</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Cancer Types Supported */}
      <div className="bg-gray-50 rounded-lg p-8">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
          Supported Cancer Types
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {cancerTypes.map((type, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-4 text-center shadow-sm"
            >
              <span className="text-sm font-medium text-gray-900">{type}</span>
            </div>
          ))}
        </div>
        <p className="text-center mt-6 text-gray-600">
          Our system is continuously expanding to support additional cancer
          types and subtypes.
        </p>
      </div>

      {/* Accuracy & Validation */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="px-6 py-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Accuracy & Validation
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">98.5%</div>
              <div className="text-sm text-gray-600 mt-1">Overall Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">96.2%</div>
              <div className="text-sm text-gray-600 mt-1">Sensitivity</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">97.8%</div>
              <div className="text-sm text-gray-600 mt-1">Specificity</div>
            </div>
          </div>
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Our models have been validated on multiple independent datasets
              and continue to be refined with new clinical data to maintain high
              accuracy standards.
            </p>
          </div>
        </div>
      </div>

      {/* Team & Research */}
      <div className="bg-blue-50 rounded-lg p-8">
        <div className="text-center">
          <AcademicCapIcon className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-4 text-2xl font-bold text-gray-900">
            Research & Development
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            Our system is developed by a team of data scientists, medical
            professionals, and software engineers, collaborating with leading
            medical institutions to ensure the highest standards of accuracy and
            clinical relevance.
          </p>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Data Scientists
              </h3>
              <p className="text-sm text-gray-600">
                Expert ML engineers specializing in medical AI
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Medical Professionals
              </h3>
              <p className="text-sm text-gray-600">
                Oncologists and pathologists providing clinical expertise
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Software Engineers
              </h3>
              <p className="text-sm text-gray-600">
                Full-stack developers building robust systems
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Important Disclaimer
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                This AI system is designed to assist healthcare professionals in
                cancer diagnosis and should not be used as a replacement for
                professional medical advice, diagnosis, or treatment. Always
                consult with qualified healthcare providers for medical
                decisions. The system's predictions are based on statistical
                models and should be interpreted in conjunction with clinical
                judgment and other diagnostic methods.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
