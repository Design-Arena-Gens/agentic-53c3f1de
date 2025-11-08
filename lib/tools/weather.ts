interface Coordinates { lat: number; lon: number }

async function geocode(place: string): Promise<Coordinates | null> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(place)}&count=1&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  const rec = data.results?.[0];
  if (!rec) return null;
  return { lat: rec.latitude, lon: rec.longitude };
}

export async function toolWeather(place: string): Promise<string> {
  const coords = await geocode(place);
  if (!coords) return `Could not find location: ${place}`;
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,weather_code,wind_speed_10m&hourly=temperature_2m&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) return `Weather fetch failed (${res.status})`;
  const data = await res.json();
  const cur = data.current || {};
  const t = cur.temperature_2m;
  const wind = cur.wind_speed_10m;
  return `Weather for ${place}\n\nTemperature: ${t}?C\nWind: ${wind} m/s`;
}
