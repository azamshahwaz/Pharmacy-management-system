import { useState } from "react";
import API from "../../../services/apiClient";
import { Eye, EyeOff, Mail, Phone, User } from "lucide-react";
import { toast } from "react-toastify";

const NAME_REGEX = /^[A-Za-z\s]+$/;
const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,12}$/;
const PASSWORD_MIN = 6;
const PASSWORD_MAX = 18;

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

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ─── FIELD VALIDATORS ───────────────────────────────────
  const validateName = (value) => {
    if (!value.trim()) return "Name is required";
    if (!NAME_REGEX.test(value)) return "Name should only contain letters and spaces";
    return "";
  };

  const validateEmail = (value) => {
    if (!value.trim()) return "Email is required";
    if (!EMAIL_REGEX.test(value)) return "Enter a valid email address";
    return "";
  };

  const validatePhone = (value) => {
    if (!value.trim()) return "Phone number is required";
    if (!PHONE_REGEX.test(value)) return "Phone must be 10 digits and start with 6-9";
    return "";
  };

  const validatePasswordField = (value) => {
    if (!value) return "Password is required";
    if (value.length < PASSWORD_MIN) return `Password must be at least ${PASSWORD_MIN} characters`;
    if (value.length > PASSWORD_MAX) return `Password must not exceed ${PASSWORD_MAX} characters`;
    if (!/[a-z]/.test(value)) return "Password must contain a lowercase letter";
    if (!/[A-Z]/.test(value)) return "Password must contain an uppercase letter";
    if (!/\d/.test(value)) return "Password must contain a number";
    if (!/[@$!%*?&]/.test(value)) return "Password must contain a special character (@$!%*?&)";
    if (!PASSWORD_REGEX.test(value)) return "Only @$!%*?& special characters are allowed";
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "name") {
      setErrors((prev) => ({ ...prev, name: validateName(value) }));
    } else if (name === "email") {
      setErrors((prev) => ({ ...prev, email: validateEmail(value) }));
    } else if (name === "phone") {
      setErrors((prev) => ({ ...prev, phone: validatePhone(value) }));
    } else if (name === "password") {
      setErrors((prev) => ({ ...prev, password: validatePasswordField(value) }));
    }
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

    const nameError = validateName(formData.name);
    const emailError = validateEmail(formData.email);
    const phoneError = validatePhone(formData.phone);
    const passwordError = validatePasswordField(formData.password);

    setErrors({
      name: nameError,
      email: emailError,
      phone: phoneError,
      password: passwordError,
    });

    if (nameError || emailError || phoneError || passwordError) {
      toast.error("Please fix the errors in the form");
      return;
    }

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
      const { data } = await API.post("/auth/signup", dataToSend);

      sessionStorage.setItem("signupEmail", formData.email);

      toast.success(data.message || "OTP sent successfully");

      setTimeout(() => {
        window.location.href = "/verify-otp";
      }, 1500);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-theme="forest" className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      <div className="card w-full max-w-md shadow-xl bg-base-100">
        <div className="card-body">
          <h2 className="text-2xl font-bold text-center">Create Account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60" size={18} />
                <input
                  name="name"
                  placeholder="Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={`input input-bordered w-full pl-10 ${errors.name ? "input-error" : ""}`}
                />
              </div>
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60" size={18} />
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={`input input-bordered w-full pl-10 ${errors.email ? "input-error" : ""}`}
                />
              </div>
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60" size={18} />
                <input
                  name="phone"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={handleChange}
                  maxLength={10}
                  inputMode="numeric"
                  required
                  className={`input input-bordered w-full pl-10 ${errors.phone ? "input-error" : ""}`}
                />
              </div>
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className={`input input-bordered w-full pr-10 ${errors.password ? "input-error" : ""}`}
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </span>
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
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
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="input input-bordered w-full pr-10"
              />
              <span
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </span>
            </div>

            {/* Password Match */}
            {formData.confirmPassword && (
              <p className="text-sm">
                {formData.password === formData.confirmPassword ? (
                  <span className="text-green-500">Password matches</span>
                ) : (
                  <span className="text-red-500">Passwords do not match</span>
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
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
            </select>

            {/* Customer Address Fields */}
            {formData.role === "customer" && (
              <>
                <input
                  name="shopName"
                  placeholder="Shop Name"
                  value={formData.shopName}
                  onChange={handleChange}
                  required
                  className="input input-bordered w-full"
                />
                <input
                  name="street"
                  placeholder="Street"
                  value={formData.street}
                  onChange={handleChange}
                  required
                  className="input input-bordered w-full"
                />
                <input
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="input input-bordered w-full"
                />
              </>
            )}

            <button type="submit" disabled={loading} className="btn btn-primary w-full">
              {loading ? "Signing up..." : "Signup"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;