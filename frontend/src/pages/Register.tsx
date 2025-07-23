import React, { useState } from "react";

const Register: React.FC = () => {
  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "user",
    admin_code: "",
  });
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("");
    setError("");
    try {
      const params = new URLSearchParams();
      params.append("username", form.username);
      params.append("password", form.password);
      params.append("role", form.role);
      if (form.role === "admin") params.append("admin_code", form.admin_code);
      const API_URL = process.env.REACT_APP_API_URL || "";
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });
      if (!res.ok) {
        let msg = "Registration failed";
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
      setStatus("Registration successful! You can now log in.");
    } catch (err: any) {
      setError(err.message || "Registration failed");
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
        <div>
          <label className="block font-medium mb-1">Role</label>
          <select
            className="border px-2 py-1 w-full"
            name="role"
            value={form.role}
            onChange={handleChange}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        {form.role === "admin" && (
          <div>
            <label className="block font-medium mb-1">
              Admin Registration Code
            </label>
            <input
              className="border px-2 py-1 w-full"
              name="admin_code"
              value={form.admin_code}
              onChange={handleChange}
              required={form.role === "admin"}
            />
          </div>
        )}
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Register
        </button>
        {status && <div className="text-green-600 mt-2">{status}</div>}
        {error && <div className="text-red-600 mt-2">{error}</div>}
      </form>
    </div>
  );
};

export default Register;
