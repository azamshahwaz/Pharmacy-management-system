import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../../services/apiClient";
import StatsCards from "../../../components/StatsCards";
import { getReports } from "../../../services/reportService";
import { getAllUsers, updateUserStatus } from "../../../services/commonAPI";
import RevenueChart from "../../../components/charts/RevenueChart";
import TopBuyingCustomers from "../../../components/charts/TopBuyingCustomers";
import UsersTable from "../../../components/tables/UsersTable";
import OrdersTable from "../../../components/tables/OrdersTable";
import { toast } from "react-toastify";

export default function AdminView() {
  const navigate = useNavigate();

  const [allOrders, setAllOrders] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingUsers(true);

        // Service functions use axios with withCredentials globally set
        const res = await getReports();
        setAllOrders(res.orders || []);
        setRecentOrders(res.recentOrders || []);

        const userRes = await getAllUsers();
        setUsers(userRes.users || []);

      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchData();
  }, []);

  const handleUserStatusChange = async (id, status) => {
    try {
      const res = await updateUserStatus(id, status);
      toast.success(`User ${status}`);
      const updatedUser = res.user;
      setUsers((prev) => prev.map((u) => (u._id === id ? updatedUser : u)));
    } catch {
      toast.error("User action failed");
    }
  };

  const handleApprove = (id) => handleUserStatusChange(id, "approved");

  const handleReject = (id) => {
    if (!window.confirm("Reject this user?")) return;
    handleUserStatusChange(id, "rejected");
  };

const handleOrderStatusChange = async (id, newStatus) => {
  try {
    const { data } = await API.put(
      `/orders/${id}/status`,
      {
        status: newStatus,
      }
    );

    if (data.success) {
      toast.success(`Order ${newStatus}`);

      const updater = (prev) =>
        prev.map((o) =>
          o._id === id
            ? { ...o, status: newStatus }
            : o
        );

      setAllOrders(updater);
      setRecentOrders(updater);
    } else {
      toast.error(data.message);
    }

  } catch (error) {
    console.error("Order update failed: ", error);

    toast.error(
      error.response?.data?.message ||
      "Order update failed"
    );
  }
};

  return (
    <div className="space-y-6">

      {/* STATS */}
      <StatsCards role="admin" />

      {/* CHARTS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white border shadow-sm rounded-2xl p-5 h-[350px]">
          <RevenueChart orders={allOrders} />
        </div>
        <div className="bg-white border shadow-sm rounded-2xl p-5 h-[350px] flex flex-col">
          <TopBuyingCustomers orders={allOrders} limit={5} />
        </div>
      </div>

      {/* USERS TABLE */}
      <div className="bg-white border shadow-sm rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div>
            <h2 className="text-xl font-bold text-green-900">Recent Users</h2>
            <p className="text-sm text-gray-500 mt-1">Manage newly registered users</p>
          </div>
          <button
            onClick={() => navigate("/dashboard/users")}
            className="bg-green-700 hover:bg-green-800 text-white text-sm px-4 py-2 rounded-lg transition"
          >
            View All
          </button>
        </div>
        <UsersTable
          users={users.slice(0, 5)}
          loading={loadingUsers}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </div>

      {/* ORDERS TABLE */}
      <div className="bg-white border shadow-sm rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div>
            <h2 className="text-xl font-bold text-green-900">Recent Orders</h2>
            <p className="text-sm text-gray-500 mt-1">Latest customer orders</p>
          </div>
          <button
            onClick={() => navigate("/dashboard/orders")}
            className="bg-green-700 hover:bg-green-800 text-white text-sm px-4 py-2 rounded-lg transition"
          >
            View All
          </button>
        </div>
        <OrdersTable
          orders={recentOrders}
          onStatusChange={handleOrderStatusChange}
          limit={5}
          showFilters={false}
          showStats={false}
        />
      </div>
    </div>
  );
}