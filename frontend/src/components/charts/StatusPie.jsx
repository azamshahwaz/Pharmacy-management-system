import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

export default function StatusPie({ title, subtitle, data, colors, emptyText, height = 350 }) {
  return (
    <div className="bg-white border shadow-sm rounded-2xl p-5 flex flex-col" style={{ height }}>
      <h2 className="text-xl font-bold text-green-900">{title}</h2>
      <p className="text-sm text-gray-500 mt-1 mb-2">{subtitle}</p>

      {data.length === 0 ? (
        <div className="flex items-center justify-center flex-1 text-gray-400 text-sm">
          {emptyText}
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="85%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={colors[entry.name] || "#94a3b8"} />
              ))}
            </Pie>
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(v) => <span className="text-xs text-gray-600 capitalize">{v}</span>}
            />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export const ORDER_STATUS_COLORS = {
  delivered: "#16a34a",
  pending:   "#f59e0b",
  accepted:  "#3b82f6",
  rejected:  "#ef4444",
};