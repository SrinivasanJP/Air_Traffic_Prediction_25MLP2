import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const ForecastChart = ({ forecastData }) => {
  if (!forecastData || Object.keys(forecastData).length === 0) {
    return <p className="text-center text-gray-500">No data available.</p>;
  }

  const formattedData = Object.entries(forecastData).map(([date, value]) => ({
    date,
    count: value,
  }));

  return (
    <div className="p-4 w-[98%] m-10 bg-white rounded-lg shadow-md ">
      <h2 className="text-xl font-bold mb-4 text-center">Monthly Forecast</h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={formattedData}>
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ForecastChart;
