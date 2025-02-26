import { useState, useEffect } from "react";
import InputForm from "./components/InputForm";
import ForecastChart from "./components/ForecastChart";

function App() {
  const [forecastData, setForecastData] = useState(null);
  useEffect(() => {
    console.log("Updated forecastData:", forecastData);
  }, [forecastData]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-200 p-6">
      <h1 className="text-2xl font-bold mb-6">Air Traffic Forecast</h1>
      <InputForm setForecastData={setForecastData} />
      <ForecastChart forecastData={forecastData} />
    </div>
  );
}

export default App;
