import { useState } from "react";

export default function TopBuyingCustomers({ orders = [],
limit = null,
 }) {
  const [filter, setFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const now = new Date();

  // 🔹 Date Filter Logic
  const filterOrders = (orders) => {
    return orders.filter((order) => {
      const orderDate = new Date(order.createdAt);

      if (filter === "weekly") {
        const lastWeek = new Date();
        lastWeek.setDate(now.getDate() - 7);
        return orderDate >= lastWeek;
      }

      if (filter === "monthly") {
        return (
          orderDate.getMonth() === now.getMonth() &&
          orderDate.getFullYear() === now.getFullYear()
        );
      }

      if (filter === "yearly") {
        return orderDate.getFullYear() === now.getFullYear();
      }

      if (filter === "quarterly") {
        const currentQuarter = Math.floor(now.getMonth() / 3);
        const orderQuarter = Math.floor(orderDate.getMonth() / 3);
        return (
          currentQuarter === orderQuarter &&
          orderDate.getFullYear() === now.getFullYear()
        );
      }

      if (filter === "custom" && fromDate && toDate) {
        return (
          orderDate >= new Date(fromDate) &&
          orderDate <= new Date(toDate)
        );
      }

      return true;
    });
  };

  const filteredOrders = filterOrders(orders).filter(
    (o) => o.status === "delivered"
  );

  // 🔹 Customer Aggregation
  const customerMap = {};

filteredOrders.forEach((order) => {
  const name = order.user?.name || "Unknown";
  
  // ✅ FIX: Order model ke hisaab se sahi path
  const address = [
    order.user?.address?.shopName,
    order.user?.address?.street,
    order.user?.address?.city,
  ]
    .filter(Boolean)
    .join(", ") || "N/A";

  if (!customerMap[name]) {
    customerMap[name] = {
      name,
      address,
      totalBuys: 0,
    };
  }

  customerMap[name].totalBuys += order.grandTotal || 0;
});

  const customers = Object.values(customerMap)
  .sort((a, b) => b.totalBuys - a.totalBuys);

const finalCustomers = limit && limit > 0 ? customers.slice(0, limit) : customers;

  return (
    <div className="h-full flex flex-col">

      {/* 🔥 HEADER + FILTER */}
      <div className="mb-3 flex flex-col gap-2">

        {/* Top Row */}
<div className="flex flex-col md:flex-row justify-between items-start gap-3">

  <div>
    <h2 className="text-xl font-bold text-green-900">
      Top Buying Customers
    </h2>
    <p className="text-sm text-gray-500 mt-1">
      Customers with the highest purchase activity and spending
    </p>
  </div>

  <div className="flex flex-wrap gap-1.5 w-full md:w-auto md:justify-end">
    {["weekly", "monthly", "quarterly", "yearly", "custom"].map((f) => (
      <button
        key={f}
        onClick={() => {
          if (filter === f) {
            setFilter("all");
            setFromDate("");
            setToDate("");
          } else {
            setFilter(f);
          }
        }}
        className={`px-2 py-1 text-xs rounded-md border capitalize transition whitespace-nowrap
          ${
            filter === f
              ? "bg-green-600 text-white shadow"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
      >
        {f}
      </button>
    ))}
  </div>
</div>

        {/* 🔥 Custom Date Inputs */}
        {filter === "custom" && (
          <div className="flex gap-2 items-center">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border px-2 py-1 rounded text-sm"
            />

            <span className="text-gray-500 text-sm">to</span>

            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border px-2 py-1 rounded text-sm"
            />
          </div>
        )}

      </div>

      {/* 🔥 TABLE */}
      <div className="w-full overflow-x-auto flex-1 rounded-xl border">

        <table className="w-full min-w-[700px] text-sm text-center border-separate border-spacing-0">

          {/* Header */}
          <thead>
            <tr className="bg-green-800 text-white">
              <th className="p-3 rounded-tl-xl">#</th>
              <th className="p-3">Name</th>
              <th className="p-3">Address</th>
              <th className="p-3 rounded-tr-xl">Total Buys (₹)</th>
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {finalCustomers.length === 0 ? (
              <tr>
                <td colSpan="3" className="p-4 text-gray-500">
                  No Data
                </td>
              </tr>
            ) : (
              finalCustomers.map((c, i) => {
                const isLast = i === finalCustomers.length - 1;

                return (
                  <tr
                    key={i}
                    className="border-t hover:bg-green-50 transition"
                  >
                    <td className={`p-3 ${isLast ? "rounded-bl-xl" : ""}`}>
                      {i + 1}
                    </td>

                    <td className="p-3">{c.name}</td>

                    <td
                      className="p-3">{c.address}</td>

                    <td
                      className={`p-3 font-bold text-green-700 ${
                        isLast ? "rounded-br-xl" : ""
                      }`}
                    >
                      ₹{c.totalBuys.toFixed(2)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

        </table>
      </div>

    </div>
  );
}