import { useState, useEffect } from "react";
import InputForm from "./components/InputForm";
import ForecastChart from "./components/ForecastChart";
import MonthlyInsights from "./components/MonthlyInsights";

function App() {
  const [forecastData, setForecastData] = useState(null);
  const [monthly_forecasts, setMonthly_forecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    console.log("Updated forecastData in useEffect:", forecastData);
  }, [forecastData]);

  // Function to handle bar click and fetch monthly insights
  const handleBarClick = async (month) => {
    setMonthly_forecast(null);
    if (!month) return;
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`http://127.0.0.1:8000/monthly_counts/${month}`);
      const data = await response.json();

      if (data.error) {
        setError(data.error);
        setMonthly_forecast(null);
      } else {
        console.log(data);
        setMonthly_forecast(data);
      }
    } catch (err) {
      setError("Failed to fetch data. Check server connection.");
      setMonthly_forecast(null);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-200 p-6">
      <h1 className="text-2xl font-bold mb-6">Air Traffic Forecast</h1>

      <div className="w-full max-w-lg mb-8 text-center">
        <h2 className="text-lg font-semibold mb-2">Enter Year to Forecast</h2>
        <p className="text-gray-600 mb-4">
          Select a year to generate a monthly air traffic forecast.
        </p>
        <InputForm setForecastData={setForecastData} />
      </div>


      {forecastData && (
        <div className="mb-8 w-[95%] text-center ">
          <h2 className="text-lg font-semibold mb-2">Monthly Forecast Data</h2>
          <p className="text-gray-600 mb-4">
            The chart below displays forecasted landing counts for each month of the selected year.
            Click on a bar to see detailed insights for that month.
          </p>
          <ForecastChart forecastData={forecastData} onBarClick={handleBarClick} />
        </div>
      )}

      {monthly_forecasts && (
        <div className="w-full mt-8 text-center">
          <h2 className="text-lg font-semibold mb-2">Detailed Insights for Selected Month</h2>
          <p className="text-gray-600 mb-4">
            Breakdown of air traffic data, including airline counts, geographic summaries,
            and landing aircraft types.
          </p>
          <MonthlyInsights data={monthly_forecasts} loading={loading} />
        </div>
      )}

      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
}

export default App;
