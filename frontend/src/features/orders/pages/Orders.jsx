import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import API from "../../../services/apiClient";
import OrdersTable from "../../../components/tables/OrdersTable";

const Orders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const managedBy = searchParams.get("managedBy");
  const status = searchParams.get("status");

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(status || "all");

  // =========================
  // FETCH ORDERS
  // =========================
  const fetchOrders = async () => {
    try {
      setLoading(true);

      const url =
        user?.role === "customer"
          ? "/orders/my-orders"
          : managedBy
            ? "/orders/managed-orders"
            : "/orders";

      const res = await API.get(url);
      const data = res.data;

      // MANAGED ORDERS API returns { orders }, ALL ORDERS API returns { data }
      const allOrders = managedBy ? data.orders || [] : data.data || [];
      setOrders(allOrders);
    } catch (err) {
      console.error("Fetch orders error:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchOrders();
  }, [managedBy, user]);

  useEffect(() => {
    setStatusFilter(status || "all");
  }, [status]);

  // =========================
  // UPDATE STATUS
  // =========================
  const updateStatus = async (id, newStatus) => {
    try {
      const res = await API.put(`/orders/${id}/status`, { status: newStatus });
      const data = res.data;

      if (data.success) {
        setOrders((prev) =>
          prev.map((order) =>
            order._id === id ? { ...order, status: newStatus } : order
          )
        );
      }
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  const handlePayment = (order) => {
    navigate("/dashboard/payments", {
      state: {
        orderId: order._id,
        amount: order.grandTotal,
      },
    });
  };

  // =========================
  // FILTERED ORDERS
  // =========================
  const filteredOrders = orders
    .filter((o) => {
      const text = search.toLowerCase();
      return (
        o.orderId?.toLowerCase().includes(text) ||
        o.user?.name?.toLowerCase().includes(text)
      );
    })
    .filter((o) => (statusFilter === "all" ? true : o.status === statusFilter));

  // =========================
  // STATS
  // =========================
  const total = orders.length;
  const pending = orders.filter((o) => o.status === "pending").length;
  const accepted = orders.filter((o) => o.status === "accepted").length;
  const delivered = orders.filter((o) => o.status === "delivered").length;
  const rejected = orders.filter((o) => o.status === "rejected").length;

  return (
    <div className="px-5 py-4">

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">
        <div>
          <h1 className="text-3xl font-bold text-green-900">
            {managedBy ? "Managed Orders" : "Orders"}
          </h1>
          <div className="w-16 h-1 bg-green-700 rounded mt-2"></div>
        </div>

        <input
          type="text"
          placeholder="Search by Order ID or User..."
          className="border border-gray-300 px-4 py-3 rounded-xl w-full lg:w-80 bg-white text-sm outline-none focus:ring-2 focus:ring-green-600"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-5">
        <StatCard title="All Orders" value={total} color="green" active={statusFilter === "all"} onClick={() => setStatusFilter("all")} />
        <StatCard title="Pending" value={pending} color="yellow" active={statusFilter === "pending"} onClick={() => setStatusFilter("pending")} />
        <StatCard title="Accepted" value={accepted} color="purple" active={statusFilter === "accepted"} onClick={() => setStatusFilter("accepted")} />
        <StatCard title="Delivered" value={delivered} color="blue" active={statusFilter === "delivered"} onClick={() => setStatusFilter("delivered")} />
        <StatCard title="Rejected" value={rejected} color="red" active={statusFilter === "rejected"} onClick={() => setStatusFilter("rejected")} />
      </div>

      {/* TABLE SECTION */}
      <div className="rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border border-gray-200 border-b-0 bg-[#f7fbf8] rounded-t-2xl">
          <h2 className="text-xl font-semibold text-green-800">
            {statusFilter === "all"
              ? managedBy ? "All Managed Orders" : "All Orders"
              : `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Orders`}
          </h2>
        </div>

        <div>
          <OrdersTable
            orders={filteredOrders}
            loading={loading}
            onStatusChange={updateStatus}
            onPayment={handlePayment}
            showFilters={false}
            showStats={false}
            user={user}
          />
        </div>
      </div>

    </div>
  );
};

export default Orders;

// =========================
// STATS CARD
// =========================
function StatCard({ title, value, color, onClick, active }) {
  const styles = {
    green:  { border: "border-green-500",  text: "text-green-600",  bg: "bg-green-50" },
    yellow: { border: "border-yellow-500", text: "text-yellow-600", bg: "bg-yellow-50" },
    blue:   { border: "border-blue-500",   text: "text-blue-600",   bg: "bg-blue-50" },
    red:    { border: "border-red-500",    text: "text-red-600",    bg: "bg-red-50" },
    purple: { border: "border-purple-500", text: "text-purple-600", bg: "bg-purple-50" },
  };

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl p-4 border-l-4 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-1
      ${styles[color].border}
      ${active ? styles[color].bg : "bg-white"}`}
    >
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <h2 className={`text-2xl font-bold mt-2 ${styles[color].text}`}>{value}</h2>
    </div>
  );
}