// frontend/src/features/account/pages/Settings.jsx

import {
  ShieldCheck,
  Bell,
  Settings2,
  TriangleAlert,
  ChevronRight,
  MapPin,
  CreditCard,
} from "lucide-react";

import { Link } from "react-router-dom";

// ================= COMMON SETTINGS =================

const SECURITY = {
  title: "Password & Security",
  description: "Manage password, 2FA and sessions",
  icon: ShieldCheck,
  route: "/dashboard/settings/security",
  color: "bg-blue-100 text-blue-700",
};

const NOTIFICATIONS = {
  title: "Notifications",
  description: "Manage alerts and email notifications",
  icon: Bell,
  route: "/dashboard/settings/notifications",
  color: "bg-amber-100 text-amber-700",
};

const DANGER_ZONE = {
  title: "Danger Zone",
  description: "Delete or deactivate account",
  icon: TriangleAlert,
  route: "/dashboard/settings/danger-zone",
  color: "bg-red-100 text-red-700",
  danger: true,
};

// ================= ROLE BASED SETTINGS =================

const SETTINGS_BY_ROLE = {
  admin: [
    SECURITY,

    NOTIFICATIONS,

    {
      title: "Admin Controls",
      description:
        "Manage permissions and approvals",
      icon: Settings2,
      route:
        "/dashboard/settings/admin-controls",
      color:
        "bg-green-100 text-green-700",
    },

    DANGER_ZONE,
  ],

  staff: [
    SECURITY,

    NOTIFICATIONS,

    DANGER_ZONE,
  ],

  customer: [
    SECURITY,

    NOTIFICATIONS,

    {
      title: "Saved Addresses",
      description:
        "Manage delivery and billing addresses",
      icon: MapPin,
      route:
        "/dashboard/settings/addresses",
      color:
        "bg-emerald-100 text-emerald-700",
    },

    {
      title: "Payment Settings",
      description:
        "Manage payment methods and preferences",
      icon: CreditCard,
      route:
        "/dashboard/settings/payments",
      color:
        "bg-violet-100 text-violet-700",
    },

    DANGER_ZONE,
  ],
};

export default function Settings({
  userInfo,
}) {

  const role =
    userInfo?.role?.toLowerCase?.() ||
    "customer";

  const settingsOptions =
    SETTINGS_BY_ROLE[role] ||
    SETTINGS_BY_ROLE.customer;

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* ================= HEADER ================= */}

      <div className="mb-6">

        <div>
          <h1 className="text-2xl font-bold text-green-900">
            Settings
          </h1>

          <div className="w-16 h-1 bg-green-600 mt-1 rounded" />
        </div>

        <p className="text-gray-500 mt-3">
          Manage your account and security settings
        </p>

      </div>

      {/* ================= SETTINGS OPTIONS ================= */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        {settingsOptions.map((item) => {

          const Icon = item.icon;

          return (
            <Link
              key={item.title}
              to={item.route}
            >
              <div
                className={`
                  bg-white
                  rounded-3xl
                  border
                  p-6
                  cursor-pointer
                  transition-all
                  duration-300
                  hover:shadow-lg
                  hover:-translate-y-1
                  ${
                    item.danger
                      ? "border-red-200 hover:border-red-300"
                      : "border-gray-100"
                  }
                `}
              >

                <div className="flex items-start justify-between gap-4">

                  <div
                    className={`
                      w-14 h-14
                      rounded-2xl
                      flex items-center justify-center
                      ${item.color}
                    `}
                  >
                    <Icon size={26} />
                  </div>

                  <ChevronRight
                    size={22}
                    className="text-gray-400"
                  />

                </div>

                <div className="mt-5">

                  <h2 className="text-xl font-semibold text-gray-900">
                    {item.title}
                  </h2>

                  <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                    {item.description}
                  </p>

                </div>

              </div>
            </Link>
          );
        })}

      </div>

    </div>
  );
}