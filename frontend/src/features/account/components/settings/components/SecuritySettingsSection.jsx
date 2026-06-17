import { useState } from "react";
import API from "../../../../../services/apiClient";
import { toast } from "react-toastify";

import {
  ShieldCheck,
  KeyRound,
  Smartphone,
  LogOut,
  X,
  Eye,
  EyeOff,
  Lock,
  Loader2,
  Monitor,
} from "lucide-react";

// ================= PASSWORD INPUT =================
const PasswordInput = ({
  name,
  placeholder,
  value,
  visible,
  field,
  handleChange,
  togglePassword,
}) => (
  <div className="relative">
    <Lock
      className="absolute left-3 top-1/2 -translate-y-1/2 text-green-300/70"
      size={18}
    />
    <input
      type={visible ? "text" : "password"}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      required
      autoComplete="off"
      className="w-full rounded-2xl border border-green-800/50 bg-black/20 px-10 py-3 text-white placeholder:text-gray-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition"
    />
    <span
      onClick={() => togglePassword(field)}
      className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-white transition"
    >
      {visible ? <EyeOff size={20} /> : <Eye size={20} />}
    </span>
  </div>
);

export default function SecuritySettingsSection() {

  // ================= STATES =================
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showSessions, setShowSessions] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState("");

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [show2FAModal, setShow2FAModal] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [otp, setOtp] = useState("");
  const [verifying2FA, setVerifying2FA] = useState(false);

  // ================= HANDLE INPUT =================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  // ================= TOGGLE PASSWORD =================
  const togglePassword = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // ================= RESET FORM =================
  const resetForm = () => {
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setShowPassword({ current: false, new: false, confirm: false });
  };

  // ================= CLOSE MODAL =================
  const closeModal = () => {
    setShowPasswordModal(false);
    resetForm();
  };

  // ================= TOGGLE 2FA =================
  const handleToggle2FA = async () => {
    try {
      if (twoFactorEnabled) {
        // Cookie sent automatically
        await API.post("/settings/disable-2fa");
        setTwoFactorEnabled(false);
        toast.success("2FA Disabled ❌");
        return;
      }

      const response = await API.post("/settings/enable-2fa");
      setQrCode(response.data.qrCode);
      setShow2FAModal(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "2FA update failed");
    }
  };

  const verify2FAOTP = async () => {
    try {
      setVerifying2FA(true);
      await API.post("/settings/verify-2fa", { token: otp });
      setTwoFactorEnabled(true);
      setShow2FAModal(false);
      setOtp("");
      toast.success("2FA Enabled Successfully ✅");
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP ❌");
    } finally {
      setVerifying2FA(false);
    }
  };

  // ================= FETCH SESSIONS =================
  const fetchSessions = async () => {
    try {
      setSessionsLoading(true);
      const response = await API.get("/settings/sessions");
      setSessions(response.data.sessions);
      // Server returns the current session ID so we can mark it
      setCurrentSessionId(response.data.currentSessionId || "");
    } catch (error) {
      toast.error("Failed to fetch sessions");
    } finally {
      setSessionsLoading(false);
    }
  };

  // ================= LOGOUT SESSION =================
  const logoutSession = async (sessionId) => {
    try {
      await API.delete(`/settings/sessions/${sessionId}`);
      toast.success("Session removed");
      fetchSessions();
    } catch (error) {
      toast.error("Failed to logout session");
    }
  };

  // ================= LOGOUT ALL DEVICES =================
  const logoutAllDevices = async () => {
    try {
      await API.delete("/settings/sessions");
      toast.success("Logged out from all devices");
      setSessions([]);
    } catch (error) {
      toast.error("Failed to logout devices");
    }
  };

  // ================= CHANGE PASSWORD =================
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error("Passwords do not match ❌");
    }

    try {
      setLoading(true);
      const response = await API.put("/settings/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success(response.data.message || "Password Updated ✅");
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || "Password update failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-gray-50 p-6">

      {/* HEADER */}
      <div className="mb-6">
        <div>
          <h1 className="text-2xl font-bold text-green-900">Password & Security</h1>
          <div className="w-16 h-1 bg-green-600 mt-1 rounded" />
        </div>
        <p className="text-gray-500 mt-3">
          Manage your password, authentication and active sessions
        </p>
      </div>

      {/* SETTINGS */}
      <div className="space-y-6">

        {/* CHANGE PASSWORD */}
        <div className="card bg-white border border-gray-200 shadow-sm rounded-[28px]">
          <div className="card-body">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
              <div className="flex gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100 transition-all duration-300 hover:bg-emerald-100">
                  <KeyRound size={23} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Change Password</h2>
                  <p className="opacity-70 text-sm">Update your account password</p>
                </div>
              </div>
              <button
                onClick={() => setShowPasswordModal(true)}
                className="btn rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white border-0"
              >
                Update Password
              </button>
            </div>
          </div>
        </div>

        {/* TWO FACTOR */}
        <div className="rounded-3xl border border-green-900/40 bg-white/5 backdrop-blur-xl shadow-[0_0_25px_rgba(0,255,120,0.05)]">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div className="flex gap-4">
                <div className="w-14 h-14 rounded-2xl bg-cyan-50 text-cyan-700 flex items-center justify-center border border-cyan-100 transition-all duration-300 hover:bg-cyan-100">
                  <ShieldCheck size={23} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Two Factor Authentication</h2>
                  <p className="opacity-70 text-sm">Add extra protection</p>
                </div>
              </div>
              <input
                type="checkbox"
                className="toggle toggle-success"
                checked={twoFactorEnabled}
                onChange={handleToggle2FA}
              />
            </div>
          </div>
        </div>

        {/* ACTIVE SESSIONS */}
        <div className="card bg-white border border-gray-200 shadow-sm rounded-[28px]">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div className="flex gap-4">
                <div className="w-14 h-14 rounded-2xl bg-violet-50 text-violet-700 flex items-center justify-center border border-violet-100 transition-all duration-300 hover:bg-violet-100">
                  <Smartphone size={23} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Active Sessions</h2>
                  <p className="opacity-70 text-sm">Manage logged in devices</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowSessions(true);
                  fetchSessions();
                }}
                className="btn rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white border-0"
              >
                View Sessions
              </button>
            </div>
          </div>
        </div>

        {/* LOGOUT ALL */}
        <div className="card bg-white border border-gray-200 shadow-sm rounded-[28px]">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div className="flex gap-4">
                <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-700 flex items-center justify-center border border-red-100 transition-all duration-300 hover:bg-red-100">
                  <LogOut size={23} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Logout All Devices</h2>
                  <p className="opacity-70 text-sm">Sign out from all devices</p>
                </div>
              </div>
              <button
                onClick={logoutAllDevices}
                className="btn rounded-2xl bg-red-800 hover:bg-red-900 text-white border-0"
              >
                Logout Devices
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PASSWORD MODAL */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md rounded-3xl relative overflow-hidden border border-green-900/40 bg-gradient-to-br from-[#03170c] via-[#052e16] to-[#14532d] shadow-[0_0_40px_rgba(0,255,120,0.08)]">
            <div className="absolute -top-20 -left-20 w-52 h-52 bg-green-500/10 blur-3xl rounded-full" />

            <div className="relative p-8">
              <button
                onClick={closeModal}
                className="absolute top-5 right-5 text-gray-400 hover:text-white transition"
              >
                <X size={22} />
              </button>

              <div className="mb-7">
                <h2 className="text-3xl font-bold text-white">Change Password</h2>
                <p className="text-sm text-gray-400 mt-2">
                  Secure your account with a stronger password
                </p>
              </div>

              <form onSubmit={handlePasswordUpdate} className="space-y-5">
                <PasswordInput
                  name="currentPassword"
                  placeholder="Current Password"
                  value={passwordData.currentPassword}
                  visible={showPassword.current}
                  field="current"
                  handleChange={handleChange}
                  togglePassword={togglePassword}
                />
                <PasswordInput
                  name="newPassword"
                  placeholder="New Password"
                  value={passwordData.newPassword}
                  visible={showPassword.new}
                  field="new"
                  handleChange={handleChange}
                  togglePassword={togglePassword}
                />
                <PasswordInput
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={passwordData.confirmPassword}
                  visible={showPassword.confirm}
                  field="confirm"
                  handleChange={handleChange}
                  togglePassword={togglePassword}
                />

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-5 py-3 rounded-2xl border border-gray-600 text-gray-300 hover:bg-white/5 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-semibold shadow-lg shadow-green-500/20 transition disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Change Password"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 2FA MODAL */}
      {show2FAModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white border border-base-300 p-8 relative shadow-[0_10px_40px_rgba(0,0,0,0.12)]">
            <button
              onClick={() => setShow2FAModal(false)}
              className="absolute top-5 right-5 opacity-70 hover:opacity-100"
            >
              <X size={22} />
            </button>

            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold">Enable 2FA</h2>
              <p className="opacity-70 mt-2">
                Scan the QR code using Google Authenticator
              </p>
            </div>

            <div className="flex justify-center mb-6">
              <img
                src={qrCode}
                alt="QR Code"
                className="w-60 h-60 rounded-2xl border border-base-300"
              />
            </div>

           <input
  type="text"
  inputMode="numeric"
  maxLength={6}
  placeholder="Enter OTP"
  value={otp}
  onChange={(e) => setOtp(e.target.value)}
  className="
  w-full
  rounded-2xl
  border
  border-gray-300
  bg-white
  px-4
  py-3
  text-center
  text-2xl
  font-bold
  tracking-[0.5rem]
  text-black
  placeholder:tracking-normal
  placeholder:text-gray-400
  outline-none
  focus:border-green-500
  focus:ring-2
  focus:ring-green-500/20
"
/>

            <button
              onClick={verify2FAOTP}
              disabled={verifying2FA}
              className="btn btn-success w-full"
            >
              {verifying2FA ? "Verifying..." : "Verify OTP"}
            </button>
          </div>
        </div>
      )}

      {/* SESSIONS MODAL */}
      {showSessions && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl rounded-3xl bg-gradient-to-b from-white to-gray-50 border border-gray-200 p-6 relative shadow-[0_10px_40px_rgba(0,0,0,0.12)] max-h-[90vh] overflow-y-auto">

            <button
              onClick={() => setShowSessions(false)}
              className="absolute top-5 right-5 text-gray-500 hover:text-black"
            >
              <X size={22} />
            </button>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-bold">Active Sessions</h2>
                <p className="opacity-70 mt-1">
                  Devices currently logged into your account
                </p>
              </div>
              <button
                onClick={logoutAllDevices}
                className="btn bg-red-600 hover:bg-red-700 text-white border-0 rounded-xl px-6"
              >
                Logout All
              </button>
            </div>

            {sessionsLoading ? (
              <div className="flex justify-center py-16">
                <span className="loading loading-spinner loading-lg" />
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.length === 0 && (
                  <div className="text-center py-10 opacity-70">
                    No active sessions found
                  </div>
                )}

                {sessions.map((session) => {
                  // Compare by session _id instead of raw token string
                  const isCurrent = session._id === currentSessionId;

                  return (
                    <div
                      key={session._id}
                      className="border border-gray-200 rounded-2xl p-5 flex flex-col md:flex-row md:items-center gap-5 hover:bg-gray-50 transition"
                    >
                      {/* LEFT */}
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-violet-50 text-violet-600 border border-violet-100 flex items-center justify-center">
                          <Monitor size={22} />
                        </div>

                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-3 flex-wrap">
                            <span>
                              {isCurrent ? "Current Device" : session.browser}
                            </span>
                            {isCurrent && (
                              <span className="px-3 py-1 rounded-full text-xs bg-emerald-100 text-emerald-700 border border-emerald-200 font-medium">
                                Active Now
                              </span>
                            )}
                          </h3>

                          <p className="text-sm text-gray-600 font-medium">
                            {session.browser} on {session.os}
                          </p>

                          <p className="text-sm text-gray-700 font-semibold">
                            IP: {session.ip}
                          </p>

                          <p className="text-sm text-gray-700 font-semibold mt-2 tracking-wide">
                            {new Date(session.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* RIGHT */}
                      <button
                        onClick={() => logoutSession(session._id)}
                        disabled={isCurrent}
                        className={`
                          h-10 min-w-[110px] px-5 rounded-xl text-sm font-medium
                          transition-all duration-200 flex items-center justify-center
                          ${isCurrent
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-red-500 hover:bg-red-600 text-white"}
                        `}
                      >
                        {isCurrent ? "Current" : "Logout"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}