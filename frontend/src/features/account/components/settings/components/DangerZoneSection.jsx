import {
  Trash2,
  UserX,
  AlertTriangle,
} from "lucide-react";
import API from "../../../../../services/apiClient";
import { useAuth } from "../../../../../context/AuthContext";
import Swal from "sweetalert2";

export default function DangerZoneSection() {
  const { user } = useAuth();

  const handleDeactivate = async () => {
    const result = await Swal.fire({
      title: "Deactivate Account?",
      text: "You can reactivate your account anytime by logging in again.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Deactivate",
      confirmButtonColor: "#d97706",
      customClass: {
        popup: "danger-popup",
        confirmButton: "swal-confirm-button",
        cancelButton: "swal-cancel-button",
      },
      buttonsStyling: false,
    });

    if (!result.isConfirmed) return;

    try {
      await API.put("/settings/deactivate-account");

      await Swal.fire({
        icon: "success",
        title: "Account Deactivated",
        text: "You can reactivate it anytime by logging in again.",
        confirmButtonText: "Continue",
        customClass: {
          confirmButton: "swal-confirm-button",
        },
        buttonsStyling: false,
      });

      window.location.href = "/login";
    } catch (error) {
      await Swal.fire(
        "Error",
        error.response?.data?.message || "Failed to deactivate account",
        "error"
      );
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Delete Account?",
      html: `
        <p style="margin-bottom:10px">
          We recommend deactivating your account instead.
        </p>
        <p>
          If you continue, your account will be permanently deleted after 15 days.
        </p>
        <br/>
        <p>
          Logging in before the deletion date will automatically cancel deletion.
        </p>
      `,
      icon: "warning",
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: "Delete Account",
      denyButtonText: "Deactivate Instead",
      cancelButtonText: "Keep Account",
      customClass: {
        popup: "danger-popup",
        confirmButton: "swal-delete-btn",
        denyButton: "swal-deactivate-btn",
        cancelButton: "swal-cancel-btn",
      },
      buttonsStyling: false,
    });

    // Deactivate Instead
    if (result.isDenied) {
      const choice = await Swal.fire({
        title: "Deactivate Account?",
        text: "Your account will be temporarily disabled and can be reactivated anytime by logging in again.",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, Deactivate",
        cancelButtonText: "Go Back",
        customClass: {
          popup: "danger-popup",
          confirmButton: "swal-confirm-button",
          cancelButton: "swal-cancel-button",
        },
        buttonsStyling: false,
      });

      if (choice.isConfirmed) {
        return handleDeactivate();
      }
      return;
    }

    if (!result.isConfirmed) return;

    try {
      // Cookie sent automatically
      await API.put("/settings/request-account-deletion");

      await Swal.fire({
        icon: "success",
        title: "Deletion Scheduled",
        text: "Your account will be deleted after 15 days unless you log in again.",
        confirmButtonText: "Continue",
        customClass: {
          popup: "danger-popup",
          confirmButton: "swal-confirm-button",
        },
        buttonsStyling: false,
      });

      window.location.href = "/login";
    } catch (error) {
      console.error(error);
      Swal.fire(
        "Error",
        error.response?.data?.message || "Failed to schedule deletion",
        "error"
      );
    }
  };

  const actions = [
  {
    icon: UserX,
    title: "Deactivate Account",
    description: "Temporarily disable your account and restrict access",
    button: "Deactivate",
    color: "bg-amber-100 text-amber-700",
    buttonStyle:
      "bg-[#1F7A45] text-white border border-[#1F7A45] hover:bg-[#166534]",
  },

  ...(user?.role !== "admin"
    ? [
        {
          icon: Trash2,
          title: "Delete Account",
          description:
            "Permanently delete your account and all associated data",
          button: "Delete Account",
          color: "bg-red-100 text-red-700",
          buttonStyle:
            "bg-[#DC2626] text-white border border-[#DC2626] hover:bg-[#B91C1C]",
        },
      ]
    : []),
];

  return (
    <div className="min-h-screen bg-red-50 p-6">

      {/* HEADER */}
      <div className="mb-8 border border-red-200 bg-white rounded-3xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
            <AlertTriangle size={26} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-red-700">Danger Zone</h1>
            <p className="text-red-500 mt-2">
              These actions are sensitive and may permanently affect your account and data
            </p>
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="space-y-6">
        {actions.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="bg-white rounded-3xl border border-red-100 p-6 hover:shadow-md transition"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                {/* Left */}
                <div className="flex gap-4">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${item.color}`}
                  >
                    <Icon size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {item.title}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Button */}
                <button
                  onClick={() => {
                    if (item.title === "Deactivate Account") handleDeactivate();
                    if (item.title === "Delete Account") handleDelete();
                  }}
                  className={`
                    min-w-[180px] px-6 py-3 rounded-2xl font-semibold text-sm
                    border shadow-sm hover:shadow-md transition-all duration-300
                    active:scale-95 ${item.buttonStyle}
                  `}
                >
                  {item.button}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}