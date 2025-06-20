from fastapi import FastAPI
import pandas as pd
from statsmodels.tsa.statespace.sarimax import SARIMAX
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Update this if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load data
df = pd.read_csv("../air-traffic-landings-statistics.csv")

# Convert 'Activity Period' (YYYYMM) to datetime
df["Activity Period"] = df["Activity Period"].astype(str)
df["year"] = df["Activity Period"].str[:4].astype(int)
df["month"] = df["Activity Period"].str[4:].astype(int)
df["date"] = pd.to_datetime(df[["year", "month"]].assign(day=1))

# Aggregate landing count per month
df_monthly = df.groupby("date")["Landing Count"].sum().asfreq("MS")

# Train SARIMAX model for Landing Count
train_data = df_monthly.dropna()
model = SARIMAX(train_data, order=(1, 1, 1), seasonal_order=(1, 1, 1, 12))
results = model.fit()

@app.get("/forecast/{year}")
def get_yearly_forecast(year: int):
    """Return forecasted landing counts for all 12 months of the given year."""
    
    forecasts = {}
    
    try:
        for month in range(1, 13):  # Loop over all 12 months
            start_date = f"{year}-{month:02d}-01"
            forecast_value = results.get_prediction(start=start_date, end=start_date).predicted_mean.iloc[0]
            forecasts[f"{year}-{month:02d}"] = int(forecast_value)

        return {"year": year, "monthly_forecasts": forecasts}

    except IndexError:
        return {"error": "Forecast date out of range"}

@app.get("/monthly_counts/{month}")
def get_monthly_counts(month: int):
    """Return counts of categorical features for the specified month (random year between 2010-2018)."""
    year = 2005+month
    filtered_df = df[(df["year"] == year) & (df["month"] == month)]
    
    if filtered_df.empty:
        return {"error": f"No data available for {year}-{month:02d}"}
    
    counts = {
        "Operating Airline": filtered_df["Operating Airline"].value_counts().to_dict(),
        "GEO Summary": filtered_df["GEO Summary"].value_counts().to_dict(),
        "GEO Region": filtered_df["GEO Region"].value_counts().to_dict(),
        "Landing Aircraft Type": filtered_df["Landing Aircraft Type"].value_counts().to_dict()
    }
    
    return {
        "year": year,
        "month": month,
        "counts": counts
    }
