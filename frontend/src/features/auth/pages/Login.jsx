import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Mail,
  Phone,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

function Login() {
  const { login } = useAuth();

  const [input, setInput] = useState("");
  const [password, setPassword] =
    useState("");
  const [showPassword, setShowPassword] =
    useState(false);
  const [loading, setLoading] =
    useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      "forest"
    );
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !input.trim() ||
      !password.trim()
    ) {
      return toast.error(
        "All fields are required ❌"
      );
    }

    try {
      setLoading(true);

      const credentials =
        input.includes("@")
          ? {
            email: input.trim(),
            password,
          }
          : {
            phone: input.trim(),
            password,
          };

      const response =
  await login(credentials);

toast.success(
  response.message
);

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      <form
        onSubmit={handleSubmit}
        className="card w-full max-w-md bg-base-100 shadow-2xl p-6 md:p-8 space-y-4"
      >
        <h2 className="text-2xl font-bold text-center">
          Login
        </h2>

        {/* Email / Phone */}
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
          />
        </div>

        {/* Password */}
        <div className="relative">
          <input
            type={
              showPassword
                ? "text"
                : "password"
            }
            placeholder="Enter Password"
            className="input input-bordered w-full pr-10"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
          />

          <span
            onClick={() =>
              setShowPassword(
                !showPassword
              )
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

        {/* Forgot Password */}
        <div className="text-right">
          <button
            type="button"
            onClick={() =>
              navigate(
                "/forgot-password"
              )
            }
            className="text-sm text-primary hover:underline"
          >
            Forgot Password?
          </button>
        </div>

        {/* Signup Redirect */}
        <div className="text-center">
          <span className="text-sm opacity-70">
            Not signed up yet?{" "}
          </span>

          <button
            type="button"
            onClick={() => navigate("/signup")}
            className="text-sm text-primary font-medium hover:underline"
          >
            Sign Up
          </button>
        </div>

        {/* Login Button */}
        <button
          type="submit"
          className={`btn btn-primary w-full ${loading
              ? "loading"
              : ""
            }`}
          disabled={loading}
        >
          {loading
            ? "Logging in..."
            : "Login"}
        </button>
      </form>
    </div>
  );
}

export default Login;