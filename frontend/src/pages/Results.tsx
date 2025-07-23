import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowLeftIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";
import jsPDF from "jspdf";

import autoTable from "jspdf-autotable";

interface DiagnosisResult {
  prediction: string;
  confidence: number;
  risk_level: string;
  recommendations: string[];
}

interface CancerTypeResult {
  prediction: string;
  confidence: number;
  probability: { [key: string]: number };
  characteristics: { [key: string]: string };
  subtypes: string[];
}

interface MetastasisResult {
  prediction: string;
  confidence: number;
  probability: { [key: string]: number };
  stage: string;
  spread_risk: string;
  locations: string[];
}

interface TissueChangeResult {
  prediction: string;
  confidence: number;
  probability: { [key: string]: number };
  severity: string;
  progression_risk: string;
}

interface PrognosisResult {
  prediction: string;
  confidence: number;
  survival_rate: number;
  risk_factors: string[];
  monitoring_schedule: string;
}

interface TherapyResult {
  primary_treatment: string;
  alternative_treatments: string[];
  urgency: string;
  success_rate: number;
  side_effects: string[];
  recommendations: string[];
  priority: string;
  timeline: string;
}

interface GeneticResult {
  mutations: string[];
  risk_genes: string[];
  hereditary_risk: string;
  family_screening: string[];
  risk_score: number;
}

interface ComprehensiveResult {
  diagnosis: DiagnosisResult;
  cancer_type: CancerTypeResult;
  metastasis: MetastasisResult;
  tissue_change: TissueChangeResult;
  prognosis: PrognosisResult;
  therapy: TherapyResult;
  genetic: GeneticResult;
  overall_risk: string;
  next_steps: string[];
  confidence_score: number;
  timestamp: string;
  radiological_image?: string;
  pathological_image?: string;
  genomics_data?: string;
  clinical_records?: string;
  patient_reported_outcomes?: string;
}

const Results: React.FC = () => {
  const [results, setResults] = useState<ComprehensiveResult | null>(null);
  const [batchResults, setBatchResults] = useState<any>(null);
  const [isBatchMode, setIsBatchMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Restore batchResults if coming back from a detailed sample, but only if not viewing a detailed result
    if (
      !localStorage.getItem("batchResults") &&
      !localStorage.getItem("diagnosisResults") &&
      localStorage.getItem("fromBatchResults") === "true" &&
      sessionStorage.getItem("batchResultsBackup")
    ) {
      localStorage.setItem(
        "batchResults",
        sessionStorage.getItem("batchResultsBackup") || ""
      );
      localStorage.removeItem("diagnosisResults");
      localStorage.removeItem("fromBatchResults");
      window.location.reload();
      return;
    }
    const storedResults = localStorage.getItem("diagnosisResults");
    const storedBatchResults = localStorage.getItem("batchResults");

    if (storedResults) {
      setResults(JSON.parse(storedResults));
      setIsBatchMode(false);
    } else if (storedBatchResults && !storedResults) {
      setBatchResults(JSON.parse(storedBatchResults));
      setIsBatchMode(true);
    } else {
      navigate("/diagnosis");
    }
  }, [navigate]);

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case "high risk":
        return "text-red-600 bg-red-100";
      case "medium risk":
        return "text-yellow-600 bg-yellow-100";
      case "low risk":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return "text-green-600";
    if (confidence >= 0.7) return "text-yellow-600";
    return "text-red-600";
  };

  const downloadResults = () => {
    if (!results) return;

    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = window.URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `cancer_diagnosis_results_${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const downloadPDF = () => {
    if (!results) return;
    const doc = new jsPDF();

    // --- Logo (random design) ---
    doc.setDrawColor(60, 120, 216); // blue
    doc.setFillColor(60, 120, 216);
    doc.circle(20, 15, 8, "F");
    doc.setDrawColor(0, 180, 120); // green
    doc.setFillColor(0, 180, 120);
    doc.circle(35, 15, 8, "F");
    doc.setDrawColor(255, 180, 0); // yellow
    doc.setFillColor(255, 180, 0);
    doc.circle(27.5, 25, 8, "F");
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    doc.setFont("helvetica", "bold");
    doc.text("Cancer Diagnosis Report", 50, 20);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text(`Date: ${new Date(results.timestamp).toLocaleString()}`, 150, 20);
    doc.setDrawColor(200, 200, 200);
    doc.line(10, 28, 200, 28);

    let y = 34;
    // --- Section: Diagnosis ---
    doc.setFillColor(60, 120, 216);
    doc.rect(10, y, 190, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("Diagnosis", 14, y + 6);
    y += 12;
    doc.setTextColor(40, 40, 40);
    doc.setFont("helvetica", "normal");
    doc.text(`Result: ${results.diagnosis.prediction}`, 14, y);
    y += 7;
    doc.text(
      `Confidence: ${(results.diagnosis.confidence * 100).toFixed(1)}%`,
      14,
      y
    );
    y += 7;
    doc.text(`Risk Level: ${results.diagnosis.risk_level}`, 14, y);
    y += 2;
    autoTable(doc, {
      startY: y,
      head: [["Recommendations"]],
      body: results.diagnosis.recommendations.map((rec: string) => [rec]),
      theme: "striped",
      headStyles: {
        fillColor: [60, 120, 216],
        textColor: 255,
        fontStyle: "bold",
      },
      styles: { fontSize: 10, cellPadding: 2 },
      margin: { left: 14, right: 14 },
      tableWidth: 180,
    });
    y = (doc as any).lastAutoTable?.finalY + 6 || y + 6;

    // --- Section: Cancer Type ---
    doc.setFillColor(0, 180, 120);
    doc.rect(10, y, 190, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("Cancer Type", 14, y + 6);
    y += 12;
    doc.setTextColor(40, 40, 40);
    doc.setFont("helvetica", "normal");
    doc.text(`Type: ${results.cancer_type.prediction}`, 14, y);
    y += 7;
    doc.text(
      `Confidence: ${(results.cancer_type.confidence * 100).toFixed(1)}%`,
      14,
      y
    );
    y += 7;
    doc.text(
      `Subtype(s): ${results.cancer_type.subtypes?.join(", ") || "-"}`,
      14,
      y
    );
    y += 7;
    doc.text(
      `Characteristics: ${Object.values(
        results.cancer_type.characteristics
      ).join(", ")}`,
      14,
      y
    );
    y += 6;

    autoTable(doc, {
      startY: y,
      head: [["Subtype(s)", "Characteristics"]],
      body: [
        [
          results.cancer_type.subtypes?.join(", ") || "-",
          Object.values(results.cancer_type.characteristics).join(", "),
        ],
      ],
      theme: "striped",
      headStyles: {
        fillColor: [0, 180, 120],
        textColor: 255,
        fontStyle: "bold",
      },
      styles: { fontSize: 10, cellPadding: 2 },
      margin: { left: 14, right: 14 },
      tableWidth: 180,
    });
    y = (doc as any).lastAutoTable?.finalY + 6 || y + 6;

    // --- Section: Metastasis ---
    doc.setFillColor(255, 180, 0);
    doc.rect(10, y, 190, 8, "F");
    doc.setTextColor(40, 40, 40);
    doc.setFont("helvetica", "bold");
    doc.text("Metastasis", 14, y + 6);
    y += 12;
    doc.setFont("helvetica", "normal");
    doc.text(`Status: ${results.metastasis.prediction}`, 14, y);
    y += 7;
    doc.text(
      `Confidence: ${(results.metastasis.confidence * 100).toFixed(1)}%`,
      14,
      y
    );
    y += 7;
    doc.text(`Stage: ${results.metastasis.stage}`, 14, y);
    y += 7;
    doc.text(`Spread Risk: ${results.metastasis.spread_risk}`, 14, y);
    y += 7;
    doc.text(
      `Locations: ${results.metastasis.locations?.join(", ") || "-"}`,
      14,
      y
    );
    y += 6;

    autoTable(doc, {
      startY: y,
      head: [["Locations"]],
      body: [[results.metastasis.locations?.join(", ") || "-"]],
      theme: "striped",
      headStyles: {
        fillColor: [255, 180, 0],
        textColor: 40,
        fontStyle: "bold",
      },
      styles: { fontSize: 10, cellPadding: 2 },
      margin: { left: 14, right: 14 },
      tableWidth: 180,
    });
    y = (doc as any).lastAutoTable?.finalY + 6 || y + 6;

    // --- Section: Tissue Change ---
    doc.setFillColor(120, 60, 216);
    doc.rect(10, y, 190, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("Tissue Change", 14, y + 6);
    y += 12;
    doc.setTextColor(40, 40, 40);
    doc.setFont("helvetica", "normal");
    doc.text(`Type: ${results.tissue_change.prediction}`, 14, y);
    y += 7;
    doc.text(`Severity: ${results.tissue_change.severity}`, 14, y);
    y += 7;
    doc.text(
      `Progression Risk: ${results.tissue_change.progression_risk}`,
      14,
      y
    );
    y += 6;

    autoTable(doc, {
      startY: y,
      head: [["Severity", "Progression Risk"]],
      body: [
        [
          results.tissue_change.severity,
          results.tissue_change.progression_risk,
        ],
      ],
      theme: "striped",
      headStyles: {
        fillColor: [120, 60, 216],
        textColor: 255,
        fontStyle: "bold",
      },
      styles: { fontSize: 10, cellPadding: 2 },
      margin: { left: 14, right: 14 },
      tableWidth: 180,
    });
    y = (doc as any).lastAutoTable?.finalY + 6 || y + 6;

    // --- Section: Prognosis ---
    doc.setFillColor(60, 120, 216);
    doc.rect(10, y, 190, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("Prognosis", 14, y + 6);
    y += 12;
    doc.setTextColor(40, 40, 40);
    doc.setFont("helvetica", "normal");
    doc.text(`Outcome: ${results.prognosis.prediction}`, 14, y);
    y += 7;
    doc.text(
      `Confidence: ${(results.prognosis.confidence * 100).toFixed(1)}%`,
      14,
      y
    );
    y += 7;
    doc.text(
      `5-year Survival Rate: ${(results.prognosis.survival_rate * 100).toFixed(
        1
      )}%`,
      14,
      y
    );
    y += 7;
    doc.text(`Monitoring: ${results.prognosis.monitoring_schedule}`, 14, y);
    y += 2;
    autoTable(doc, {
      startY: y,
      head: [["Risk Factors"]],
      body: results.prognosis.risk_factors.map((factor: string) => [factor]),
      theme: "striped",
      headStyles: {
        fillColor: [60, 120, 216],
        textColor: 255,
        fontStyle: "bold",
      },
      styles: { fontSize: 10, cellPadding: 2 },
      margin: { left: 14, right: 14 },
      tableWidth: 180,
    });
    y = (doc as any).lastAutoTable?.finalY + 6 || y + 6;

    // --- Section: Therapy ---
    doc.setFillColor(0, 180, 120);
    doc.rect(10, y, 190, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("Therapy", 14, y + 6);
    y += 12;
    doc.setTextColor(40, 40, 40);
    doc.setFont("helvetica", "normal");
    doc.text(`Primary: ${results.therapy.primary_treatment}`, 14, y);
    y += 7;
    doc.text(
      `Alternatives: ${results.therapy.alternative_treatments.join(", ")}`,
      14,
      y
    );
    y += 7;
    doc.text(`Priority: ${results.therapy.priority}`, 14, y);
    y += 7;
    doc.text(`Timeline: ${results.therapy.timeline}`, 14, y);
    y += 7;
    doc.text(
      `Success Rate: ${(results.therapy.success_rate * 100).toFixed(1)}%`,
      14,
      y
    );
    y += 2;
    autoTable(doc, {
      startY: y,
      head: [["Side Effects"]],
      body: results.therapy.side_effects.map((effect: string) => [effect]),
      theme: "striped",
      headStyles: {
        fillColor: [0, 180, 120],
        textColor: 255,
        fontStyle: "bold",
      },
      styles: { fontSize: 10, cellPadding: 2 },
      margin: { left: 14, right: 14 },
      tableWidth: 180,
    });
    y = (doc as any).lastAutoTable?.finalY + 6 || y + 6;
    autoTable(doc, {
      startY: y,
      head: [["Recommendations"]],
      body: results.therapy.recommendations.map((rec: string) => [rec]),
      theme: "striped",
      headStyles: {
        fillColor: [0, 180, 120],
        textColor: 255,
        fontStyle: "bold",
      },
      styles: { fontSize: 10, cellPadding: 2 },
      margin: { left: 14, right: 14 },
      tableWidth: 180,
    });
    y = (doc as any).lastAutoTable?.finalY + 6 || y + 6;

    // --- Section: Genetic Analysis ---
    doc.setFillColor(255, 180, 0);
    doc.rect(10, y, 190, 8, "F");
    doc.setTextColor(40, 40, 40);
    doc.setFont("helvetica", "bold");
    doc.text("Genetic Analysis", 14, y + 6);
    y += 12;
    doc.setFont("helvetica", "normal");
    doc.text(`Mutations: ${results.genetic.mutations.join(", ")}`, 14, y);
    y += 7;
    doc.text(`Risk Genes: ${results.genetic.risk_genes.join(", ")}`, 14, y);
    y += 7;
    doc.text(`Hereditary Risk: ${results.genetic.hereditary_risk}`, 14, y);
    y += 7;
    doc.text(`Risk Score: ${results.genetic.risk_score}/10`, 14, y);
    y += 2;
    autoTable(doc, {
      startY: y,
      head: [["Family Screening"]],
      body: results.genetic.family_screening.map((rec: string) => [rec]),
      theme: "striped",
      headStyles: {
        fillColor: [255, 180, 0],
        textColor: 40,
        fontStyle: "bold",
      },
      styles: { fontSize: 10, cellPadding: 2 },
      margin: { left: 14, right: 14 },
      tableWidth: 180,
    });
    y = (doc as any).lastAutoTable?.finalY + 6 || y + 6;

    // --- Section: Overall Risk & Next Steps ---
    doc.setFillColor(120, 60, 216);
    doc.rect(10, y, 190, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("Overall Risk & Next Steps", 14, y + 6);
    y += 12;
    doc.setTextColor(40, 40, 40);
    doc.setFont("helvetica", "normal");
    doc.text(`Overall Risk: ${results.overall_risk}`, 14, y);
    y += 2;
    autoTable(doc, {
      startY: y,
      head: [["Next Steps"]],
      body: results.next_steps.map((step: string) => [step]),
      theme: "striped",
      headStyles: {
        fillColor: [120, 60, 216],
        textColor: 255,
        fontStyle: "bold",
      },
      styles: { fontSize: 10, cellPadding: 2 },
      margin: { left: 14, right: 14 },
      tableWidth: 180,
    });
    y = (doc as any).lastAutoTable?.finalY + 10 || y + 10;

    // --- Footer ---
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text(
      "This report is generated by the AI Cancer Diagnosis System. For professional medical advice, consult a licensed healthcare provider.",
      105,
      285,
      { align: "center" }
    );
    doc.text("Contact: support@cancerdiagnosis.ai", 105, 291, {
      align: "center",
    });

    doc.save(
      `cancer_diagnosis_results_${new Date().toISOString().split("T")[0]}.pdf`
    );
  };

  const handleBatchSampleClick = (prediction: any, index: number) => {
    localStorage.setItem("diagnosisResults", JSON.stringify(prediction));
    if (batchResults) {
      sessionStorage.setItem(
        "batchResultsBackup",
        JSON.stringify(batchResults)
      );
    }
    localStorage.setItem("fromBatchResults", "true");
    localStorage.removeItem("batchResults");
    window.location.assign(`/results?sample=${index}`);
  };

  if (results) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Back Button */}
        <div className="pt-6 pb-2">
          <button
            onClick={() => {
              if (localStorage.getItem("fromBatchResults") === "true") {
                // Restore batchResults and go back to batch results table
                if (sessionStorage.getItem("batchResultsBackup")) {
                  localStorage.setItem(
                    "batchResults",
                    sessionStorage.getItem("batchResultsBackup") || ""
                  );
                  localStorage.removeItem("diagnosisResults");
                  localStorage.removeItem("fromBatchResults");
                  window.location.reload();
                } else {
                  navigate("/batch");
                }
              } else {
                navigate(-1);
              }
            }}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back
          </button>
        </div>
        {/* Header */}
        <div className="bg-white shadow-lg rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Diagnosis Results
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  Comprehensive AI analysis completed on{" "}
                  {new Date(results.timestamp).toLocaleString()}
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={downloadResults}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                  Download
                </button>
                <button
                  onClick={downloadPDF}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Download as PDF
                </button>
                <button
                  onClick={() => navigate("/diagnosis")}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  New Analysis
                </button>
              </div>
            </div>
          </div>

          {/* Overall Summary */}
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900">
                  Primary Diagnosis
                </h3>
                <div className="mt-2">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      results.diagnosis.prediction === "Malignant"
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {results.diagnosis.prediction === "Malignant" ? (
                      <XCircleIcon className="h-4 w-4 mr-1" />
                    ) : (
                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                    )}
                    {results.diagnosis.prediction}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Confidence:{" "}
                  <span
                    className={getConfidenceColor(results.diagnosis.confidence)}
                  >
                    {(results.diagnosis.confidence * 100).toFixed(1)}%
                  </span>
                </p>
              </div>

              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900">
                  Overall Risk
                </h3>
                <div className="mt-2">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(
                      results.overall_risk
                    )}`}
                  >
                    {results.overall_risk}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  System Confidence:{" "}
                  <span
                    className={getConfidenceColor(results.confidence_score)}
                  >
                    {(results.confidence_score * 100).toFixed(1)}%
                  </span>
                </p>
              </div>

              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900">
                  Cancer Type
                </h3>
                <p className="mt-2 text-lg font-semibold text-gray-900">
                  {results.cancer_type.prediction}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Confidence:{" "}
                  <span
                    className={getConfidenceColor(
                      results.cancer_type.confidence
                    )}
                  >
                    {(results.cancer_type.confidence * 100).toFixed(1)}%
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Multi-modal Data Section */}
          <div className="bg-white shadow-lg rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Multi-Modal Data
              </h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Radiological Image */}
              {results.radiological_image && (
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-1">
                    Radiological Image
                  </h3>
                  {results.radiological_image.match(
                    /\.(jpg|jpeg|png|gif|bmp|webp)$/i
                  ) ? (
                    <img
                      src={results.radiological_image}
                      alt="Radiological"
                      className="max-w-xs rounded shadow"
                    />
                  ) : results.radiological_image.startsWith("http") ? (
                    <a
                      href={results.radiological_image}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      View Image
                    </a>
                  ) : (
                    <span className="text-gray-700">
                      {results.radiological_image}
                    </span>
                  )}
                </div>
              )}
              {/* Pathological Image */}
              {results.pathological_image && (
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-1">
                    Pathological Image
                  </h3>
                  {results.pathological_image.match(
                    /\.(jpg|jpeg|png|gif|bmp|webp)$/i
                  ) ? (
                    <img
                      src={results.pathological_image}
                      alt="Pathological"
                      className="max-w-xs rounded shadow"
                    />
                  ) : results.pathological_image.startsWith("http") ? (
                    <a
                      href={results.pathological_image}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      View Image
                    </a>
                  ) : (
                    <span className="text-gray-700">
                      {results.pathological_image}
                    </span>
                  )}
                </div>
              )}
              {/* Genomics Data */}
              {results.genomics_data && (
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-1">
                    Genomics Data
                  </h3>
                  {results.genomics_data.match(/\.(txt|csv|zip)$/i) ? (
                    <a
                      href={results.genomics_data}
                      download
                      className="text-blue-600 underline"
                    >
                      Download File
                    </a>
                  ) : (
                    <span className="text-gray-700">
                      {results.genomics_data}
                    </span>
                  )}
                </div>
              )}
              {/* Clinical Records */}
              {results.clinical_records && (
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-1">
                    Clinical Records
                  </h3>
                  {results.clinical_records.match(/\.(txt|csv|zip)$/i) ? (
                    <a
                      href={results.clinical_records}
                      download
                      className="text-blue-600 underline"
                    >
                      Download File
                    </a>
                  ) : (
                    <span className="text-gray-700">
                      {results.clinical_records}
                    </span>
                  )}
                </div>
              )}
              {/* Patient-Reported Outcomes */}
              {results.patient_reported_outcomes && (
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-1">
                    Patient-Reported Outcomes
                  </h3>
                  {results.patient_reported_outcomes.match(
                    /\.(txt|csv|zip)$/i
                  ) ? (
                    <a
                      href={results.patient_reported_outcomes}
                      download
                      className="text-blue-600 underline"
                    >
                      Download File
                    </a>
                  ) : (
                    <span className="text-gray-700">
                      {results.patient_reported_outcomes}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Results Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Metastasis Status */}
          <div className="bg-white shadow-lg rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Metastasis Status
              </h2>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">
                  {results.metastasis.prediction}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-sm font-medium ${
                    results.metastasis.prediction === "Primary"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {(results.metastasis.confidence * 100).toFixed(1)}% confidence
                </span>
              </div>
              {results.metastasis.locations.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700">
                    Affected Locations:
                  </h4>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {results.metastasis.locations.map((location, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                      >
                        {location}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tissue Change */}
          <div className="bg-white shadow-lg rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Tissue Change Classification
              </h2>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">
                  {results.tissue_change.prediction}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-sm font-medium ${
                    results.tissue_change.severity === "High"
                      ? "bg-red-100 text-red-800"
                      : results.tissue_change.severity === "Medium"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {(results.tissue_change.confidence * 100).toFixed(1)}%
                  confidence
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Severity: {results.tissue_change.severity}
              </p>
            </div>
          </div>

          {/* Prognosis */}
          <div className="bg-white shadow-lg rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Prognosis</h2>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">
                  {results.prognosis.prediction}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-sm font-medium ${getConfidenceColor(
                    results.prognosis.confidence
                  )}`}
                >
                  {(results.prognosis.confidence * 100).toFixed(1)}% confidence
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Estimated 5-year survival rate:{" "}
                <span className="font-semibold">
                  {results.prognosis.survival_rate}%
                </span>
              </p>
              {results.prognosis.risk_factors.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700">
                    Key Risk Factors:
                  </h4>
                  <ul className="mt-2 space-y-1">
                    {results.prognosis.risk_factors.map((factor, index) => (
                      <li
                        key={index}
                        className="text-sm text-gray-600 flex items-center"
                      >
                        <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500 mr-2" />
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Genetic Analysis */}
          <div className="bg-white shadow-lg rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Genetic Analysis
              </h2>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">Risk Score</span>
                <span
                  className={`px-2 py-1 rounded-full text-sm font-medium ${getRiskColor(
                    `Risk Score: ${results.genetic.risk_score}`
                  )}`}
                >
                  {results.genetic.risk_score}/10
                </span>
              </div>
              {results.genetic.mutations.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700">
                    Detected Mutations:
                  </h4>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {results.genetic.mutations.map((mutation, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-red-100 text-red-700 rounded text-sm"
                      >
                        {mutation}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {results.genetic.family_screening.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700">
                    Family Screening Recommendations:
                  </h4>
                  <ul className="mt-2 space-y-1">
                    {results.genetic.family_screening.map(
                      (screening, index) => (
                        <li
                          key={index}
                          className="text-sm text-gray-600 flex items-center"
                        >
                          <InformationCircleIcon className="h-4 w-4 text-blue-500 mr-2" />
                          {screening}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Treatment Recommendations */}
        <div className="bg-white shadow-lg rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Treatment Recommendations
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-md font-medium text-gray-900">
                  Priority Level
                </h3>
                <p className="mt-1 text-lg font-semibold text-blue-600">
                  {results.therapy.priority}
                </p>
              </div>
              <div>
                <h3 className="text-md font-medium text-gray-900">Timeline</h3>
                <p className="mt-1 text-lg font-semibold text-green-600">
                  {results.therapy.timeline}
                </p>
              </div>
              <div>
                <h3 className="text-md font-medium text-gray-900">
                  Recommendations
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  {results.therapy.recommendations.length} treatment options
                </p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-md font-medium text-gray-900 mb-3">
                Detailed Recommendations:
              </h3>
              <div className="space-y-3">
                {results.therapy.recommendations.map(
                  (recommendation, index) => (
                    <div key={index} className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <span className="text-blue-600 text-sm font-medium">
                          {index + 1}
                        </span>
                      </div>
                      <p className="text-gray-700">{recommendation}</p>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isBatchMode && batchResults) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Batch Results
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  Analysis results for{" "}
                  {batchResults.summary?.total_samples || 0} samples
                </p>
              </div>
              <button
                onClick={() => navigate("/batch")}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Upload
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Summary Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900">
                  Total Samples
                </h3>
                <p className="text-2xl font-bold text-blue-600">
                  {batchResults.summary?.total_samples || 0}
                </p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-red-900">
                  Malignant
                </h3>
                <p className="text-2xl font-bold text-red-600">
                  {batchResults.summary?.malignant_count || 0}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-green-900">Benign</h3>
                <p className="text-2xl font-bold text-green-600">
                  {batchResults.summary?.benign_count || 0}
                </p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-yellow-900">
                  High Risk
                </h3>
                <p className="text-2xl font-bold text-yellow-600">
                  {batchResults.summary?.high_risk_count || 0}
                </p>
              </div>
            </div>

            {/* Results Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sample #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Diagnosis
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cancer Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Risk Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Confidence
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {batchResults.predictions?.map(
                    (prediction: any, index: number) => (
                      <tr
                        key={index}
                        className="hover:bg-blue-50 cursor-pointer"
                        onClick={() =>
                          handleBatchSampleClick(prediction, index)
                        }
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Sample {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              prediction.diagnosis.prediction === "Malignant"
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {prediction.diagnosis.prediction}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {prediction.cancer_type.prediction}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskColor(
                              prediction.overall_risk
                            )}`}
                          >
                            {prediction.overall_risk}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {(prediction.confidence_score * 100).toFixed(1)}%
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!results && !batchResults) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default Results;
