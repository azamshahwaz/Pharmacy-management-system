import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../../../services/apiClient";
import { toast } from "react-toastify";

export default function VerifyResetOTP() {
const [otp, setOtp] = useState("");
const [loading, setLoading] = useState(false);
const [timer, setTimer] = useState(60);

const navigate = useNavigate();
const { state } = useLocation();

const email =
state?.email ||
localStorage.getItem("resetEmail");

useEffect(() => {
if (!email) {
navigate("/forgot-password");
}
}, [email, navigate]);

useEffect(() => {
if (timer <= 0) return;

const interval = setInterval(() => {
  setTimer((prev) => prev - 1);
}, 1000);

return () => clearInterval(interval);

}, [timer]);

const handleVerify = async (e) => {
e.preventDefault();

if (!otp.trim()) {
  return toast.error("OTP is required");
}

try {
  setLoading(true);

  await API.post(
    "/auth/verify-reset-otp",
    {
      email,
      otp,
    }
  );

  localStorage.setItem(
    "resetOTP",
    otp
  );

  toast.success("OTP Verified ✅");

  navigate("/reset-password", {
    state: {
      email,
      otp,
    },
  });
} catch (err) {
  toast.error(
    err?.response?.data?.message ||
      "OTP verification failed"
  );
} finally {
  setLoading(false);
}

};

const handleResendOTP = async () => {
try {
await API.post(
"/auth/forgot-password",
{
email,
}
);
  setTimer(60);

  toast.success(
    "OTP resent successfully ✅"
  );
} catch (err) {
  toast.error(
    err?.response?.data?.message ||
      "Failed to resend OTP"
  );
}

};

return ( <div className="min-h-screen flex items-center justify-center bg-base-200 px-4"> <form
     onSubmit={handleVerify}
     className="card bg-base-100 shadow-xl p-6 md:p-8 w-full max-w-md"
   > <h2 className="text-2xl font-bold text-center mb-2">
Verify OTP </h2>

    <p className="text-sm text-center opacity-70 mb-4">
      OTP sent to
      <br />
      <span className="font-semibold">
        {email}
      </span>
    </p>

    <input
      type="text"
      maxLength={6}
      placeholder="Enter 6-digit OTP"
      className="input input-bordered w-full"
      value={otp}
      onChange={(e) =>
        setOtp(e.target.value)
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
        ? "Verifying..."
        : "Verify OTP"}
    </button>

    <div className="flex justify-between items-center mt-4 gap-2">
      <button
        type="button"
        className="btn btn-outline btn-sm"
        disabled={timer > 0}
        onClick={handleResendOTP}
      >
        {timer > 0
          ? `Resend (${timer}s)`
          : "Resend OTP"}
      </button>

      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={() =>
          navigate("/forgot-password")
        }
      >
        Change Email
      </button>
    </div>
  </form>
</div>

);
}
