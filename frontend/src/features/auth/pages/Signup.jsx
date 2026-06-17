import { useState } from "react";
import API from "../../../services/apiClient";
import { Eye, EyeOff, Mail, Phone, User } from "lucide-react";
import { toast } from "react-toastify";

function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "customer",
    shopName: "",
    street: "",
    city: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ─── PASSWORD STRENGTH ──────────────────────────────────
  const getPasswordStrength = () => {
    const pwd = formData.password;

    if (!pwd) return "";

    let score = 0;

    if (pwd.length > 6) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1) return "weak";
    if (score <= 3) return "medium";
    return "strong";
  };

  const strength = getPasswordStrength();

  // ─── SUBMIT ─────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    const dataToSend = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      password: formData.password,
      role: formData.role,
    };

    if (formData.role === "customer") {
      dataToSend.address = {
        shopName: formData.shopName.trim(),
        street: formData.street.trim(),
        city: formData.city.trim(),
      };
    }

    try {
      const { data } = await API.post(
        "/auth/signup",
        dataToSend
      );

      sessionStorage.setItem(
        "signupEmail",
        formData.email
      );

      toast.success(
        data.message || "OTP sent successfully"
      );

      setTimeout(() => {
        window.location.href = "/verify-otp";
      }, 1500);
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Server error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      data-theme="forest"
      className="min-h-screen flex items-center justify-center bg-base-200 px-4"
    >
      <div className="card w-full max-w-md shadow-xl bg-base-100">
        <div className="card-body">
          <h2 className="text-2xl font-bold text-center">
            Create Account
          </h2>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {/* Name */}
            <div className="relative">
              <User
                className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60"
                size={18}
              />
              <input
                name="name"
                placeholder="Name"
                onChange={handleChange}
                required
                className="input input-bordered w-full pl-10"
              />
            </div>

            {/* Email */}
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60"
                size={18}
              />
              <input
                name="email"
                type="email"
                placeholder="Email"
                onChange={handleChange}
                required
                className="input input-bordered w-full pl-10"
              />
            </div>

            {/* Phone */}
            <div className="relative">
              <Phone
                className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60"
                size={18}
              />
              <input
                name="phone"
                placeholder="Phone"
                onChange={handleChange}
                required
                className="input input-bordered w-full pl-10"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <input
                name="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Password"
                onChange={handleChange}
                required
                className="input input-bordered w-full pr-10"
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

            {/* Strength Meter */}
            {formData.password && (
              <div className="text-sm">
                Strength:{" "}
                <span
                  className={
                    strength === "weak"
                      ? "text-red-500"
                      : strength === "medium"
                      ? "text-yellow-500"
                      : "text-green-500"
                  }
                >
                  {strength}
                </span>
              </div>
            )}

            {/* Confirm Password */}
            <div className="relative">
              <input
                name="confirmPassword"
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                placeholder="Confirm Password"
                onChange={handleChange}
                required
                className="input input-bordered w-full pr-10"
              />

              <span
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </span>
            </div>

            {/* Password Match */}
            {formData.confirmPassword && (
              <p className="text-sm">
                {formData.password ===
                formData.confirmPassword ? (
                  <span className="text-green-500">
                    Password matches 
                  </span>
                ) : (
                  <span className="text-red-500">
                    Passwords do not match 
                  </span>
                )}
              </p>
            )}

            {/* Role */}
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="select select-bordered w-full"
            >
              <option value="customer">
                Customer
              </option>
              <option value="admin">
                Admin
              </option>
              <option value="staff">
                Staff
              </option>
            </select>

            {/* Customer Address Fields */}
            {formData.role === "customer" && (
              <>
                <input
                  name="shopName"
                  placeholder="Shop Name"
                  onChange={handleChange}
                  required
                  className="input input-bordered w-full"
                />

                <input
                  name="street"
                  placeholder="Street"
                  onChange={handleChange}
                  required
                  className="input input-bordered w-full"
                />

                <input
                  name="city"
                  placeholder="City"
                  onChange={handleChange}
                  required
                  className="input input-bordered w-full"
                />
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading
                ? "Signing up..."
                : "Signup"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;