/* ════════════════════════════════════════
   weather_forecast.js
   ════════════════════════════════════════ */

async function loadWeatherForecast(area) {
  try {
    const resp = await fetch(`${API_BASE}/weather-forecast?area=${encodeURIComponent(area)}`);
    const data = await resp.json();
    return data;
  } catch (err) {
      console.error(err);
  }
}
