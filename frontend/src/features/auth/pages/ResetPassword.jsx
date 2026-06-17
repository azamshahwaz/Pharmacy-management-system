import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import API from "../../../services/apiClient";
import { toast } from "react-toastify";

export default function ResetPassword() {
    const navigate = useNavigate();
    const { state } = useLocation();

    const email = state?.email;
    const otp = state?.otp;

    const [newPassword, setNewPassword] =
        useState("");

    const [confirmPassword, setConfirmPassword] =
        useState("");

    const [showPassword, setShowPassword] =
        useState(false);

    const [
        showConfirmPassword,
        setShowConfirmPassword,
    ] = useState(false);

    const [loading, setLoading] =
        useState(false);

    const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,12}$/;

    const handleSubmit = async (e) => {
        e.preventDefault();


        if (!newPassword.trim()) {
            return toast.error(
                "Password is required"
            );
        }

        if (!passwordRegex.test(newPassword)) {
            return toast.error(
                "Password must be 6-12 characters and contain uppercase, lowercase, number and special character"
            );
        }

        if (
            newPassword !== confirmPassword
        ) {
            return toast.error(
                "Passwords do not match"
            );
        }

        try {
            setLoading(true);

            await API.post(
                "/auth/reset-password",
                {
                    email,
                    otp,
                    newPassword,
                }
            );

            toast.success(
                "Password reset successful ✅"
            );

            navigate("/login", {
                replace: true,
            });

        } catch (err) {
            toast.error(
                err?.response?.data?.message ||
                "Failed to reset password"
            );
        } finally {
            setLoading(false);
        }
    };

    return (<div className="min-h-screen flex justify-center items-center bg-base-200 px-4"> <form
        onSubmit={handleSubmit}
        className="card bg-base-100 shadow-xl p-6 md:p-8 w-full max-w-md"
    > <h2 className="text-2xl font-bold text-center mb-2">
            Reset Password </h2>

        <p className="text-sm text-center opacity-70 mb-4">
            Create a new password for your account
        </p>

        {/* New Password */}
        <div className="relative">
            <input
                type={
                    showPassword
                        ? "text"
                        : "password"
                }
                placeholder="Enter New Password"
                className="input input-bordered w-full pr-10"
                value={newPassword}
                onChange={(e) =>
                    setNewPassword(
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

        {/* Confirm Password */}
        <div className="relative mt-4">
            <input
                type={
                    showConfirmPassword
                        ? "text"
                        : "password"
                }
                placeholder="Confirm Password"
                className="input input-bordered w-full pr-10"
                value={confirmPassword}
                onChange={(e) =>
                    setConfirmPassword(
                        e.target.value
                    )
                }
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

        <p className="text-xs opacity-70 mt-3">
            Password must:
            <br />
            • Be 6-12 characters long
            <br />
            • Contain one uppercase letter
            <br />
            • Contain one lowercase letter
            <br />
            • Contain one number
            <br />
            • Contain one special character
            (@$!%*?&)
        </p>

        <button
            type="submit"
            disabled={loading}
            className={`btn btn-primary w-full mt-4 ${loading ? "loading" : ""
                }`}
        >
            {loading
                ? "Resetting..."
                : "Reset Password"}
        </button>
    </form>
    </div>


    );
}
