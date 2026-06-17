import {
  ShieldCheck,
  KeyRound,
  Smartphone,
  LogOut,
} from "lucide-react";

import SectionCard from "./SectionCard";

export default function SecurityOverviewCard({
  user,
}) {

  return (
    <SectionCard
      title="Security Settings"
      subtitle="Manage your account security and privacy"
    >

      <div className="space-y-5">

        {/* Password */}
        <SecurityItem
          icon={<KeyRound size={20} />}
          title="Password"
          description="Last changed 30 days ago"
          buttonText="Change Password"
          buttonType="primary"
        />

        {/* 2FA */}
        <SecurityItem
          icon={<ShieldCheck size={20} />}
          title="Two Factor Authentication"
          description="Add extra security to your account"
          buttonText="Enable"
          buttonType="outline"
        />

        {/* Devices */}
        <SecurityItem
          icon={<Smartphone size={20} />}
          title="Active Sessions"
          description="Manage logged in devices"
          buttonText="View Devices"
          buttonType="outline"
        />

        {/* Logout */}
        <SecurityItem
          icon={<LogOut size={20} />}
          title="Logout All Devices"
          description="Sign out from all active sessions"
          buttonText="Logout"
          buttonType="danger"
        />

      </div>

    </SectionCard>
  );
}

/* Reusable Security Item */
function SecurityItem({
  icon,
  title,
  description,
  buttonText,
  buttonType,
}) {

  const buttonStyles = {
    primary:
      "bg-green-700 hover:bg-green-800 text-white",

    outline:
      "border border-green-700 text-green-700 hover:bg-green-50",

    danger:
      "bg-red-600 hover:bg-red-700 text-white",
  };

  return (
    <div
      className="
        flex
        flex-col
        lg:flex-row
        lg:items-center
        lg:justify-between
        gap-5
        border border-gray-200
        rounded-3xl
        p-5
        bg-white
        hover:shadow-sm
        transition
      "
    >

      {/* Left */}
      <div className="flex gap-4">

        {/* Icon */}
        <div
          className="
            w-12 h-12
            rounded-2xl
            bg-green-100
            text-green-700
            flex
            items-center
            justify-center
            shrink-0
          "
        >
          {icon}
        </div>

        {/* Content */}
        <div>

          <h3
            className="
              text-lg
              font-semibold
              text-gray-900
            "
          >
            {title}
          </h3>

          <p
            className="
              text-sm
              text-gray-500
              mt-1
            "
          >
            {description}
          </p>

        </div>

      </div>

      {/* Button */}
      <button
        className={`
          px-5 py-2.5
          rounded-2xl
          font-medium
          transition
          whitespace-nowrap
          ${buttonStyles[buttonType]}
        `}
      >
        {buttonText}
      </button>

    </div>
  );
}