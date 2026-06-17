import { useNavigate, NavLink } from "react-router-dom";
import { sidebarConfig } from "../config/sidebarConfig";
import { useMemo } from "react";
import Swal from "sweetalert2";
import { X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Sidebar({ role, collapsed, mobileOpen = false, onClose = () => {} }) {
const navigate = useNavigate();

const { user, logout } = useAuth();

  // 🔥 memoized menu
  const menu = useMemo(() => sidebarConfig[role] || [], [role]);

const handleClick = async (item) => {
  if (item.action !== "logout") return;

  const result = await Swal.fire({
    html: `
      <div style="text-align:center; padding-top:8px;">

        <div
          style="
            width:72px;
            height:72px;
            border-radius:9999px;
            background:linear-gradient(135deg, #22c55e, #14b8a6);
            color:#ffffff;
            display:flex;
            align-items:center;
            justify-content:center;
            margin:0 auto 18px;
            font-size:30px;
            font-weight:700;
            box-shadow:0 8px 20px -4px rgba(34,197,94,0.45);
          "
        >
          ${(user?.name?.charAt(0) || "U").toUpperCase()}
        </div>

        <div
          style="
            font-size:18px;
            font-weight:700;
            color:#0a2e23;
            margin-bottom:4px;
          "
        >
          ${user?.name || "User"}
        </div>

        <p
          style="
            color:#9ca3af;
            font-size:12px;
            font-weight:600;
            text-transform:uppercase;
            letter-spacing:0.05em;
            margin:0 0 16px;
          "
        >
          ${role || "Member"}
        </p>

        <div style="
          height:1px;
          background:linear-gradient(to right, transparent, #e5e7eb, transparent);
          margin: 16px 0;
        "></div>

        <h2
          style="
            font-size:20px;
            font-weight:700;
            color:#111827;
            margin:0 0 8px;
          "
        >
          Logout from account?
        </h2>

        <p
          style="
            color:#6b7280;
            font-size:14px;
            line-height:1.6;
            margin:0;
          "
        >
          You'll need to sign in again to access your dashboard and data.
        </p>

      </div>
    `,

    showCancelButton: true,

    confirmButtonText: "Yes, Logout",
    cancelButtonText: "Stay Here",

    reverseButtons: true,

    background: "#ffffff",

    allowOutsideClick: true,
    allowEscapeKey: true,

    customClass: {
      popup: "rounded-3xl shadow-2xl",
    },

    buttonsStyling: false,

    didOpen: () => {
      const confirmBtn = Swal.getConfirmButton();
      const cancelBtn = Swal.getCancelButton();

      confirmBtn.style.background = "linear-gradient(135deg, #ef4444, #dc2626)";
      confirmBtn.style.color = "#ffffff";
      confirmBtn.style.fontWeight = "600";
      confirmBtn.style.padding = "12px 24px";
      confirmBtn.style.borderRadius = "12px";
      confirmBtn.style.border = "none";
      confirmBtn.style.boxShadow = "0 6px 16px -4px rgba(239,68,68,0.5)";
      confirmBtn.style.transition = "all 0.2s";
      confirmBtn.onmouseenter = () => (confirmBtn.style.transform = "translateY(-1px)");
      confirmBtn.onmouseleave = () => (confirmBtn.style.transform = "translateY(0)");

      cancelBtn.style.background = "#f3f4f6";
      cancelBtn.style.color = "#374151";
      cancelBtn.style.fontWeight = "600";
      cancelBtn.style.padding = "12px 24px";
      cancelBtn.style.borderRadius = "12px";
      cancelBtn.style.border = "none";
      cancelBtn.style.marginRight = "12px";
      cancelBtn.style.transition = "all 0.2s";
      cancelBtn.onmouseenter = () => (cancelBtn.style.background = "#e5e7eb");
      cancelBtn.onmouseleave = () => (cancelBtn.style.background = "#f3f4f6");
    },
  });

if (result.isConfirmed) {
  try {
    await logout();

    navigate("/login", {
      replace: true,
    });
  } catch (error) {
    console.error(error);
  }
}
};

  // 🔥 Close sidebar on mobile when a nav item is clicked
  const handleNavClick = (item) => {
    if (item.action === "logout") {
      handleClick(item);
    } else {
      onClose();
    }
  };

  return (
    <>
      {/* ================= MOBILE BACKDROP ================= */}
      {mobileOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        />
      )}

      {/* ================= SIDEBAR ================= */}
      <div
        className={`
          fixed top-0 left-0 z-50 h-screen w-64
          bg-gradient-to-b from-[#0d3b2e] to-[#0a2e23] text-white
          flex flex-col overflow-y-auto
          transform transition-transform duration-300 ease-in-out

          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}

          lg:static lg:translate-x-0 lg:transition-all
          ${collapsed ? "lg:w-0 lg:overflow-hidden lg:border-0" : "lg:w-64"}
        `}
      >
        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="lg:hidden absolute top-4 right-4 text-gray-300 hover:text-white"
        >
          <X size={22} />
        </button>

        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-green-900 shrink-0">
          <div className="bg-gradient-to-br from-[#22c55e] to-[#14b8a6] p-2 rounded-xl">
            <svg width="24" height="24" viewBox="0 0 24 24">
              <rect x="9" y="3" width="6" height="18" rx="3" fill="white" />
              <rect x="3" y="9" width="18" height="6" rx="3" fill="white" />
            </svg>
          </div>

          <div>
            <h1 className="text-lg font-semibold">New Drug</h1>
            <p className="text-xs text-gray-400 capitalize">{role} Panel</p>
          </div>
        </div>

        {/* Menu */}
        <div className="mt-4">
          {menu.map((section, i) => (
            <div key={i}>
              <p className="px-6 text-xs text-gray-400 mt-4 mb-2">
                {section.title}
              </p>

              {section.items.map((item, j) => {
                if (item.access && !item.access.includes(role)) return null;

                const Icon = item.icon;

                return (
                  <div key={j} className="px-3">
                    
                    {/* 🔥 LOGOUT BUTTON */}
                    {item.action === "logout" ? (
                      <div
                        onClick={() => handleNavClick(item)}
                        className="flex items-center gap-3 px-4 py-3 cursor-pointer rounded-full text-gray-300 hover:bg-red-600 transition"
                      >
                        <Icon size={18} />
                        <span className="text-sm">{item.label}</span>
                      </div>
                    ) : (
                      /* 🔥 NAVLINK (AUTO ACTIVE FIX) */
                      <NavLink
  to={item.path}
  end={item.path === "/dashboard"}   // 🔥 IMPORTANT LINE
  onClick={() => handleNavClick(item)}
  className={({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-full transition
    ${
      isActive
        ? "bg-green-400/30 text-white"
        : "text-gray-300 hover:bg-green-700/70 hover:text-white"
    }`
  }
>
                        <Icon size={18} />
                        <span className="text-sm">{item.label}</span>
                      </NavLink>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}