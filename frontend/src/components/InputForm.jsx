import { useState } from "react";
import ForecastChart from "./ForecastChart";

const ForecastApp = ({setForecastData}) => {
  const [year, setYear] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchForecast = async () => {
    setForecastData(null);
    if (!year) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`http://127.0.0.1:8000/forecast/${year}`);
      const data = await response.json();

      if (data.error) {
        setError(data.error);
        setForecastData(null);
      } else {
        console.log(data.monthly_forecasts);
        setForecastData(data.monthly_forecasts);
      }
    } catch (err) {
      setError("Failed to fetch data. Check server connection.");
      setForecastData(null);
    }

    setLoading(false);
  };

  return (
    <div className="w-[98%] mx-auto p-6 bg-gray-100 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-center mb-4">Monthly Forecast</h1>

      <div className="flex items-center justify-center gap-4 mb-4">
        <input
          type="number"
          required
          min={2024}
          value={year}
          onChange={(e) => setYear(e.target.value)}
          placeholder="Enter Year (e.g., 2026)"
          className="p-2 border rounded-md"
        />
        <button
          onClick={fetchForecast}
          className="px-4 py-2 bg-blue-500 text-white rounded-md"
        >
          Get Forecast
        </button>
      </div>

      {loading && <p className="text-center text-gray-500">Loading...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}
    </div>
  );
};

export default ForecastApp;
