import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

export default function RevenueTrend({
  orders = [],
  title = "Revenue Trend",
  color = "#16a34a",
  height = 260
}) {
  const safeOrders = Array.isArray(orders) ? orders : [];
  
const getChartDate = (dateStr) => {
  if (!dateStr) return "";

  return dateStr.split(" ")[0].replace(/-/g, "/");
};
  const revenueChartData = Object.values(
  safeOrders
    .filter((o) => o.status === "delivered")
    .reduce((acc, order) => {
  const date = getChartDate(
    order.deliveredAt || order.createdAt
  );

  if (!acc[date]) {
    const [day, month, year] = date.split("/");

    acc[date] = {
      date,
      revenue: 0,
      sortDate: new Date(year, month - 1, day),
    };
  }

  acc[date].revenue =
    Number(
      (
        acc[date].revenue +
        Number(order.grandTotal || 0)
      ).toFixed(2)
    );

  return acc;
}, {})
)
.sort((a, b) => a.sortDate - b.sortDate);

  return (
    <div className="w-full" style={{ height }}>

      {/* Heading */}
      <div className="mb-3">
        <h2 className="text-lg font-semibold text-gray-800">
          {title}
        </h2>

        <div
          className="w-10 h-1 mt-1 rounded"
          style={{ background: color }}
        />
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={revenueChartData}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="date" />

          <YAxis />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="revenue"
            stroke={color}
            strokeWidth={3}
            dot={{ r: 3 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}