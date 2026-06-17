import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../../../services/apiClient";

export default function ForgotPassword() {
const [email, setEmail] = useState("");
const [loading, setLoading] = useState(false);

const navigate = useNavigate();

const handleSubmit = async (e) => {
e.preventDefault();

if (!email.trim()) {
  return toast.error("Email is required");
}

try {
  setLoading(true);

  await API.post(
    "/auth/forgot-password",
    {
      email: email.trim().toLowerCase(),
    }
  );

  // Refresh-safe flow
  localStorage.setItem(
    "resetEmail",
    email.trim().toLowerCase()
  );

  toast.success(
    "OTP sent to your email ✅"
  );

  navigate("/verify-reset-otp", {
    state: {
      email: email
        .trim()
        .toLowerCase(),
    },
  });
} catch (err) {
  toast.error(
    err?.response?.data?.message ||
      "Failed to send OTP"
  );
} finally {
  setLoading(false);
}


};

return ( <div className="min-h-screen flex items-center justify-center bg-base-200 px-4"> <form
     onSubmit={handleSubmit}
     className="card bg-base-100 shadow-2xl p-6 md:p-8 w-full max-w-md"
   > <h2 className="text-2xl font-bold text-center mb-2">
Forgot Password </h2>


    <p className="text-center text-sm opacity-70 mb-5">
      Enter your registered email address.
      We'll send you a verification OTP.
    </p>

    <input
      type="email"
      placeholder="Enter Email"
      className="input input-bordered w-full"
      value={email}
      onChange={(e) =>
        setEmail(e.target.value)
      }
    />

    <button
      type="submit"
      disabled={loading}
      className={`btn btn-primary w-full mt-4 ${
        loading ? "loading" : ""
      }`}
    >
      {loading
        ? "Sending OTP..."
        : "Send OTP"}
    </button>

    <button
      type="button"
      className="btn btn-ghost w-full mt-2"
      onClick={() =>
        navigate("/login")
      }
    >
      Back to Login
    </button>
  </form>
</div>
);
}
