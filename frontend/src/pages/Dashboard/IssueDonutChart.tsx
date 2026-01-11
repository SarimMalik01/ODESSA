import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
  } from "recharts";
  
  type IssueData = {
    name: string;
    value: number;
  };
  
  const COLORS: Record<string, string> = {
    architecture: "#ef4444", // 🔴 red
    security: "#facc15",     // 🟡 yellow
    browser: "#22c55e",      // 🟢 green
    performance: "#3b82f6",  // 🔵 blue
  };
  
  export default function IssuesDonutChart({
    issues,
  }: {
    issues: Record<string, number>;
  }) {
    const data: IssueData[] = Object.entries(issues).map(
      ([name, value]) => ({
        name,
        value: Number(value),
      })
    );
  
    const total = data.reduce((sum, d) => sum + d.value, 0);
  
    return (
      <div className="w-full">
        {/* DONUT CHART */}
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={3}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={COLORS[entry.name]}
                />
              ))}
            </Pie>
  
            {/* HOVER TOOLTIP (percentage only on hover) */}
            <Tooltip
              formatter={(value, name) => {
                const v = Number(value ?? 0);
                const percent =
                  total > 0
                    ? Math.round((v / total) * 100)
                    : 0;
  
                return [
                  `${percent}%`,
                  typeof name === "string"
                    ? name.charAt(0).toUpperCase() + name.slice(1)
                    : name,
                ];
              }}
            />
          </PieChart>
        </ResponsiveContainer>
  
        {/* LEGEND */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          {data.map((item) => (
            <div
              key={item.name}
              className="flex items-center gap-2 text-gray-300"
            >
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[item.name] }}
              />
              <span className="capitalize">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  