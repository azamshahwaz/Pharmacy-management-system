import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { formatDateTime } from "../../utils/formatDate"; // ✅ ADDED

export default function OrdersTable({
  orders = [],
  onStatusChange,
  onPayment,
  showFilters = true,
  showStats = true,
  limit,
}) {
  const { user: currentUser } = useAuth();

  const [activeDropdown, setActiveDropdown] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  const getStatusColor = (status) => {
    switch (status) {
      case "accepted": return "bg-blue-100 text-blue-700";
      case "rejected": return "bg-red-100 text-red-700";
      case "pending": return "bg-yellow-100 text-yellow-700";
      case "delivered": return "bg-green-100 text-green-700";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const toggleDropdown = (id) => {
    setActiveDropdown((prev) => (prev === id ? null : id));
  };

  const total = orders.length;
  const pending = orders.filter((o) => o.status === "pending").length;
  const delivered = orders.filter((o) => o.status === "delivered").length;
  const rejected = orders.filter((o) => o.status === "rejected").length;

  let filteredOrders = orders
    .filter((o) => {
      const s = search.toLowerCase();
      return (
        (o._id || "").toLowerCase().includes(s) ||
        (o.user?.name || "").toLowerCase().includes(s) ||
        (o.user?.email || "").toLowerCase().includes(s)
      );
    })
    .filter((o) => filterStatus === "all" ? true : o.status === filterStatus);

  if (limit) filteredOrders = filteredOrders.slice(0, limit);

  return (
    <div>

      {showFilters && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <input
            type="text"
            placeholder="Search Orders..."
            className="border border-gray-200 px-4 py-2 rounded-xl text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-green-600"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-200 px-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="delivered">Delivered</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      )}

      {showStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <div onClick={() => setFilterStatus("all")} className="bg-gray-50 border rounded-2xl p-4 cursor-pointer hover:shadow-sm">
            <p className="text-sm text-gray-500">Total Orders</p>
            <h2 className="text-2xl font-bold mt-1">{total}</h2>
          </div>
          <div onClick={() => setFilterStatus("pending")} className="bg-yellow-50 border rounded-2xl p-4 cursor-pointer hover:shadow-sm">
            <p className="text-sm text-yellow-700">Pending</p>
            <h2 className="text-2xl font-bold mt-1 text-yellow-700">{pending}</h2>
          </div>
          <div onClick={() => setFilterStatus("delivered")} className="bg-green-50 border rounded-2xl p-4 cursor-pointer hover:shadow-sm">
            <p className="text-sm text-green-700">Delivered</p>
            <h2 className="text-2xl font-bold mt-1 text-green-700">{delivered}</h2>
          </div>
          <div onClick={() => setFilterStatus("rejected")} className="bg-red-50 border rounded-2xl p-4 cursor-pointer hover:shadow-sm">
            <p className="text-sm text-red-700">Rejected</p>
            <h2 className="text-2xl font-bold mt-1 text-red-700">{rejected}</h2>
          </div>
        </div>
      )}

      <div className="overflow-x-auto border rounded-2xl">
        <table className="w-full min-w-[850px] text-sm">
          <thead>
            <tr className="bg-green-900 text-white">
              <th className="px-4 py-4 text-left rounded-tl-2xl">#</th>
              <th className="px-4 py-4 text-left">Order ID</th>
              <th className="px-4 py-4 text-left">User</th>
              <th className="px-4 py-4 text-left">Email</th>
              <th className="px-4 py-4 text-left">Placed On</th>
              <th className="px-4 py-4 text-left">Amount</th>
              <th className="px-4 py-4 text-left">Status</th>
              {currentUser?.role !== "customer" && (
                <th className="px-4 py-4 text-left">
                  Updated By
                </th>
              )}
              <th className="px-4 py-4 text-center rounded-tr-2xl">Action</th>
            </tr>
          </thead>

          <tbody className="bg-white">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-10 text-gray-400">
                  No Orders Found
                </td>
              </tr>
            ) : (
              filteredOrders.map((order, index) => (
                <tr key={order._id} className="border-b hover:bg-gray-50 transition">

                  <td className="px-4 py-4 font-medium text-gray-600">
                    {index + 1}
                  </td>

                  <td className="px-4 py-4 text-xs text-gray-700">
                    {order.orderId || order._id}
                  </td>

                  <td className="px-4 py-4 font-medium">
                    {order.user?.name || "N/A"}
                  </td>

                  <td className="px-4 py-4 text-sm">
                    {order.user?.email || "N/A"}
                  </td>

                  <td className="px-4 py-4 text-xs whitespace-nowrap">
                    {order.createdAt ? formatDateTime(order.createdAt) : "N/A"} {/* ✅ FIXED */}
                  </td>

                  <td className="px-4 py-4 font-semibold">
                    ₹{(order.grandTotal ?? 0).toFixed(2)}
                  </td>

                  {/* ─── STATUS DROPDOWN ─── */}
                  <td className="px-4 py-4">
                    <div className="relative inline-block">
                      <button
                        disabled={order.status === "delivered" || order.status === "rejected"}
                        onClick={() => {
                          if (currentUser?.role === "customer") return;
                          toggleDropdown(order._id);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize ${getStatusColor(order.status)}`}
                      >
                        {order.status}
                      </button>

                      {currentUser?.role !== "customer" && activeDropdown === order._id && (
                        <div className="absolute top-10 left-0 bg-white border rounded-xl shadow-lg w-36 z-20 overflow-hidden">
                          {order.status === "pending" && (
                            <>
                              <div onClick={() => onStatusChange(order._id, "accepted")} className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-sm">Accept</div>
                              <div onClick={() => onStatusChange(order._id, "rejected")} className="px-4 py-3 hover:bg-red-50 cursor-pointer text-sm">Reject</div>
                            </>
                          )}
                          {order.status === "accepted" && (
                            <div onClick={() => onStatusChange(order._id, "delivered")} className="px-4 py-3 hover:bg-green-50 cursor-pointer text-sm">Delivered</div>
                          )}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* ─── UPDATED BY ─── */}
                  {currentUser?.role !== "customer" && (
  <td className="px-4 py-4 min-w-[220px]">
    {order.actionBy?.name ? (
      <div className="text-xs leading-5">
        <p className="font-semibold">
          {order.actionBy.name}
        </p>

        <p className="text-gray-500">
          {order.actionBy.email}
        </p>

        <p className="text-blue-600">
          {order.actionBy?.actionAt
            ? formatDateTime(order.actionBy.actionAt)
            : "N/A"}
        </p>
      </div>
    ) : (
      <span className="text-gray-400">
        Not Updated
      </span>
    )}
  </td>
)}

                  {/* ─── ACTIONS ─── */}
                  <td className="px-4 py-4 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <button
                        onClick={() => navigate(`/dashboard/orders/${order._id}`)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-medium transition"
                      >
                        View
                      </button>

                      {currentUser?.role === "customer" &&
                        (order.status === "accepted" || order.status === "delivered") && (
                          order.isPaid ? (
                            <button
                              disabled
                              className="bg-gray-400 text-white px-4 py-2 rounded-lg text-xs font-medium cursor-not-allowed"
                            >
                              Paid
                            </button>
                          ) : (
                            <button
                              disabled={order.status === "delivered"}
                              onClick={() => onPayment(order)}
                              className={`px-4 py-2 rounded-lg text-xs font-medium text-white transition ${order.status === "delivered"
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-green-600 hover:bg-green-700"
                                }`}
                            >
                              Pay
                            </button>
                          )
                        )}
                    </div>
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