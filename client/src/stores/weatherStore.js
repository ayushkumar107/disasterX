import { create } from 'zustand';

export const useWeatherStore = create((set, get) => ({
  weatherData: null,
  isLoading: false,
  error: null,
  isPanelOpen: false,

  setPanelOpen: (isOpen) => set({ isPanelOpen: isOpen }),
  togglePanel: () => set((state) => ({ isPanelOpen: !state.isPanelOpen })),

  fetchWeather: async (lat, lng) => {
    if (!lat || !lng) return;
    set({ isLoading: true, error: null });

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max&timezone=auto`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.current_weather) {
        const parsedCurrent = {
          temperature: Math.round(data.current_weather.temperature),
          windspeed: data.current_weather.windspeed,
          weathercode: data.current_weather.weathercode,
          isDay: data.current_weather.is_day === 1,
          condition: getWeatherCondition(data.current_weather.weathercode),
          icon: getWeatherIcon(data.current_weather.weathercode, data.current_weather.is_day === 1)
        };

        const dailyForecast = (data.daily?.time || []).map((dateStr, idx) => ({
          date: new Date(dateStr).toLocaleDateString(undefined, { weekday: 'short', month: 'numeric', day: 'numeric' }),
          maxTemp: Math.round(data.daily.temperature_2m_max[idx]),
          minTemp: Math.round(data.daily.temperature_2m_min[idx]),
          precipitation: data.daily.precipitation_sum[idx],
          maxWind: data.daily.windspeed_10m_max[idx],
          condition: getWeatherCondition(data.daily.weathercode[idx]),
          icon: getWeatherIcon(data.daily.weathercode[idx], true)
        }));

        set({
          weatherData: {
            current: parsedCurrent,
            daily: dailyForecast,
            latitude: lat,
            longitude: lng,
            timezone: data.timezone
          },
          isLoading: false
        });
      } else {
        set({ error: 'Failed to parse weather data', isLoading: false });
      }
    } catch (err) {
      console.error('Weather fetch error:', err);
      set({ error: 'Failed to fetch live weather telemetry', isLoading: false });
    }
  }
}));

function getWeatherCondition(code) {
  if (code === 0) return 'Clear Sky';
  if (code === 1 || code === 2 || code === 3) return 'Partly Cloudy';
  if (code === 45 || code === 48) return 'Foggy / Hazy';
  if (code >= 51 && code <= 57) return 'Light Drizzle';
  if (code >= 61 && code <= 67) return 'Rain Showers';
  if (code >= 71 && code <= 77) return 'Snowfall';
  if (code >= 80 && code <= 82) return 'Heavy Rain';
  if (code >= 85 && code <= 86) return 'Snow Storm';
  if (code >= 95 && code <= 99) return 'Thunderstorm';
  return 'Overcast';
}

function getWeatherIcon(code, isDay) {
  if (code === 0) return isDay ? '☀️' : '🌙';
  if (code <= 3) return isDay ? '⛅' : '☁️';
  if (code <= 48) return '🌫️';
  if (code <= 67) return '🌧️';
  if (code <= 77) return '❄️';
  if (code <= 82) return '🌧️';
  if (code >= 95) return '🌩️';
  return '☁️';
}
