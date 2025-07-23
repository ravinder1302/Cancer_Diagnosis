import React, { useEffect, useState } from "react";

const API_URL = process.env.REACT_APP_API_URL || "";
const GUIDELINES_PATH = `${API_URL}/guidelines`;
const LOGIN_PATH = `${API_URL}/login`;
const ADMIN_ROLE = "admin";
const USERS_PATH = `${API_URL}/users`;
const DELETE_USER_PATH = `${API_URL}/delete-user`;
const SAVE_GUIDELINES_PATH = `${API_URL}/save-guidelines`;

const defaultGuideline = {
  primary_treatment: "",
  alternative_treatments: [],
  urgency: "",
  success_rate: 0,
  side_effects: [],
  recommendations: [],
  priority: "",
  timeline: "",
};

const Admin: React.FC = () => {
  const [guidelines, setGuidelines] = useState<any>({});
  const [status, setStatus] = useState<string>("");
  const [auth, setAuth] = useState<{
    token: string;
    role: string;
    username?: string;
  } | null>(null);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState<string>("");
  const [users, setUsers] = useState<any[]>([]);
  const [userStatus, setUserStatus] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetch(GUIDELINES_PATH + `?t=${Date.now()}`)
      .then((res) => res.json())
      .then(setGuidelines)
      .catch(() => setStatus("Failed to load guidelines."));
    // Try to load token from localStorage
    const token = localStorage.getItem("admin_token");
    const role = localStorage.getItem("admin_role");
    const username = localStorage.getItem("admin_username");
    if (token && role === ADMIN_ROLE)
      setAuth({ token, role, username: username || undefined });
  }, []);

  useEffect(() => {
    if (auth && auth.token && auth.role === ADMIN_ROLE) {
      fetch(USERS_PATH, {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
        .then((res) => (res.ok ? res.json() : []))
        .then(setUsers)
        .catch(() => setUsers([]));
    }
  }, [auth]);

  const handleFieldChange = (key: string, field: string, value: any) => {
    setGuidelines((prev: any) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  const handleListChange = (
    key: string,
    field: string,
    idx: number,
    value: string
  ) => {
    setGuidelines((prev: any) => {
      const arr = [...(prev[key][field] || [])];
      arr[idx] = value;
      return { ...prev, [key]: { ...prev[key], [field]: arr } };
    });
  };

  const addGuideline = () => {
    const newKey = prompt("Enter new diagnosis key (e.g., 'malignant'):");
    if (newKey && !guidelines[newKey]) {
      setGuidelines((prev: any) => ({
        ...prev,
        [newKey]: { ...defaultGuideline },
      }));
    }
  };

  const removeGuideline = (key: string) => {
    if (window.confirm(`Remove guideline for '${key}'?`)) {
      setGuidelines((prev: any) => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }
  };

  const saveGuidelines = async () => {
    setStatus("Saving...");
    try {
      const res = await fetch(SAVE_GUIDELINES_PATH, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth?.token}`,
        },
        body: JSON.stringify(guidelines),
      });
      if (!res.ok) throw new Error("Not authorized or failed to save.");
      setStatus("Saved successfully.");
    } catch {
      setStatus("Failed to save.");
    }
  };

  const autoGenerate = () => {
    // Mock: Add a sample guideline (in real use, fetch from a trusted API)
    setGuidelines((prev: any) => ({
      ...prev,
      auto: {
        ...defaultGuideline,
        primary_treatment: "Auto-generated Treatment",
        urgency: "Routine",
        recommendations: ["Auto-generated from trusted source"],
      },
    }));
    setStatus("Auto-generated guideline added (mock)");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setStatus("");
    try {
      const form = new FormData();
      form.append("username", loginForm.username);
      form.append("password", loginForm.password);
      const res = await fetch(LOGIN_PATH, {
        method: "POST",
        body: form,
      });
      if (!res.ok) throw new Error("Invalid credentials");
      const data = await res.json();
      // Decode JWT to get role and username
      const payload = JSON.parse(atob(data.access_token.split(".")[1]));
      if (payload.role !== ADMIN_ROLE) throw new Error("Not an admin account");
      setAuth({
        token: data.access_token,
        role: payload.role,
        username: payload.sub,
      });
      localStorage.setItem("admin_token", data.access_token);
      localStorage.setItem("admin_role", payload.role);
      localStorage.setItem("admin_username", payload.sub);
      setStatus("Logged in as admin.");
    } catch (err: any) {
      setLoginError(err.message || "Login failed");
    }
  };

  const handleLogout = () => {
    setAuth(null);
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_role");
    localStorage.removeItem("admin_username");
    setStatus("Logged out.");
  };

  const handleDeleteUser = async (username: string) => {
    if (!auth?.token || !window.confirm(`Delete user '${username}'?`)) return;
    setUserStatus("");
    try {
      const res = await fetch(DELETE_USER_PATH, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ username }),
      });
      if (!res.ok) throw new Error("Failed to delete user");
      setUsers(users.filter((u) => u.username !== username));
      setUserStatus(`User '${username}' deleted.`);
    } catch {
      setUserStatus("Failed to delete user.");
    }
  };

  if (!auth || auth.role !== ADMIN_ROLE) {
    return (
      <div className="max-w-md mx-auto bg-white shadow rounded p-6 mt-12">
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Username</label>
            <input
              className="border px-2 py-1 w-full"
              value={loginForm.username}
              onChange={(e) =>
                setLoginForm((f) => ({ ...f, username: e.target.value }))
              }
              required
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="border px-2 py-1 w-full pr-10"
                value={loginForm.password}
                onChange={(e) =>
                  setLoginForm((f) => ({ ...f, password: e.target.value }))
                }
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
          {loginError && <div className="text-red-600 mt-2">{loginError}</div>}
          {status && <div className="text-green-600 mt-2">{status}</div>}
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white shadow rounded p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Guidelines Admin</h1>
        <button
          onClick={handleLogout}
          className="px-3 py-1 bg-red-600 text-white rounded"
        >
          Logout
        </button>
      </div>
      <div className="mb-4 flex gap-2">
        <button
          onClick={addGuideline}
          className="px-3 py-1 bg-blue-600 text-white rounded"
        >
          Add Guideline
        </button>
        <button
          onClick={autoGenerate}
          className="px-3 py-1 bg-green-600 text-white rounded"
        >
          Auto-Generate (Mock)
        </button>
        <button
          onClick={saveGuidelines}
          className="px-3 py-1 bg-gray-800 text-white rounded"
        >
          Save
        </button>
        <span className="ml-4 text-sm text-gray-600">{status}</span>
      </div>
      {/* User Management Section */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">User Management</h2>
        {userStatus && <div className="text-green-600 mb-2">{userStatus}</div>}
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-2 py-1 border">Username</th>
              <th className="px-2 py-1 border">Role</th>
              <th className="px-2 py-1 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.username}>
                <td className="px-2 py-1 border">{user.username}</td>
                <td className="px-2 py-1 border">{user.role}</td>
                <td className="px-2 py-1 border">
                  {user.username !== auth.username && (
                    <button
                      className="px-2 py-1 bg-red-200 text-red-800 rounded"
                      onClick={() => handleDeleteUser(user.username)}
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {Object.keys(guidelines).length === 0 && <div>No guidelines found.</div>}
      {Object.entries(guidelines).map(([key, val]: [string, any]) => (
        <div key={key} className="border rounded mb-4 p-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold text-lg">{key}</h2>
            <button
              onClick={() => removeGuideline(key)}
              className="text-red-600"
            >
              Remove
            </button>
          </div>
          {Object.keys(defaultGuideline).map((field) =>
            Array.isArray((defaultGuideline as any)[field]) ? (
              <div key={field} className="mb-2">
                <label className="block font-medium">{field}:</label>
                {(val[field] || [""]).map((item: string, idx: number) => (
                  <input
                    key={idx}
                    className="border px-2 py-1 mr-2 mb-1"
                    value={item}
                    onChange={(e) =>
                      handleListChange(key, field, idx, e.target.value)
                    }
                  />
                ))}
                <button
                  className="ml-2 px-2 py-0.5 bg-blue-200 rounded"
                  onClick={() =>
                    handleListChange(key, field, (val[field] || []).length, "")
                  }
                >
                  +
                </button>
              </div>
            ) : (
              <div key={field} className="mb-2">
                <label className="block font-medium">{field}:</label>
                <input
                  className="border px-2 py-1 w-full"
                  value={val[field] ?? ""}
                  onChange={(e) =>
                    handleFieldChange(key, field, e.target.value)
                  }
                />
              </div>
            )
          )}
        </div>
      ))}
    </div>
  );
};

export default Admin;
