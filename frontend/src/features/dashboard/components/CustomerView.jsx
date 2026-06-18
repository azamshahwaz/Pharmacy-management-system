import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../../services/apiClient";
import StatsCards from "../../../components/StatsCards";
import { toast } from "react-toastify";

import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer,
} from "recharts";

import StatusPie, { ORDER_STATUS_COLORS } from "../../../components/charts/StatusPie";

// ─── SPENDING CHART ────────────────────────────────────────
function SpendingChart({ orders = [] }) {
  // 1. CustomTooltip pehle define karo
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { date, spent } = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-md px-3 py-2 text-sm">
          <p className="text-gray-500 mb-1">{date}</p>
          <p className="font-semibold text-green-700">
            ₹{spent.toLocaleString("en-IN")}
          </p>
        </div>
      );
    }
    return null;
  };

  // 2. Phir data banao — index fix ke saath
  const data = orders
    .filter((o) => o.status === "delivered")
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .map((o, index) => ({          // ✅ index added
      label: `Order ${index + 1}`,
      date: new Date(o.createdAt).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      spent: Number(o.grandTotal || 0),
    }));

  // 3. return — XAxis pe dataKey="label" rakho
  return (
    <div className="bg-white border shadow-sm rounded-2xl p-5">
      <h2 className="text-xl font-bold text-green-900">My Spending</h2>
      <p className="text-sm text-gray-500 mt-1 mb-4">Delivered orders over time</p>
      {data.length === 0 ? (
        <div className="h-[250px] flex items-center justify-center text-gray-400">
          No spending data yet
        </div>
      ) : (
        <div style={{ width: "100%", height: 250 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />  {/* ✅ label */}
              <YAxis
                tickFormatter={(v) => `₹${v.toLocaleString("en-IN")}`}
                tick={{ fontSize: 11 }}
                width={70}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="spent"
                stroke="#16a34a"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// ─── STATUS BADGE ──────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    delivered: "bg-green-100 text-green-700",
    accepted: "bg-blue-100 text-blue-700",
    pending: "bg-yellow-100 text-yellow-700",
    processing: "bg-blue-100 text-blue-700",
    cancelled: "bg-red-100 text-red-700",
    rejected: "bg-red-100 text-red-700",
    shipped: "bg-violet-100 text-violet-700",
    paid: "bg-green-100 text-green-700",
    unpaid: "bg-red-100 text-red-700",
  };
  return (
    <span className={`text-xs px-2 py-1 rounded font-medium capitalize ${map[status] || "bg-gray-100 text-gray-600"}`}>
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
          <p className="text-sm text-gray-500 mt-1">Your latest placed orders</p>
        </div>
        <button
          onClick={() => navigate("/dashboard/orders")}
          className="bg-green-700 hover:bg-green-800 text-white text-sm px-4 py-2 rounded-lg transition"
        >
          View All
        </button>
      </div>

      <div className="overflow-x-auto border rounded-2xl">
        <table className="w-full min-w-[750px] text-sm">
          <thead>
            <tr className="bg-green-900 text-white text-left">
              <th className="px-4 py-4 rounded-tl-2xl">#</th>
              <th className="px-4 py-4">Order ID</th>
              <th className="px-4 py-4">Date</th>
              <th className="px-4 py-4">Items</th>
              <th className="px-4 py-4">Amount</th>
              <th className="px-4 py-4 rounded-tr-2xl">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse border-b">
                  {[...Array(6)].map((__, j) => (
                    <td key={j} className="px-4 py-4">
                      <div className="h-3 bg-gray-100 rounded w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-gray-400">
                  No Orders Found
                </td>
              </tr>
            ) : (
              orders.slice(0, 5).map((o, index) => (
                <tr
                  key={o._id}
                  onClick={() => navigate(`/dashboard/orders/${o._id}`)}
                  className="border-b hover:bg-gray-50 transition cursor-pointer"
                >
                  <td className="px-4 py-4 font-medium text-gray-600">{index + 1}</td>
                  <td className="px-4 py-4 text-xs text-gray-700 font-mono">{o._id}</td>
                  <td className="px-4 py-4 text-gray-600">
                    {new Date(o.createdAt).toLocaleDateString("en-IN")}
                  </td>
                  <td className="px-4 py-4 text-gray-600">
                    {o.items?.length || 0} item{o.items?.length !== 1 ? "s" : ""}
                  </td>
                  <td className="px-4 py-4 font-semibold">
                    ₹{(o.grandTotal || 0).toLocaleString("en-IN")}
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

// ─── RECENT PAYMENTS TABLE ─────────────────────────────────
function RecentPaymentsTable({ payments = [], loading, navigate }) {
  return (
    <div className="bg-white border shadow-sm rounded-2xl p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-green-900">Recent Payments</h2>
          <p className="text-sm text-gray-500 mt-1">Your latest payment transactions</p>
        </div>
        <button
          onClick={() => navigate("/dashboard/payment-history")}
          className="bg-green-700 hover:bg-green-800 text-white text-sm px-4 py-2 rounded-lg transition"
        >
          View All
        </button>
      </div>

      <div className="overflow-x-auto border rounded-2xl">
        <table className="w-full min-w-[750px] text-sm">
          <thead>
            <tr className="bg-green-900 text-white text-left">
              <th className="px-4 py-4 rounded-tl-2xl">#</th>
              <th className="px-4 py-4">Payment ID</th>
              <th className="px-4 py-4">Date</th>
              <th className="px-4 py-4">Method</th>
              <th className="px-4 py-4">Amount</th>
              <th className="px-4 py-4 rounded-tr-2xl">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse border-b">
                  {[...Array(6)].map((__, j) => (
                    <td key={j} className="px-4 py-4">
                      <div className="h-3 bg-gray-100 rounded w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : payments.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-gray-400">
                  No Payments Found
                </td>
              </tr>
            ) : (
              payments.slice(0, 5).map((p, index) => (
                <tr key={p._id} className="border-b hover:bg-gray-50 transition">
                  <td className="px-4 py-4 font-medium text-gray-600">{index + 1}</td>
                  <td className="px-4 py-4 text-xs text-gray-700 font-mono">
                    {p.razorpay_payment_id || p._id}
                  </td>
                  <td className="px-4 py-4 text-gray-600">
                    {p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-IN") : "—"}
                  </td>
                  <td className="px-4 py-4 capitalize text-gray-600">
                    {p.paymentMethod || "—"}
                  </td>
                  <td className="px-4 py-4 font-semibold">
                    ₹{(p.amount || 0).toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={p.status || "pending"} />
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
export default function CustomerView() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data } = await API.get("/orders/my-orders");
        setOrders(data.orders || data.data || []);

        const { data: paymentData } = await API.get("/payments/history");
        setPayments([...(paymentData.payments || [])].reverse());
      } catch (err) {
        console.error("Customer dashboard fetch error:", err);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const orderStatusData = Object.entries(
    orders.reduce((acc, o) => {
      const s = o.status || "unknown";
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      <StatsCards role="customer" />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <SpendingChart orders={orders} />
        <StatusPie
          title="Order Status"
          subtitle="Breakdown of all my orders"
          data={orderStatusData}
          colors={ORDER_STATUS_COLORS}
          emptyText="No orders yet"
          height={350}
        />
      </div>

      <RecentOrdersTable orders={orders} loading={loading} navigate={navigate} />
      <RecentPaymentsTable payments={payments} loading={loading} navigate={navigate} />
    </div>
  );
}