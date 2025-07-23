import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import DiagnosisForm from "./pages/DiagnosisForm";
import BatchUpload from "./pages/BatchUpload";
import Results from "./pages/Results";
import About from "./pages/About";
import Admin from "./pages/Admin";
import Register from "./pages/Register";
import Login from "./pages/Login";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50 pt-24">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/diagnosis" element={<DiagnosisForm />} />
              <Route path="/batch" element={<BatchUpload />} />
              <Route path="/results" element={<Results />} />
              <Route path="/about" element={<About />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </main>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
