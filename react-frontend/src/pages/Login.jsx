import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

const Login = () => {
  const navigate = useNavigate();
  // State variables to manage form inputs, validation errors, server error messages, and loading state
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  // input validation
  const validate = () => {
    const nextErrors = {};
    if (!form.email.trim()) nextErrors.email = "Email is required";
    if (!form.password) nextErrors.password = "Password is required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      // auth login api call to backend
      const response = await api.post("/auth/login", {
        email: form.email,
        password: form.password,
      });

      //store user data in local storage
      localStorage.setItem("token", response.data?.token || "");
      localStorage.setItem("user", JSON.stringify(response.data?.user || {}));
      window.dispatchEvent(new Event("auth-state-changed"));
      navigate("/");
    } catch (err) {
      setServerError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f2f2f2] px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-semibold text-[#0f0f0f]">Sign in</h1>
        <p className="mt-2 text-sm text-[#606060]">Welcome back! Please sign in to continue.</p>
    {/* Login form */}
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#0f0f0f]">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-lg border border-[#e5e5e5] px-3 py-2 outline-none focus:border-black"
            />
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[#0f0f0f]">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-lg border border-[#e5e5e5] px-3 py-2 outline-none focus:border-black"
            />
            {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
          </div>

          {serverError && <p className="text-sm text-red-500">{serverError}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-black px-4 py-2.5 text-sm font-medium text-white"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-[#606060]">
          Don’t have an account? <Link to="/register" className="font-medium text-black">Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;