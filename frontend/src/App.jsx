import { useState, useEffect } from "react";
import InputForm from "./components/InputForm";
import ForecastChart from "./components/ForecastChart";

function App() {
  const [forecastData, setForecastData] = useState(null);

  useEffect(() => {
    console.log("Updated forecastData in useEffect:", forecastData);
  }, [forecastData]);

  const handleBarClick = (data) => {
    alert(`Clicked on ${data.date}, Forecast: ${data.count}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-200 p-6">
      <h1 className="text-2xl font-bold mb-6">Air Traffic Forecast</h1>
      <InputForm onForecastFetch={setForecastData} />
      <ForecastChart forecastData={forecastData} onBarClick={handleBarClick} />
    </div>
  );
}

export default App;
