import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getReports } from "../../services/reportService";
import RevenueChart from "../../components/charts/RevenueChart";
import TopBuyingCustomers from "../../components/charts/TopBuyingCustomers";
import StatusPie, { ORDER_STATUS_COLORS } from "../../components/charts/StatusPie";
import {
  ShoppingCart,
  IndianRupee,
  Package,
  Pill, 
  Calendar
} from "lucide-react";

import {
  BarChart, Bar,
  XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer, Legend
} from "recharts";

export default function Reports() {
  const [data, setData] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [showTopMedicines, setShowTopMedicines] = useState(false);
  const [dateFilter, setDateFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await getReports();
        setData(res);
      } catch (error) {
        console.error("Failed to fetch reports:", error);
      }
    };

    fetchReports();
  }, []);

  if (!data) {
    return <p className="p-6">Loading reports...</p>;
  }

  const allOrders = data.orders || [];

  const filterByDate = (orders) => {
    if (dateFilter === "all") return orders;

    const now = new Date();

    return orders.filter((order) => {
      const orderDate = new Date(order.createdAt);

      if (dateFilter === "weekly") {
        const lastWeek = new Date();
        lastWeek.setDate(now.getDate() - 7);
        return orderDate >= lastWeek;
      }

      if (dateFilter === "monthly") {
        return (
          orderDate.getMonth() === now.getMonth() &&
          orderDate.getFullYear() === now.getFullYear()
        );
      }

      if (dateFilter === "yearly") {
        return orderDate.getFullYear() === now.getFullYear();
      }

      if (dateFilter === "quarterly") {
        const currentQuarter = Math.floor(now.getMonth() / 3);
        const orderQuarter = Math.floor(orderDate.getMonth() / 3);
        return (
          currentQuarter === orderQuarter &&
          orderDate.getFullYear() === now.getFullYear()
        );
      }

      if (dateFilter === "custom" && fromDate && toDate) {
        return orderDate >= new Date(fromDate) && orderDate <= new Date(toDate);
      }

      return true;
    });
  };

  // 🔹 Stat cards (always from allOrders, no date filter)
  const totalOrders = allOrders.length;

  const pendingOrders = allOrders.filter(
    (o) => o.status === "pending"
  ).length;

  const deliveredOrders = allOrders.filter(
    (o) => o.status === "delivered"
  ).length;

  const rejectedOrders = allOrders.filter(
    (o) => o.status === "rejected"
  ).length;

  const revenue = allOrders
    .filter((o) => o.status === "delivered")
    .reduce((sum, o) => sum + (o.grandTotal || 0), 0);

  // 🔹 Revenue Trend Data
  const filteredChartOrders = filterByDate(allOrders);

  // 🔹 Order Status Pie Data
  const orderStatusData = [
    { name: "pending", value: pendingOrders },
    { name: "delivered", value: deliveredOrders },
    { name: "rejected", value: rejectedOrders },
  ].filter((item) => item.value > 0);

  // 🔹 Medicine Logic
  const medicineDetails = {};

  allOrders.forEach((order) => {
    if (order.status === "delivered") {
      order.items?.forEach((item) => {
        const name = item.medicineName;

        if (!medicineDetails[name]) {
          medicineDetails[name] = {
            name,
            quantity: 0,
            revenue: 0,
            mrp: item.mrp,
            price: item.price,
            discount: item.discount,
            expiry: item.expiryDate,
          };
        }

        medicineDetails[name].quantity += item.quantity;
        medicineDetails[name].revenue += item.price * item.quantity;
      });
    }
  });

  const topMedicineList = Object.values(medicineDetails)
    .sort((a, b) => b.quantity - a.quantity);

  const topMedicineName = topMedicineList[0]?.name || "No Data";

  const topMedicineChart = topMedicineList.slice(0, 5);

  const filteredOrders = allOrders
    .filter((o) =>
      activeFilter === "all" ? true : o.status === activeFilter
    )
    .filter((order) => {
      if (!searchTerm) return true;

      const orderId = order._id?.toLowerCase() || "";
      const userName = order.user?.name?.toLowerCase() || "";

      return (
        orderId.includes(searchTerm) ||
        userName.includes(searchTerm)
      );
    });

  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-green-800">
            Reports
          </h1>
          <div className="w-16 h-1 bg-green-600 mt-1 rounded"></div>
        </div>

        <input
          type="text"
          placeholder="Search by Order ID or Username..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
          className="px-4 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* 🔥 DATE FILTER UI */}
      <div className="bg-white p-4 rounded-xl shadow mb-6 flex flex-wrap gap-3 items-center">

        <div className="flex items-center gap-2 text-green-700 font-semibold">
          <Calendar size={18} />
          Filter:
        </div>

        {["weekly", "monthly", "quarterly", "yearly", "custom"].map((f) => (
          <button
            key={f}
            onClick={() => {
              if (dateFilter === f) {
                setDateFilter("all");
                setFromDate("");
                setToDate("");
              } else {
                setDateFilter(f);
              }
            }}
            className={`px-3 py-1 rounded-lg text-sm capitalize border
              ${dateFilter === f ? "bg-green-600 text-white shadow" : "bg-gray-100"}`}
          >
            {f}
          </button>
        ))}

        {dateFilter === "custom" && (
          <div className="flex gap-2">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border px-2 py-1 rounded"
            />
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border px-2 py-1 rounded"
            />
          </div>
        )}
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-4 gap-4 mb-6">

        <StatCard
          title="Total Orders"
          value={totalOrders}
          icon={<Package size={20} />}
          active={activeFilter === "all" && !showTopMedicines}
          onClick={() => {
            setActiveFilter("all");
            setShowTopMedicines(false);
          }}
        />

        <StatCard
          title="Pending Orders"
          value={pendingOrders}
          icon={<ShoppingCart size={20} />}
          active={activeFilter === "pending"}
          onClick={() => {
            setActiveFilter("pending");
            setShowTopMedicines(false);
          }}
        />

        <StatCard
          title="Revenue"
          value={`₹${revenue.toFixed(2)}`}
          icon={<IndianRupee size={20} />}
          active={activeFilter === "delivered"}
          onClick={() => {
            setActiveFilter("delivered");
            setShowTopMedicines(false);
          }}
        />

        <StatCard
          title="Top Medicine"
          value={topMedicineName}
          icon={<Pill size={20} />}
          active={showTopMedicines}
          onClick={() => {
            setShowTopMedicines(true);
            setActiveFilter("all");
          }}
        />
      </div>

      {/* 🔥 CHARTS SECTION */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">

        {/* Revenue Line Chart */}
        <div className="bg-white p-5 rounded-2xl shadow-md border">
          <RevenueChart orders={filteredChartOrders} />
        </div>

        {/* Order Status Pie */}
        <StatusPie
          title="Order Status"
          subtitle="Breakdown of all orders"
          data={orderStatusData}
          colors={ORDER_STATUS_COLORS}
          emptyText="No orders yet"
          height={400}
        />

        {/* Top Medicines Bar */}
        <div className="bg-white p-5 rounded-2xl shadow-md border md:col-span-2">

          <div className="mb-4">
            <h2 className="text-lg font-semibold text-green-800">
              Top Medicines
            </h2>
            <div className="w-10 h-1 bg-green-600 mt-1 rounded"></div>
          </div>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topMedicineChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="quantity" fill="#16a34a" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* Top Buying Customers */}
      <div className="bg-white p-5 rounded-2xl shadow-md border md:col-span-2 mb-6">
        <TopBuyingCustomers orders={allOrders} limit={5} />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-md border overflow-hidden">

        <div className="p-5">
          <h2 className="text-lg font-semibold text-green-800 capitalize">
            {showTopMedicines ? "Top Medicines" : `${activeFilter} Orders`}
          </h2>
          <div className="w-12 h-1 bg-green-600 mt-1 rounded"></div>
        </div>

        <table className="w-full text-sm border-separate border-spacing-0">

          <thead>
            {showTopMedicines ? (
              <tr className="bg-green-800 text-white">
                <th className="p-3 text-center rounded-tl-2xl">SL</th>
                <th className="p-3 text-center">Medicine</th>
                <th className="p-3 text-center">MRP</th>
                <th className="p-3 text-center">Disc%</th>
                <th className="p-3 text-center">Price</th>
                <th className="p-3 text-center">Expiry</th>
                <th className="p-3 text-center">Sold</th>
                <th className="p-3 text-center rounded-tr-2xl">Revenue</th>
              </tr>
            ) : (
              <tr className="bg-green-800 text-white">
                <th className="p-3 text-center rounded-tl-2xl">#</th>
                <th className="p-3 text-center">Order ID</th>
                <th className="p-3 text-center">User</th>
                <th className="p-3 text-center">Amount</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center rounded-tr-2xl">Date</th>
              </tr>
            )}
          </thead>

          <tbody>
            {showTopMedicines ? (
              topMedicineList.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-5 text-center text-gray-500">
                    No Data Found
                  </td>
                </tr>
              ) : (
                topMedicineList.map((med, index) => (
                  <tr key={index} className="border-t hover:bg-green-50 text-center">
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3 font-semibold">{med.name}</td>
                    <td className="p-3">₹{med.mrp}</td>
                    <td className="p-3">{med.discount}%</td>
                    <td className="p-3">₹{med.price}</td>
                    <td className="p-3">
                      {new Date(med.expiry).toLocaleDateString()}
                    </td>
                    <td className="p-3 font-bold text-green-700">
                      {med.quantity}
                    </td>
                    <td className="p-3 font-semibold text-green-800">
                      ₹{med.revenue.toFixed(2)}
                    </td>
                  </tr>
                ))
              )
            ) : (
              filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-5 text-center text-gray-500">
                    No Data Found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order, index) => {
                  const isLast = index === filteredOrders.length - 1;

                  return (
                    <tr
                      key={order._id}
                      onClick={() => navigate(`/dashboard/orders/${order._id}`)}
                      className="border-t hover:bg-green-50 text-center cursor-pointer transition hover:scale-[1.01]"
                    >
                      {/* Serial Number */}
                      <td className={`p-3 ${isLast ? "rounded-bl-2xl" : ""}`}>
                        {index + 1}
                      </td>

                      {/* Order ID */}
                      <td className="p-3">
                        #{order._id.slice(-6)}
                      </td>

                      {/* User */}
                      <td className="p-3 font-medium">
                        {order.user?.name || "N/A"}
                      </td>

                      {/* Amount */}
                      <td className="p-3 font-semibold">
                        ₹{(order.grandTotal ?? 0).toFixed(2)}
                      </td>

                      {/* Status */}
                      <td className="p-3">
                        <StatusBadge status={order.status} />
                      </td>

                      {/* Date */}
                      <td className={`p-3 ${isLast ? "rounded-br-2xl" : ""}`}>
  {String(order.createdAt)}
</td>
                    </tr>
                  );
                })
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// STATUS BADGE
function StatusBadge({ status }) {
  const styles = {
    delivered: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    pending: "bg-yellow-100 text-yellow-700",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
      {status}
    </span>
  );
}

// STAT CARD
function StatCard({ title, value, icon, active, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer p-4 rounded-xl shadow flex justify-between items-center border-l-4
        ${active ? "bg-green-50 border-green-600" : "bg-white hover:bg-green-50"}`}
    >
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <h2 className="text-xl font-bold">{value}</h2>
      </div>

      <div className="bg-green-100 text-green-600 p-3 rounded-full">
        {icon}
      </div>
    </div>
  );
}