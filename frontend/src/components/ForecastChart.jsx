import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const ForecastChart = ({ forecastData, onBarClick }) => {
  if (!forecastData || Object.keys(forecastData).length === 0) {
    return <p className="text-center text-gray-500">No data available.</p>;
  }

  const formattedData = Object.entries(forecastData).map(([date, value]) => ({
    date,
    count: value,
  }));

  const handleBarClick = (data, index) => {
    console.log("Clicked on:", data,index);
    if (onBarClick) {
      onBarClick(index+1); // Call the function passed from the parent
    }
  };

  return (
    <div className="p-4 w-[98%] m-10 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-center">Monthly Forecast</h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={formattedData}>
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#3b82f6" onClick={handleBarClick} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ForecastChart;
