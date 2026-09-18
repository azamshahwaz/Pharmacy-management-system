import { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";

import { toast } from "react-toastify";

import {
  Mail,
  Phone,
  Eye,
  EyeOff,
  ShieldCheck,
  UserRound,
  User,
} from "lucide-react";

import { useAuth } from "../../../context/AuthContext";

function Login() {
  const { login, loginAsRole } = useAuth();

  const [input, setInput] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState("");

  const navigate = useNavigate();

  // =====================================================
  // FOREST THEME
  // =====================================================

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      "forest"
    );
  }, []);

  // =====================================================
  // NORMAL LOGIN
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!input.trim() || !password.trim()) {
      return toast.error(
        "All fields are required ❌"
      );
    }

    try {
      setLoading(true);

      const credentials = input.includes("@")
        ? {
            email: input.trim(),
            password,
          }
        : {
            phone: input.trim(),
            password,
          };

      const response = await login(credentials);

      toast.success(response.message);

      navigate("/dashboard", {
        replace: true,
      });
    } catch (error) {
      console.error(error);

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Login Failed ❌"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // QUICK ROLE LOGIN
  // =====================================================

  const handleDemoLogin = async (role) => {
    try {
      setDemoLoading(role);

      // Only role is sent to backend.
      // Email and password are NEVER populated
      // or sent from the frontend.

      const response = await loginAsRole(role);

      toast.success(response.message);

      // All roles use the same dashboard route.
      // Dashboard UI changes according to user.role.

      navigate("/dashboard", {
        replace: true,
      });
    } catch (error) {
      console.error(error);

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          `${role} login failed ❌`
      );
    } finally {
      setDemoLoading("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      <form
        onSubmit={handleSubmit}
        className="card w-full max-w-md bg-base-100 shadow-2xl p-6 md:p-8 space-y-4"
      >
        {/* =====================================================
            TITLE
        ===================================================== */}

        <h2 className="text-2xl font-bold text-center">
          Login
        </h2>

        {/* =====================================================
            EMAIL / PHONE
        ===================================================== */}

        <div className="relative">
          {input.includes("@") ? (
            <Mail
              className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60"
              size={18}
            />
          ) : (
            <Phone
              className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60"
              size={18}
            />
          )}

          <input
            type="text"
            placeholder="Enter Email or Phone"
            className="input input-bordered w-full pl-10"
            value={input}
            onChange={(e) =>
              setInput(e.target.value)
            }
            disabled={
              loading || demoLoading !== ""
            }
          />
        </div>

        {/* =====================================================
            PASSWORD
        ===================================================== */}

        <div className="relative">
          <input
            type={
              showPassword ? "text" : "password"
            }
            placeholder="Enter Password"
            className="input input-bordered w-full pr-10"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            disabled={
              loading || demoLoading !== ""
            }
          />

          <span
            onClick={() =>
              !loading &&
              demoLoading === "" &&
              setShowPassword(!showPassword)
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
          >
            {showPassword ? (
              <EyeOff size={20} />
            ) : (
              <Eye size={20} />
            )}
          </span>
        </div>

        {/* =====================================================
            FORGOT PASSWORD
        ===================================================== */}

        <div className="text-right">
          <button
            type="button"
            onClick={() =>
              navigate("/forgot-password")
            }
            className="text-sm text-primary hover:underline"
            disabled={
              loading || demoLoading !== ""
            }
          >
            Forgot Password?
          </button>
        </div>

        {/* =====================================================
            SIGNUP REDIRECT
        ===================================================== */}

        <div className="text-center">
          <span className="text-sm opacity-70">
            Not signed up yet?{" "}
          </span>

          <button
            type="button"
            onClick={() => navigate("/signup")}
            className="text-sm text-primary font-medium hover:underline"
            disabled={
              loading || demoLoading !== ""
            }
          >
            Sign Up
          </button>
        </div>

        {/* =====================================================
            NORMAL LOGIN BUTTON
            GREEN - KEEPING YOUR EXISTING STYLE
        ===================================================== */}

        <button
          type="submit"
          className={`btn btn-primary w-full ${
            loading ? "loading" : ""
          }`}
          disabled={
            loading || demoLoading !== ""
          }
        >
          {loading
            ? "Logging in..."
            : "Login"}
        </button>

        {/* =====================================================
            DIVIDER
        ===================================================== */}

        <div className="divider text-sm opacity-60">
          OR
        </div>

        {/* =====================================================
            QUICK LOGIN
        ===================================================== */}

        <div className="space-y-3">
          <p className="text-center text-sm font-medium opacity-70">
            Quick Login
          </p>

          {/* =================================================
              ADMIN - RED
          ================================================= */}

          <button
            type="button"
            onClick={() =>
              handleDemoLogin("admin")
            }
            disabled={
              loading || demoLoading !== ""
            }
            className="
              btn
              w-full
              bg-red-600
              hover:bg-red-700
              text-white
              border-red-600
              hover:border-red-700
            "
          >
            {demoLoading === "admin" ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              <ShieldCheck size={18} />
            )}

            {demoLoading === "admin"
              ? "Logging in..."
              : "Login as Admin"}
          </button>

          {/* =================================================
              STAFF - BLUE
          ================================================= */}

          <button
            type="button"
            onClick={() =>
              handleDemoLogin("staff")
            }
            disabled={
              loading || demoLoading !== ""
            }
            className="
              btn
              w-full
              bg-blue-600
              hover:bg-blue-700
              text-white
              border-blue-600
              hover:border-blue-700
            "
          >
            {demoLoading === "staff" ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              <UserRound size={18} />
            )}

            {demoLoading === "staff"
              ? "Logging in..."
              : "Login as Staff"}
          </button>

          {/* =================================================
              CUSTOMER - PURPLE
          ================================================= */}

          <button
            type="button"
            onClick={() =>
              handleDemoLogin("customer")
            }
            disabled={
              loading || demoLoading !== ""
            }
            className="
              btn
              w-full
              bg-purple-600
              hover:bg-purple-700
              text-white
              border-purple-600
              hover:border-purple-700
            "
          >
            {demoLoading === "customer" ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              <User size={18} />
            )}

            {demoLoading === "customer"
              ? "Logging in..."
              : "Login as Customer"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Login;