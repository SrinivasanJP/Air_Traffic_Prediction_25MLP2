import React from "react";
import { BarChart, Bar, PieChart, Pie, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";

const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#ffbb28", "#d0ed57", "#a4de6c"];

const MonthlyInsights = ({ data,loading }) => {
  const formatData = (obj) => Object.entries(obj).map(([name, value]) => ({ name, value }));

  return (
    <div className="p-6">
 
      <div className="flex flex-col justify-center items-center">
        {/* Operating Airline Bar Chart */}
        <ChartCard title="Operating Airline">
          <BarChartComponent data={formatData(data.counts["Operating Airline"])} />
        </ChartCard>
<div className=" flex w-[102%] gap-3 items-stretch">
{/* GEO Summary Pie Chart */}
<ChartCard title="GEO Summary">
          <PieChartComponent data={formatData(data.counts["GEO Summary"])} />
        </ChartCard>
         {/* Landing Aircraft Type Pie Chart */}
         <ChartCard title="Landing Aircraft Type">
          <PieChartComponent data={formatData(data.counts["Landing Aircraft Type"])} />
        </ChartCard>
</div>
        

        {/* GEO Region Bar Chart */}
        <ChartCard title="GEO Region">
          <BarChartComponent data={formatData(data.counts["GEO Region"])} />
        </ChartCard>

       
      </div>
    </div>
  );
};

const ChartCard = ({ title, children }) => (
  <div className="bg-white shadow-md rounded-lg p-4 w-[102%] mb-2 ">
    <h2 className="text-xl font-semibold mb-2">{title}</h2>
    <div className="w-full h-64">{children}</div>
  </div>
);

const BarChartComponent = ({ data }) => (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
      <YAxis />
      <Tooltip />
   
      <Bar dataKey="value" fill="#8884d8">
        {data.map((_, index) => (
          <Cell key={index} fill={colors[index % colors.length]} />
        ))}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
);

const PieChartComponent = ({ data }) => (
  <ResponsiveContainer width="100%" height="100%">
    <PieChart>
      <Tooltip />
      <Legend />
      <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={40} fill="#82ca9d" >
        {data.map((_, index) => (
          <Cell key={index} fill={colors[index % colors.length]} />
        ))}
      </Pie>
    </PieChart>
  </ResponsiveContainer>
);

export default MonthlyInsights;
