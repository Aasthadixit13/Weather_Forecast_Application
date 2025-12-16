
function analyzeForecast(forecasts) {
  const temps = forecasts.map((f) => f.main.temp);
  const humidity = forecasts.map((f) => f.main.humidity);
  const rain = forecasts.map((f) => (f.pop || 0) * 100);

  return {
    avgTemp: (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1),
    maxTemp: Math.max(...temps).toFixed(1),
    minTemp: Math.min(...temps).toFixed(1),
    temps,
    humidity,
    rain,
  };
}

