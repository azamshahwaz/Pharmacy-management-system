import { Clock3 } from "lucide-react";

// ── Helper: createdAt → "2 hours ago" style ──────────────────────────────────
function timeAgo(dateStr) {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);

  if (mins  < 1)  return "Just now";
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days  < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-GB");
}

// ── Helper: targetType badge color ───────────────────────────────────────────
function badgeStyle(targetType) {
  switch (targetType) {
    case "Order":    return "bg-blue-100 text-blue-700";
    case "User":     return "bg-green-100 text-green-700";
    case "Payment":  return "bg-yellow-100 text-yellow-700";
    case "Medicine": return "bg-purple-100 text-purple-700";
    default:         return "bg-gray-100 text-gray-600";
  }
}

function getActionLabel(action) {
  const labels = {
    PROFILE_UPDATED: "Profile Updated",
    ADDRESS_UPDATED: "Address Updated",
    ORDER_PLACED: "Order Placed",
    ORDER_ACCEPTED: "Order Accepted",
    ORDER_REJECTED: "Order Rejected",
    ORDER_DELIVERED: "Order Delivered",
  };

  return labels[action] || action;
}

export default function ActivityCard({ activities = [] }) {

  // ── Empty state ─────────────────────────────────────────────────────────────
  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 rounded-3xl border border-dashed border-green-200 bg-green-50/40">

        <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mb-4">
          <Clock3 size={28} className="text-green-700" />
        </div>

        <h3 className="text-lg font-semibold text-gray-800">
          No Recent Activity
        </h3>

        <p className="text-[#475467] font-medium mt-2">
          Your latest activities will appear here
        </p>

      </div>
    );
  }

  // ── Activity list ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">

      {activities.map((item, index) => (

        <div
          key={item._id || item.id || index}
          className="
            flex items-center justify-between gap-5
            p-5 rounded-3xl
            border border-gray-100 bg-white
            hover:border-green-200 hover:bg-green-50/40 hover:shadow-md
            transition-all duration-300
          "
        >

          {/* LEFT — icon + text */}
          <div className="flex items-center gap-4 min-w-0">

            {/* Icon */}
            <div className="w-14 h-14 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center shrink-0">
              <Clock3 size={22} />
            </div>

            {/* Text */}
            <div className="min-w-0">

              <h3 className="text-base font-semibold text-gray-900 truncate">
                {getActionLabel(item.action) || "Activity"}
              </h3>

              {/* targetType badge */}
              {item.targetType && (
                <span
                  className={`
                    inline-block mt-1 px-2.5 py-0.5 rounded-full
                    text-xs font-semibold
                    ${badgeStyle(item.targetType)}
                  `}
                >
                  {item.targetType}
                </span>
              )}

            </div>

          </div>

          {/* RIGHT — timestamp */}
          <div className="text-sm text-[#475467] font-medium whitespace-nowrap shrink-0">
            {/* use createdAt from schema, fallback to item.time */}
            {timeAgo(item.createdAt || item.time)}
          </div>

        </div>
      ))}

    </div>
  );
}