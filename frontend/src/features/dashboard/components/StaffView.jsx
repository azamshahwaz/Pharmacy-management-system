import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import StatsCards from "../../../components/StatsCards";
import { toast } from "react-toastify";
import { useAuth } from "../../../context/AuthContext";
import API from "../../../services/apiClient";

import StatusPie, { ORDER_STATUS_COLORS } from "../../../components/charts/StatusPie";

const USER_STATUS_COLORS = {
  approved: "#16a34a",
  rejected: "#ef4444",
};

// ─── DATE FORMATTER ────────────────────────────────────────
function formatDate(val) {
  if (!val) return "—";
  const d = new Date(val);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

// ─── STATUS BADGE ──────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    delivered: "bg-green-100 text-green-700",
    accepted: "bg-blue-100 text-blue-700",
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-700",
    cancelled: "bg-red-100 text-red-700",
    rejected: "bg-red-100 text-red-700",
    shipped: "bg-violet-100 text-violet-700",
    active: "bg-green-100 text-green-700",
    inactive: "bg-gray-100 text-gray-600",
    blocked: "bg-red-100 text-red-700",
    approved: "bg-green-100 text-green-700",
  };
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${map[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

// ─── RECENT ORDERS TABLE ───────────────────────────────────
function RecentOrdersTable({ orders = [], loading, navigate }) {
  return (
    <div className="bg-white border shadow-sm rounded-2xl p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-green-900">Recent Orders</h2>
          <p className="text-sm text-gray-500 mt-1">Latest 5 orders placed</p>
        </div>
        <button
          onClick={() => navigate("/dashboard/orders")}
          className="bg-green-700 hover:bg-green-800 text-white text-sm px-4 py-2 rounded-lg transition"
        >
          View All
        </button>
      </div>

      <div className="overflow-x-auto border rounded-2xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-green-900 text-white text-left text-xs uppercase tracking-wide">
              <th className="px-4 py-3 rounded-tl-2xl">#</th>
              <th className="px-4 py-3">Order ID</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3 rounded-tr-2xl">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse border-b">
                  {[...Array(7)].map((__, j) => (
                    <td key={j} className="px-4 py-4">
                      <div className="h-3 bg-gray-100 rounded w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-400">No Orders Found</td>
              </tr>
            ) : (
              orders.slice(0, 5).map((o, index) => (
                <tr
                  key={o._id}
                  onClick={() => navigate(`/dashboard/orders/${o._id}`)}
                  className="border-b hover:bg-green-50 transition cursor-pointer group"
                >
                  <td className="px-4 py-4 font-bold text-gray-900 text-xs">{index + 1}</td>
                  <td className="px-4 py-4">
                    <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded group-hover:bg-green-100 transition">
                      #{o.orderId || o._id?.slice(-6).toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-medium text-gray-900">{o.user?.name || "—"}</span>
                  </td>
                  <td className="px-4 py-4 text-gray-700 text-xs font-medium">{formatDate(o.createdAt)}</td>
                  <td className="px-4 py-4">
                    <span className="text-gray-800 font-semibold">
                      {o.items?.length || 0}
                      <span className="text-gray-600 ml-1">item{o.items?.length !== 1 ? "s" : ""}</span>
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-bold text-green-900">₹{(o.grandTotal || 0).toLocaleString("en-IN")}</span>
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={o.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── RECENT USERS TABLE ─────────────────────────────────────
function RecentUsersTable({ users = [], loading, navigate }) {
  return (
    <div className="bg-white border shadow-sm rounded-2xl p-5">
      <div className="flex items-center justify-between mb-5">
  <div>
    <h2 className="text-xl font-bold text-green-900">Recent Users</h2>
    <p className="text-sm text-gray-500 mt-1">Newly registered users</p>
  </div>
  <button
    onClick={() => navigate("/dashboard/customers")}
    className="bg-green-700 hover:bg-green-800 text-white text-sm px-4 py-2 rounded-lg transition"
  >
    View All
  </button>
</div>

      <div className="overflow-x-auto border rounded-2xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-green-900 text-white text-left text-xs uppercase tracking-wide">
              <th className="px-4 py-3 rounded-tl-2xl">#</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3 rounded-tr-2xl">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse border-b">
                  {[...Array(5)].map((__, j) => (
                    <td key={j} className="px-4 py-4">
                      <div className="h-3 bg-gray-100 rounded w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-400">No Users Found</td>
              </tr>
            ) : (
              users.slice(0, 5).map((u, index) => (
                <tr key={u._id} className="border-b hover:bg-green-50 transition group">
                  <td className="px-4 py-4 font-semibold text-gray-900 text-xs">{index + 1}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-green-100 text-green-800 font-bold text-xs flex items-center justify-center uppercase flex-shrink-0">
                        {u.name?.charAt(0) || "?"}
                      </div>
                      <span className="font-medium text-gray-900">{u.name || "—"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-gray-800 text-xs font-medium">{u.email || "—"}</td>
                  <td className="px-4 py-4 text-gray-800 text-xs font-medium">{u.createdAt}</td>
                  <td className="px-4 py-4">
                    <StatusBadge status={u.status || "active"} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────
export default function StaffView() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const staffId = user?._id || user?.id;

  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const ordersRes = await API.get("/orders");
        setOrders(ordersRes.data.orders || ordersRes.data.data || []);

        const usersRes = await API.get("/admin/users");
        const usersData = usersRes.data.users || usersRes.data.data || [];

        setUsers(usersData);

      } catch (err) {
        console.error("Staff dashboard fetch error:", err);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    if (staffId) fetchData();
  }, [staffId]);

  const approvedUsersCount = users.filter(
    (u) => u.status === "approved" && String(u.actionBy?.userId) === String(staffId)
  ).length;

  const rejectedUsersCount = users.filter(
    (u) => u.status === "rejected" && String(u.actionBy?.userId) === String(staffId)
  ).length;

  const userStatusData = [
    { name: "approved", value: approvedUsersCount },
    { name: "rejected", value: rejectedUsersCount },
  ].filter((item) => item.value > 0);

  const acceptedCount = orders.filter((o) => o.acceptedBy?.userId?.toString() === staffId?.toString()).length;
  const rejectedCount = orders.filter((o) => o.rejectedBy?.userId?.toString() === staffId?.toString()).length;
  const deliveredCount = orders.filter((o) => o.deliveredBy?.userId?.toString() === staffId?.toString()).length;

  const orderStatusData = [
    { name: "accepted", value: acceptedCount },
    { name: "rejected", value: rejectedCount },
    { name: "delivered", value: deliveredCount },
  ].filter((item) => item.value > 0);

  return (
    <div className="space-y-6">
      <StatsCards role="staff" />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <StatusPie
          title="Order Status"
          subtitle="Orders handled by you"
          data={orderStatusData}
          colors={ORDER_STATUS_COLORS}
          emptyText="No orders handled yet"
          height={400}
        />
        <StatusPie
          title="User Actions"
          subtitle="Users approved / rejected by you"
          data={userStatusData}
          colors={USER_STATUS_COLORS}
          emptyText="No user actions yet"
          height={400}
        />
      </div>

      <RecentOrdersTable orders={orders} loading={loading} navigate={navigate} />
      <RecentUsersTable users={users} loading={loading} navigate={navigate} />
    </div>
  );
} 