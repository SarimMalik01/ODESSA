import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    LabelList,
  } from "recharts";
  
  type UploadData = {
    month: string;
    count: number;
  };
  
  export default function UploadsBarChart({
    uploadsByMonth,
  }: {
    uploadsByMonth: Record<string, number>;
  }) {
    const data: UploadData[] = Object.entries(uploadsByMonth).map(
      ([month, count]) => ({
        month,
        count: Number(count),
      })
    );
  
    return (
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <XAxis
            dataKey="month"
            tick={{ fill: "#9ca3af", fontSize: 12 }}
          />
          <YAxis hide />
          <Tooltip />
  
          <Bar
            dataKey="count"
            fill="#7c3aed" // 🟣 purple
            radius={[6, 6, 0, 0]}
          >
            <LabelList
              dataKey="count"
              position="top"
              fill="#c4b5fd" // light purple
              fontSize={12}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }
  