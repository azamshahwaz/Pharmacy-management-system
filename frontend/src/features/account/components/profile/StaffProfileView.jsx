import {
  Mail,
  Phone,
  Briefcase,
  BadgeCheck,
  CalendarDays,
  Users,
  ShoppingCart,
  ShieldCheck,
} from "lucide-react";

import ProfileHeader from "../common/AccountProfileHeader";
import PersonalInfoCard from "../common/PersonalInfoCard";
import ActivityCard from "../common/ActivityCard";
import QuickStats from "../common/QuickStats";

export default function StaffProfileView({
  user,
  stats = {},
  activities = [],
  setUser,
}) {

  // ================= QUICK STATS =================
  const quickStats = [
    {
      id: 1,
      title: "Users Managed",
      value: stats?.usersManaged ?? 0,
      icon: Users,
    },
    {
      id: 2,
      title: "Orders Managed",
      value: stats?.ordersManaged ?? 0,
      icon: ShoppingCart,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f4f7f6] space-y-8 pb-10">

      {/* PROFILE HEADER */}
      <ProfileHeader user={user} setUser={setUser} />

      {/* PERSONAL INFORMATION */}
      <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
        <PersonalInfoCard user={user} setUser={setUser} showHeader={true} />
      </div>

      {/* STAFF DETAILS */}
      <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">

        <SectionHeading
          title="Staff Details"
          subtitle="Overview of staff account information"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <InfoItem
            label="Full Name"
            value={user?.name}
            icon={<BadgeCheck size={16} />}
          />

          <InfoItem
            label="Email Address"
            value={user?.email}
            icon={<Mail size={16} />}
          />

          <InfoItem
            label="Phone Number"
            value={user?.phone}
            icon={<Phone size={16} />}
          />

          <InfoItem
            label="Role"
            value={user?.role}
            icon={<Briefcase size={16} />}
          />

        </div>
      </div>

      {/* STAFF ROLE INFORMATION */}
      <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">

        <SectionHeading
          title="Staff Role Information"
          subtitle="Access permissions and responsibilities"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <RoleInfoItem
            title="Access Level"
            value={user?.accessLevel || "Limited Access"}
            icon={<ShieldCheck size={20} />}
          />

          <RoleInfoItem
            title="Permissions"
            value={
              Array.isArray(user?.permissions)
                ? user.permissions.join(", ")
                : user?.permissions || "Manage Customers & Orders"
            }
            icon={<BadgeCheck size={20} />}
          />

          <RoleInfoItem
            title="Joined"
            value={user?.createdAt ? user.createdAt.split(" ")[0] : "N/A"}
            icon={<CalendarDays size={20} />}
          />

        </div>
      </div>

      {/* QUICK STATS */}
      <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">

        <SectionHeading
          title="Quick Stats"
          subtitle="Overview of your work statistics"
        />

        <QuickStats stats={quickStats} user={user} />

      </div>

      {/* RECENT ACTIVITY */}
      <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">

        <SectionHeading
          title="Recent Activity"
          subtitle="Latest actions and account activity"
        />

        <ActivityCard activities={activities} />

      </div>

    </div>
  );
}

/* ── SECTION HEADING ─────────────────────────────────────── */

function SectionHeading({ title, subtitle }) {
  return (
    <div className="mb-8">
      <h2 className="text-3xl font-bold text-[#064e3b] tracking-tight">
        {title}
      </h2>
      <p className="text-base text-[#475467] font-medium">
        {subtitle}
      </p>
    </div>
  );
}

/* ── INFO ITEM ───────────────────────────────────────────── */

function InfoItem({ label, value, icon }) {
  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">

      <div className="flex items-center gap-3 text-gray-500 mb-3">
        <div className="w-10 h-10 rounded-xl bg-green-100 text-green-700 flex items-center justify-center">
          {icon}
        </div>
        <p className="text-sm font-semibold">{label}</p>
      </div>

      <h3 className="text-xl font-bold text-gray-900 break-all">
        {value || "Not Available"}
      </h3>

    </div>
  );
}

/* ── ROLE INFO ITEM ──────────────────────────────────────── */

function RoleInfoItem({ title, value, icon }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-green-100 bg-white p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">

      <div className="absolute -top-6 -right-6 w-24 h-24 bg-green-100 rounded-full opacity-60" />

      <div className="relative z-10">

        <div className="w-14 h-14 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center mb-5">
          {icon}
        </div>

        <p className="text-sm text-gray-500 font-medium">{title}</p>

        <h3 className="text-2xl font-bold text-gray-900 mt-2">
          {value || "N/A"}
        </h3>

      </div>

    </div>
  );
}