import { useState, useEffect } from "react";
import API from "../../../services/apiClient";
import { toast } from "react-toastify";

function VerifyOTP() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "forest");
  }, []);

const handleVerify = async () => {
  const email = sessionStorage.getItem("signupEmail");

  if (!email) {
    toast.error(
      "Signup session expired. Please signup again."
    );

    setTimeout(() => {
      window.location.href = "/signup";
    }, 1500);

    return;
  }

  if (!otp.trim()) {
    toast.error("Please enter OTP");
    return;
  }

  setLoading(true);

  try {
    const { data } = await API.post(
      "/auth/verify-otp",
      {
        email,
        otp,
      }
    );

    sessionStorage.removeItem("signupEmail");

    toast.success(
      data.message ||
      "Account created! Waiting for approval ⏳"
    );

    setTimeout(() => {
      window.location.href = "/login";
    }, 2000);

  } catch (error) {
    console.error(
      "OTP Verify Error:",
      error
    );

    toast.error(
      error.response?.data?.message ||
      "Something went wrong ❌"
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-full max-w-md shadow-2xl bg-base-100">
        <div className="card-body text-center space-y-4">

          <h2 className="text-2xl font-bold">
            Verify OTP
          </h2>

          <p className="text-sm opacity-70">
            Enter the OTP sent to your email
          </p>

          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="input input-bordered w-full text-center tracking-widest text-lg"
          />

          <button
            onClick={handleVerify}
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading
              ? "Verifying..."
              : "Verify OTP"}
          </button>

        </div>
      </div>
    </div>
  );
}

export default VerifyOTP;