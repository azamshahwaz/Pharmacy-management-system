import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/apiClient";
import {
  Users, Pill, ShoppingBag, Clock, IndianRupee,
  CheckCircle, ShoppingCart, Package, MapPin, CreditCard,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

// ─── ADMIN CARDS ───────────────────────────────────────────
const ADMIN_CARDS = [
  { key: "totalUsers",     label: "Total Users",      linkText: "View Users",       icon: Users,        iconBg: "bg-emerald-50", iconColor: "text-emerald-700", linkColor: "text-emerald-600 hover:text-emerald-800" },
  { key: "totalMedicines", label: "Total Medicines",  linkText: "Manage Medicines", icon: Pill,         iconBg: "bg-emerald-50", iconColor: "text-emerald-700", linkColor: "text-emerald-600 hover:text-emerald-800" },
  { key: "totalOrders",    label: "Total Orders",     linkText: "View Orders",      icon: ShoppingBag,  iconBg: "bg-amber-50",   iconColor: "text-amber-700",   linkColor: "text-amber-600 hover:text-amber-800" },
  { key: "pendingOrders",  label: "Pending Orders",   linkText: "View Pending",     icon: Clock,        iconBg: "bg-red-50",     iconColor: "text-red-700",     linkColor: "text-red-500 hover:text-red-700" },
  { key: "totalRevenue",   label: "Total Revenue",    linkText: "Sales Report",     icon: IndianRupee,  iconBg: "bg-violet-50",  iconColor: "text-violet-700",  linkColor: "text-violet-600 hover:text-violet-800", isRevenue: true },
];

// ─── STAFF CARDS ───────────────────────────────────────────
const STAFF_CARDS = [
  { key: "pendingOrders",     label: "Pending Orders",     linkText: "View Orders",     icon: ShoppingBag, iconBg: "bg-blue-50",    iconColor: "text-blue-700",    linkColor: "text-blue-600 hover:text-blue-800" },
  { key: "completedOrders",   label: "Completed Orders",   linkText: "View History",    icon: CheckCircle, iconBg: "bg-emerald-50", iconColor: "text-emerald-700", linkColor: "text-emerald-600 hover:text-emerald-800" },
  { key: "totalMedicines",    label: "Medicines Managed",  linkText: "Manage Medicines",icon: Pill,        iconBg: "bg-amber-50",   iconColor: "text-amber-700",   linkColor: "text-amber-600 hover:text-amber-800" },
  { key: "approvedCustomers", label: "Approved Customers", linkText: "View Customers",  icon: Users,       iconBg: "bg-violet-50",  iconColor: "text-violet-700",  linkColor: "text-violet-600 hover:text-violet-800" },
];

// ─── CUSTOMER CARDS ────────────────────────────────────────
const CUSTOMER_CARDS = [
  {
    key: "totalMedicines",
    label: "Medicines",
    linkText: "Browse Medicines",
    icon: Pill,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-700",
    linkColor: "text-emerald-600 hover:text-emerald-800",
    formatVal: () => "Order Medicines",
  },
  {
    key: "totalOrders",
    label: "My Orders",
    linkText: "View Orders",
    icon: Package,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-700",
    linkColor: "text-blue-600 hover:text-blue-800",
    formatVal: (v) => `${v} Orders`,
  },
  {
    key: "trackOrder",
    label: "Track Order",
    linkText: "Track Now",
    icon: MapPin,
    iconBg: "bg-violet-50",
    iconColor: "text-violet-700",
    linkColor: "text-violet-600 hover:text-violet-800",
    formatVal: () => "Track",
  },
  {
    key: "pendingPayments",
    label: "Payment",
    linkText: "View Payments",
    icon: CreditCard,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-700",
    linkColor: "text-amber-600 hover:text-amber-800",
    formatVal: (v) => "Pending",
  },
];

// ─── ROLE CONFIG ───────────────────────────────────────────
const ROLE_CONFIG = {
  admin: {
    cards: ADMIN_CARDS,
    apiUrl: "/admin/dashboard/stats",
    cols: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
  },

  staff: {
    cards: STAFF_CARDS,
    apiUrl: "/admin/dashboard/stats",
    cols: "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4",
  },

  customer: {
    cards: CUSTOMER_CARDS,
    apiUrl: "/admin/dashboard/stats",
    cols: "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4",
  },
};

// ─── FORMATTER ─────────────────────────────────────────────
function formatValue(val, card) {
  if (card.formatVal) return card.formatVal(val);
  if (card.isRevenue) return "₹ " + Math.round(Number(val)).toLocaleString("en-IN");
  return Number(val).toLocaleString("en-IN");
}

// ─── SKELETON ──────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 animate-pulse">
      <div className="w-8 h-8 bg-gray-100 rounded mb-2" />
      <div className="h-2 w-20 bg-gray-100 rounded mb-2" />
      <div className="h-6 w-16 bg-gray-100 rounded mb-1" />
      <div className="h-2 w-14 bg-gray-100 rounded" />
    </div>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────
export default function StatsCards({ role = "customer" }) {
  const navigate = useNavigate();
  const { user } = useAuth(); // ✅ user from cookie-based auth context

  const [data, setData]             = useState(null);
  const [loading, setLoading]       = useState(true);
  const [lastUpdated, setLastUpdated] = useState("");
  const [error, setError]           = useState(null);

  const config = ROLE_CONFIG[role] || ROLE_CONFIG.customer;

  const userId = user?._id || user?.id;

  const ROUTES = {
    totalUsers:       "/dashboard/users",
    totalMedicines:   "/dashboard/medicines",
    totalOrders:      "/dashboard/orders",
    pendingOrders:    "/dashboard/orders?status=pending",
    totalRevenue:     "/dashboard/reports",
    completedOrders:  `/dashboard/orders?status=delivered&managedBy=${userId}`,
    reviewOrders:     "/dashboard/review-orders",
    pendingPayments: "/dashboard/orders?status=accepted",
    trackOrder:       "/dashboard/track-orders",
    approvedCustomers:`/dashboard/customers?managedBy=${userId}`,
  };

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get(config.apiUrl);
      setData(res.data.data);
      setLastUpdated(
        new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
      );
    } catch (err) {
      console.error(err);
      setError("Failed to load stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [role]);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center gap-1 text-xs text-gray-500 border px-2 py-1 rounded hover:bg-gray-50"
        >
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
        {lastUpdated && (
          <span className="text-xs text-gray-400">Updated {lastUpdated}</span>
        )}
      </div>

      {/* Error */}
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

      {/* Cards */}
      <div className={`grid ${config.cols} gap-3`}>
        {loading
          ? config.cards.map((_, i) => <SkeletonCard key={i} />)
          : config.cards.map((card) => {
              const Icon  = card.icon;
              const value = data?.[card.key] ?? 0;
              return (
                <div
                  key={card.key}
                  className="bg-white border rounded-lg p-3 hover:shadow-md transition cursor-pointer"
                >
                  <div className={`w-8 h-8 flex items-center justify-center rounded mb-2 ${card.iconBg}`}>
                    <Icon size={16} className={card.iconColor} />
                  </div>
                  <p className="text-xs text-gray-500 uppercase">{card.label}</p>
                  <p className="text-xl font-semibold text-gray-900">{formatValue(value, card)}</p>
                  <p
                    onClick={() => navigate(ROUTES[card.key] || "/")}
                    className={`text-xs mt-1 cursor-pointer hover:underline ${card.linkColor}`}
                  >
                    {card.linkText} →
                  </p>
                </div>
              );
            })}
      </div>
    </div>
  );
}