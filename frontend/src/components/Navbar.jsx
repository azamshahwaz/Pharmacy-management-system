import { useState } from "react";
import { Menu, ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import NotificationBell from "./NotificationBell";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ toggleSidebar }) {
  const { user } = useAuth();

  const [randomAvatar] = useState(
    `https://i.pravatar.cc/40?img=${Math.floor(Math.random() * 70) + 1}`
  );

  const location = useLocation();
  const navigate = useNavigate();

  const role = user?.role || "customer";
  const avatarSrc = user?.avatar || randomAvatar;

  // ================= TITLE LOGIC =================

  const pageTitles = {
    "/dashboard":
      role === "admin"
        ? "Admin Dashboard"
        : role === "staff"
          ? "Staff Dashboard"
          : "Customer Dashboard",

    "/dashboard/medicines": "Medicines",
    "/dashboard/manage-medicines": "Medicines",
    "/dashboard/orders": "Orders",
    "/dashboard/review-orders": "Review Orders",
    "/dashboard/track-orders": "Track Order",
    "/dashboard/payments": "Payment",
    "/dashboard/payment-history": "Payment History",

    "/dashboard/users":
      role === "staff" ? "Customers" : "Users",

    "/dashboard/reports": "Reports & Sales",
    "/dashboard/customers": "Customers",

    "/dashboard/profile": "My Profile",
    "/dashboard/settings": "Settings",
    "/dashboard/change-password": "Change Password",

    "/dashboard/settings/security":
      "Password & Security",

    "/dashboard/settings/notifications":
      "Notification Settings",

    "/dashboard/settings/addresses":
      "Saved Addresses",

    "/dashboard/settings/admin-controls":
      "Admin Controls",

    "/dashboard/settings/payments":
      "Payment Settings",

    "/dashboard/settings/danger-zone":
      "Danger Zone",
  };

  const getPageTitle = () => {
    // User details page
    if (location.pathname.startsWith("/dashboard/users/")) {
      return "User Details";
    }

    // Medicines routes
    if (
      location.pathname.startsWith(
        "/dashboard/manage-medicines"
      )
    ) {
      return "Medicines";
    }

    // Invoice routes
    if (
      location.pathname.startsWith("/dashboard/invoice") || location.pathname.startsWith("/dashboard/orders/")
    ) {
      return "Invoice";
    }

    return pageTitles[location.pathname] || "Dashboard";
  };

  const pageTitle = getPageTitle();

  // ================= ROLE CONFIG =================

  const roleConfig = {
    admin: {
      subtitle: "Super Admin",
    },
    staff: {
      subtitle: "Staff Member",
    },
    customer: {
      subtitle: "Valued Customer",
    },
  };

  const currentRole =
    roleConfig[role] || roleConfig.customer;

  const showBackButton =
    location.pathname.startsWith("/dashboard/users/");

  return (
    <div className="w-full bg-white border-b border-gray-200 shadow-sm py-3 px-3 md:px-6">
      <div className="flex items-center justify-between gap-2">

        {/* LEFT */}
        <div className="flex items-center gap-2 md:gap-4 min-w-0">

          <Menu
            className="cursor-pointer text-gray-600 shrink-0"
            onClick={toggleSidebar}
          />

          {showBackButton && (
            <ArrowLeft
              className="cursor-pointer text-gray-600 shrink-0"
              onClick={() => navigate(-1)}
            />
          )}

          <h1 className="text-base md:text-lg font-semibold truncate text-gray-800">
            {pageTitle}
          </h1>

        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3 md:gap-6 shrink-0">

          <NotificationBell user={user} />

          <div className="flex items-center gap-2">

            <img
              src={avatarSrc}
              alt="avatar"
              className="w-8 h-8 rounded-full object-cover shrink-0"
            />

            <div className="leading-tight hidden md:block">

              <p className="text-sm font-semibold text-gray-800">
                {user?.name || "User"}
              </p>

              <p className="text-xs text-gray-500">
                {currentRole.subtitle}
              </p>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}