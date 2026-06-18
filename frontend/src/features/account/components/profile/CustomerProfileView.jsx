import {
  Mail,
  Phone,
  BadgeCheck,
  CalendarDays,
  ShoppingBag,
  MapPin,
  IndianRupee,
  Gift,
  Clock3,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import ProfileHeader        from "../common/AccountProfileHeader";
import PersonalInfoCard     from "../common/PersonalInfoCard";
import ActivityCard         from "../common/ActivityCard";
import QuickStats           from "../common/QuickStats";

export default function CustomerProfileView({
  user,
  setUser,
  stats = {},
  activities = [],
  recentOrders = [],
}) {
  const navigate = useNavigate();
  const formatDate = (date) => {
  if (!date) return "N/A";

  const d = new Date(date);

  if (isNaN(d.getTime())) return "N/A";

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}-${month}-${year}`;
};

  // ================= QUICK STATS =================
  const quickStats = [
    {
      id: 1,
      title: "Total Orders",
      value: stats?.totalOrders ?? 0,
      icon: ShoppingBag,
    },
    {
      id: 2,
      title: "Total Spent",
      value: `₹${stats?.totalSpent ?? 0}`,
      icon: IndianRupee,
    },
    {
      id: 3,
      title: "Reward Points",
      value: stats?.rewardPoints ?? 0,
      icon: Gift,
    },
    {
      id: 4,
      title: "Saved Addresses",
      value: stats?.savedAddresses ?? 0,
      icon: MapPin,
    },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] space-y-0 pb-10">

      {/* PROFILE HEADER */}
      <ProfileHeader user={user} setUser={setUser} />

      {/* PERSONAL INFO */}
      <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
        <PersonalInfoCard user={user} setUser={setUser} showHeader={true} />
      </div>

      {/* CUSTOMER DETAILS */}
      <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">

        <SectionHeading
          title="User Details"
          subtitle="Overview of your account information"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <InfoItem
            label="Full Name"
            value={user?.name}
            icon={<BadgeCheck size={18} />}
          />

          <InfoItem
            label="Email Address"
            value={user?.email}
            icon={<Mail size={18} />}
          />

          <InfoItem
            label="Phone Number"
            value={user?.phone}
            icon={<Phone size={18} />}
          />

          <InfoItem
            label="Membership"
            value={user?.membership || "Standard"}
            icon={<BadgeCheck size={18} />}
          />

        </div>
      </div>

      {/* CUSTOMER ROLE INFO */}
      <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">

        <SectionHeading
          title="User Role Information"
          subtitle="Activity and membership overview"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">

          <RoleInfoItem
            title="Total Orders"
            value={stats?.totalOrders ?? 0}
            icon={<ShoppingBag size={20} />}
          />

          <RoleInfoItem
            title="Membership"
            value={user?.membership || "Standard"}
            icon={<BadgeCheck size={20} />}
          />

          <RoleInfoItem
  title="Joined"
  value={
    user?.createdAt
      ? user.createdAt.split(" ")[0]
      : "N/A"
  }
  icon={<CalendarDays size={20} />}
/>

        </div>
      </div>

      {/* QUICK STATS */}
      <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">

        <SectionHeading
          title="Quick Statistics"
          subtitle="Overview of your account activity"
        />

        <QuickStats stats={quickStats} user={user} />

      </div>

      {/* RECENT ORDERS */}
      <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">

        <SectionHeading
          title="Recent Orders"
          subtitle="View your latest orders"
        />

        {recentOrders?.length > 0 ? (

          <div className="space-y-4">
            {recentOrders.map((order, index) => (
              

              <div
                key={order?._id || index}
                className="bg-white border border-gray-200 rounded-3xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:shadow-md transition-all"
              >

                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Order #{order?._id?.slice(-6)}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
  {order?.createdAt || "N/A"}
</p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`
                      px-4 py-1.5 rounded-full text-sm font-semibold
                      ${order?.status === "accepted"  ? "bg-blue-100 text-blue-700"
                      : order?.status === "delivered" ? "bg-green-100 text-green-700"
                      : order?.status === "rejected"  ? "bg-red-100 text-red-700"
                      :                                 "bg-yellow-100 text-yellow-700"}
                    `}
                  >
                    {order?.status || "pending"}
                  </span>

                  <h3 className="text-2xl font-bold text-gray-900">
                    ₹ {Number(order?.grandTotal || 0).toFixed(2)}
                  </h3>
                </div>

              </div>
            ))}
          </div>

        ) : (

          <EmptyState
            icon={<ShoppingBag size={40} />}
            title="No Orders Yet"
            subtitle="Your recent orders will appear here."
          />
        )}

      </div>

      {/* RECENT ACTIVITY */}
      <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">

        <SectionHeading
          title="Recent Activity"
          subtitle="View your latest account activities"
        />

        {activities?.length > 0 ? (
          <ActivityCard activities={activities} />
        ) : (
          <EmptyState
            icon={<Clock3 size={40} />}
            title="No Activity Found"
            subtitle="Your latest account activities will appear here."
          />
        )}

      </div>

    </div>
  );
}

/* ── SECTION HEADING ─────────────────────────────────────── */

function SectionHeading({ title, subtitle }) {
  return (
    <div className="mb-8">
      <h2 className="text-3xl font-bold text-[#064e3b] tracking-tight inline-block relative">
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
    <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">

      <div className="flex items-center gap-3 text-gray-500 mb-3">
        <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
          {icon}
        </div>
        <p className="text-sm font-semibold">{label}</p>
      </div>

      <h3 className="text-2xl font-bold text-gray-900 break-all">
        {value || "Not Available"}
      </h3>

    </div>
  );
}

/* ── ROLE INFO ITEM ──────────────────────────────────────── */

function RoleInfoItem({ title, value, icon }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-purple-100 bg-white p-6 shadow-sm hover:shadow-lg transition-all">

      <div className="absolute -top-5 -right-5 w-24 h-24 rounded-full bg-purple-100 opacity-50" />

      <div className="relative z-10">

        <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mb-5">
          {icon}
        </div>

        <p className="text-sm text-gray-500 font-medium">{title}</p>

        <h3 className="text-3xl font-bold text-gray-900 mt-1">
          {value || "N/A"}
        </h3>

      </div>

    </div>
  );
}

/* ── EMPTY STATE ─────────────────────────────────────────── */

function EmptyState({ icon, title, subtitle }) {
  return (
    <div className="bg-white border border-dashed border-gray-300 rounded-3xl p-10 flex flex-col items-center justify-center text-center">

      <div className="w-16 h-16 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
        {icon}
      </div>

      <h3 className="text-2xl font-bold text-gray-900">{title}</h3>

      <p className="text-sm text-gray-500 mt-2 max-w-sm">{subtitle}</p>

    </div>
  );
}