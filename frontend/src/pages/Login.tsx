import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL || "";
const LOGIN_PATH = `${API_URL}/login`;

const Login: React.FC = () => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("");
    setError("");
    try {
      const formData = new FormData();
      formData.append("username", form.username);
      formData.append("password", form.password);
      const res = await fetch(LOGIN_PATH, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        let msg = "Login failed";
        try {
          const data = await res.json();
          if (typeof data.detail === "string") msg = data.detail;
          else if (Array.isArray(data.detail))
            msg = data.detail
              .map((d: any) => d.msg || JSON.stringify(d))
              .join(", ");
          else if (typeof data.detail === "object")
            msg = JSON.stringify(data.detail);
        } catch {}
        throw new Error(msg);
      }
      const data = await res.json();
      // Decode JWT to get role and username
      const payload = JSON.parse(atob(data.access_token.split(".")[1]));
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("role", payload.role);
      localStorage.setItem("username", payload.sub);
      setStatus("Login successful!");
      setTimeout(() => {
        if (payload.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }, 500);
    } catch (err: any) {
      setError(err.message || "Login failed");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow rounded p-6 mt-12">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Username</label>
          <input
            className="border px-2 py-1 w-full"
            name="username"
            value={form.username}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="border px-2 py-1 w-full pr-10"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xl"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Login
        </button>
        {status && <div className="text-green-600 mt-2">{status}</div>}
        {error && <div className="text-red-600 mt-2">{error}</div>}
      </form>
    </div>
  );
};

export default Login;
