import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from statsmodels.tsa.statespace.sarimax import SARIMAX
from sklearn.metrics import mean_squared_error, mean_absolute_error
import warnings
warnings.filterwarnings("ignore")


def months_ahead(from_date, to_date):
    """
    Calculate how many months from 'from_date' to 'to_date'.
    Assumes both dates are month-start dates.
    """
    return (to_date.year - from_date.year) * 12 + (to_date.month - from_date.month)


# =========================================================
# 1) LOAD DATA AND PREPROCESS
# =========================================================
df = pd.read_csv("air-traffic-landings-statistics.csv")

# Convert Activity Period (e.g. 201809 -> "2018-09-01")
df['Activity Period'] = df['Activity Period'].astype(str)
df['year'] = df['Activity Period'].str[:4].astype(int)
df['month'] = df['Activity Period'].str[4:].astype(int)
df['date'] = pd.to_datetime(df[['year', 'month']].assign(day=1))  # always day=1
df.sort_values('date', inplace=True)

# =========================================================
# 2) AGGREGATE MONTHLY TOTALS (for numeric forecasting)
# =========================================================
df_monthly = df.groupby('date', as_index=False).agg({
    'Landing Count': 'sum',
    'Total Landed Weight': 'sum'
})
df_monthly.set_index('date', inplace=True)
df_monthly = df_monthly.asfreq('MS')  # 'MS' = Month Start

# =========================================================
# 3) TRAIN SARIMAX MODELS (USING THE FULL DATASET)
# =========================================================
train_data_lc = df_monthly['Landing Count']
train_data_tlw = df_monthly['Total Landed Weight']

# ---- SARIMAX for Landing Count ----
model_lc = SARIMAX(
    train_data_lc,
    order=(1, 1, 1),              # (p,d,q) -- tune these for your data
    seasonal_order=(1, 1, 1, 12),   # (P,D,Q,m) with m=12 for monthly seasonality
    enforce_stationarity=False,
    enforce_invertibility=False
)
results_lc = model_lc.fit(disp=False)

# ---- SARIMAX for Total Landed Weight ----
model_tlw = SARIMAX(
    train_data_tlw,
    order=(1, 1, 1),
    seasonal_order=(1, 1, 1, 12),
    enforce_stationarity=False,
    enforce_invertibility=False
)
results_tlw = model_tlw.fit(disp=False)

# =========================================================
# 4) FORECAST FOR A FUTURE DATE (e.g., 2025-02-01)
# =========================================================
future_date_str = '2025-02-01'
future_date = pd.to_datetime(future_date_str)
last_date_in_data = df_monthly.index.max()
steps = months_ahead(last_date_in_data, future_date)
if steps <= 0:
    raise ValueError("Future date is not after the dataset's last date!")

# Forecast Landing Count
forecast_lc = results_lc.get_forecast(steps=steps)
pred_lc_series = forecast_lc.predicted_mean
predicted_lc = pred_lc_series.loc[future_date]

# Forecast Total Landed Weight
forecast_tlw = results_tlw.get_forecast(steps=steps)
pred_tlw_series = forecast_tlw.predicted_mean
predicted_tlw = pred_tlw_series.loc[future_date]

print(f"\n=== Forecast for {future_date_str} ===")
print(f"Landing Count: {predicted_lc:.0f}")
print(f"Total Landed Weight: {predicted_tlw:.0f}")

# =========================================================
# 5) DISTRIBUTE FORECASTED TOTALS BACK TO CATEGORIES
#    (Example: Operating Airline -> Aircraft Body Type)
# =========================================================
# Top-down approach:
#   Step A: Distribute total among airlines using proportions from the last month.
#   Step B: Within each airline, distribute among body types.
df_latest_month = df[df['date'] == last_date_in_data]
if df_latest_month.empty:
    raise ValueError(f"No data found for last_date_in_data={last_date_in_data}.")

# Step A: Proportion by Operating Airline
airline_sums = df_latest_month.groupby('Operating Airline')['Landing Count'].sum()
airline_proportions = airline_sums / airline_sums.sum()
airline_lc_forecast = airline_proportions * predicted_lc
airline_tlw_forecast = airline_proportions * predicted_tlw

# Step B: Within each airline, distribute by Aircraft Body Type
df_latest_month_airline_body = (
    df_latest_month.groupby(['Operating Airline', 'Aircraft Body Type'])['Landing Count']
    .sum()
)

predicted_rows = []
for airline, airline_share_lc in airline_lc_forecast.items():
    airline_share_tlw = airline_tlw_forecast.get(airline, 0.0)
    # Get breakdown of body types for this airline (if available)
    if airline in df_latest_month_airline_body.index.levels[0]:
        sub = df_latest_month_airline_body.loc[airline]
    else:
        sub = None

    if sub is not None and isinstance(sub, pd.Series) and not sub.empty:
        body_type_props = sub / sub.sum()  # proportion by Aircraft Body Type
        for btype, prop_val in body_type_props.items():
            final_lc = airline_share_lc * prop_val
            final_tlw = airline_share_tlw * prop_val
            predicted_rows.append({
                'Activity Period': future_date.strftime('%Y%m'),
                'date': future_date,
                'Operating Airline': airline,
                'Aircraft Body Type': btype,
                'Landing Count': final_lc,
                'Total Landed Weight': final_tlw
            })
    else:
        predicted_rows.append({
            'Activity Period': future_date.strftime('%Y%m'),
            'date': future_date,
            'Operating Airline': airline,
            'Aircraft Body Type': None,
            'Landing Count': airline_share_lc,
            'Total Landed Weight': airline_share_tlw
        })

predicted_df = pd.DataFrame(predicted_rows)
print("\n=== Final Predicted Rows for 2025-02 (Airline x Body Type) ===")
print(predicted_df.head(20))  # Show first 20 rows

# =========================================================
# 6) ERROR CALCULATION AND VISUALIZATION
#    (For the aggregated Landing Count time series)
# =========================================================
# Calculate in-sample predictions and errors for Landing Count.
in_sample_pred_lc = results_lc.get_prediction(start=train_data_lc.index[0],
                                               end=train_data_lc.index[-1]).predicted_mean
actual_lc = train_data_lc

rmse_lc = np.sqrt(mean_squared_error(actual_lc, in_sample_pred_lc))
mae_lc = mean_absolute_error(actual_lc, in_sample_pred_lc)
print(f"\n--- In-Sample Error Metrics for Landing Count ---")
print(f"RMSE: {rmse_lc:.2f}")
print(f"MAE: {mae_lc:.2f}")

# Create a continuous time series that combines in-sample predictions and forecast.
predicted_full_lc = pd.concat([in_sample_pred_lc, pred_lc_series])

plt.figure(figsize=(12, 6))
plt.plot(train_data_lc.index, train_data_lc, label='Actual Landing Count', color='blue')
plt.plot(in_sample_pred_lc.index, in_sample_pred_lc, label='Fitted (In-Sample)', color='red', alpha=0.7)
plt.plot(pred_lc_series.index, pred_lc_series, label='Forecast', color='green', linestyle='--', linewidth=2)
plt.title(f"Landing Count Forecast\nIn-Sample RMSE: {rmse_lc:.2f}, MAE: {mae_lc:.2f}")
plt.xlabel("Date")
plt.ylabel("Landing Count")
plt.legend()
plt.grid(True)
plt.show()
