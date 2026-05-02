/* ════════════════════════════════════════
   weather_forecast.js
   Handles: 7-day weather view.
   ════════════════════════════════════════ */

async function loadWeatherForecast() {
  const content = document.getElementById('weather-content');
  if(!content) return;

  content.innerHTML = '<div class="loader-ring"></div><p style="text-align:center">Fetching local forecast...</p>';

  try {
    const res = await fetch(`${API_BASE}/weather-forecast`);
    if(!res.ok) throw new Error('Failed to fetch weather');
    const data = await res.json();

    content.innerHTML = `
      <div style="background:#fff; border-radius:12px; padding:20px; border:1.5px solid var(--border);">
        <h3 style="margin-bottom:15px; font-weight:700;">Local Weather Forecast</h3>
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap:10px;">
          ${data.map(day => `
            <div style="background:#fafafa; border:1px solid #eee; border-radius:10px; padding:15px; text-align:center;">
              <div style="font-size:0.8rem; font-weight:600; color:#888; margin-bottom:8px;">${day.day}</div>
              <div style="font-size:1.8rem; margin-bottom:5px;">${getWeatherEmoji(day.condition)}</div>
              <div style="font-family:'Syne', sans-serif; font-weight:800; font-size:1.2rem; color:var(--soil);">${day.temp}°C</div>
              <div style="font-size:0.7rem; color:#555; margin-top:4px;">${day.condition}</div>
              <div style="font-size:0.7rem; color:var(--sky); font-weight:600; margin-top:8px;">💧 ${day.rain}% Rain</div>
            </div>
          `).join('')}
        </div>
        <div style="margin-top:20px; background:var(--sky-light); border:1px solid #b8dff0; padding:15px; border-radius:10px; display:flex; gap:12px; align-items:center;">
          <div style="font-size:1.5rem;">💡</div>
          <div style="font-size:0.85rem; color:#1a5d7d; line-height:1.6;">
            <strong>Expert Advice:</strong> High humidity expected on Thursday. This increases risk of Early Blight. Consider a preventive spray of <strong>Mancozeb</strong> if not sprayed recently.
          </div>
        </div>
      </div>
    `;

  } catch (err) {
    console.error(err);
    content.innerHTML = '<p class="error-text">Weather data unavailable.</p>';
  }
}

function getWeatherEmoji(cond) {
  if(cond.includes('Sunny')) return '☀️';
  if(cond.includes('Cloudy')) return '⛅';
  if(cond.includes('Rain')) return '🌧️';
  if(cond.includes('Storm')) return '⛈️';
  return '☁️';
}
