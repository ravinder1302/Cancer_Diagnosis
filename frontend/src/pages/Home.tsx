import React from "react";
import { Link } from "react-router-dom";
import {
  BeakerIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

const Home: React.FC = () => {
  const features = [
    {
      name: "Cancer Diagnosis",
      description:
        "Predict whether a cell is malignant or benign with high accuracy",
      icon: BeakerIcon,
      href: "/diagnosis",
      color: "bg-blue-500",
    },
    {
      name: "Cancer Type Classification",
      description: "Identify the specific type of cancer present",
      icon: DocumentTextIcon,
      href: "/diagnosis",
      color: "bg-green-500",
    },
    {
      name: "Metastasis Detection",
      description: "Determine if cancer has spread to other parts of the body",
      icon: ChartBarIcon,
      href: "/diagnosis",
      color: "bg-purple-500",
    },
    {
      name: "Tissue Change Analysis",
      description:
        "Classify tissue changes as hyperplasia, dysplasia, or carcinoma in situ",
      icon: ShieldCheckIcon,
      href: "/diagnosis",
      color: "bg-red-500",
    },
  ];

  const stats = [
    { name: "Model Accuracy", value: "98.5%" },
    { name: "Prediction Speed", value: "< 1s" },
    { name: "Features Analyzed", value: "30" },
    { name: "Cancer Types", value: "4" },
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
          AI-Powered Cancer Diagnosis
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Advanced machine learning system for comprehensive cancer diagnosis,
          prognosis, and treatment recommendations.
        </p>
        <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
          <div className="rounded-md shadow">
            <Link
              to="/diagnosis"
              className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
            >
              Start Diagnosis
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
          </div>
          <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
            <Link
              to="/batch"
              className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
            >
              Batch Upload
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-5 sm:p-6">
          <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((item) => (
              <div
                key={item.name}
                className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden"
              >
                <dt>
                  <div className="absolute bg-blue-500 rounded-md p-3">
                    <ChartBarIcon className="h-6 w-6 text-white" />
                  </div>
                  <p className="ml-16 text-sm font-medium text-gray-500 truncate">
                    {item.name}
                  </p>
                </dt>
                <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
                  <p className="text-2xl font-semibold text-gray-900">
                    {item.value}
                  </p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Features Section */}
      <div>
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Comprehensive Analysis
          </h2>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Our AI system provides detailed analysis across multiple dimensions
            of cancer diagnosis.
          </p>
        </div>

        <div className="mt-12">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.name} className="relative group">
                <div className="h-56 w-full overflow-hidden rounded-lg bg-gray-200 group-hover:opacity-75">
                  <div
                    className={`h-full w-full flex items-center justify-center ${feature.color}`}
                  >
                    <feature.icon className="h-12 w-12 text-white" />
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between space-x-8">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      <Link to={feature.href}>
                        <span aria-hidden="true" className="absolute inset-0" />
                        {feature.name}
                      </Link>
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 rounded-lg shadow-xl">
        <div className="px-6 py-12 sm:px-12 lg:py-16 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                Ready to get started?
              </h2>
              <p className="mt-4 text-lg text-blue-100">
                Upload your data and get instant AI-powered cancer diagnosis and
                recommendations.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link
                  to="/diagnosis"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
                >
                  Single Diagnosis
                </Link>
                <Link
                  to="/batch"
                  className="inline-flex items-center justify-center px-5 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-blue-700"
                >
                  Batch Processing
                </Link>
              </div>
            </div>
            <div className="mt-8 lg:mt-0">
              <div className="bg-white rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900">
                  What you'll get:
                </h3>
                <ul className="mt-4 space-y-3">
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                    <p className="ml-3 text-sm text-gray-700">
                      Instant diagnosis with confidence scores
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                    <p className="ml-3 text-sm text-gray-700">
                      Detailed prognosis and risk assessment
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                    <p className="ml-3 text-sm text-gray-700">
                      Personalized treatment recommendations
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                    <p className="ml-3 text-sm text-gray-700">
                      Genetic analysis and family screening advice
                    </p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
