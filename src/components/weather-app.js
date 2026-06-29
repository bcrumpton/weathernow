import "./weather-search";
import "./weather-hero";
import "./weather-metric";
import { WEATHER_CODES } from "./weatherCodes.js";

class WeatherApp extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.state = { weather: null, loading: false, error: null };
    this.handleSearch = this.handleSearch.bind(this);
  }

  connectedCallback() {
    this.render();
    document.addEventListener("city-search", this.handleSearch);
  }

  async handleSearch(event) {
    const { city } = event.detail;
    const { lat, lon } = event.detail;

    this.state = { weather: null, loading: true, error: null };
    this.render();

    try {
      let location;
      if (lat && lon) {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
          { headers: { "Accept-Language": "en" } },
        );
        const data = await res.json();
        location = {
          latitude: lat,
          longitude: lon,
          name:
            data.address.city ||
            data.address.town ||
            data.address.village ||
            data.address.county,
          country: data.address.country,
          admin1: data.address.state,
        };
      } else {
        const geo = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`,
        );
        const geoData = await geo.json();
        location = geoData.results?.[0];
      }
      if (!location) throw new Error(`City ${city} not found`);

      const { latitude, longitude, name, country, admin1 } = location;
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=weathercode,apparent_temperature,relative_humidity_2m,precipitation,windspeed_10m&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`,
      );
      const weatherData = await weatherRes.json();
      const nowHour = new Date().getHours();
      const allHourly = weatherData.hourly.time.map((time, i) => ({
        time,
        temp: weatherData.hourly.apparent_temperature[i],
        wc: weatherData.hourly.weathercode[i],
      }));

      const uniqueDays = [
        ...new Set(allHourly.map((h) => h.time.split("T")[0])),
      ];
      const hourlyData = {};
      uniqueDays.forEach((day) => {
        const start = allHourly.findIndex(
          (h) =>
            h.time.startsWith(day) && parseInt(h.time.split("T")[1]) >= nowHour,
        );
        if (start !== -1) hourlyData[day] = allHourly.slice(start, start + 8);
      });

      this.state = {
        weather: {
          ...weatherData.current_weather,
          hero: {
            weatherIcon:
              WEATHER_CODES[weatherData.current_weather.weathercode]?.icon ||
              "❓",
            weatherText:
              WEATHER_CODES[weatherData.current_weather.weathercode]?.text ||
              "Unknown",
            time: weatherData.current_weather.time,
            temperature: weatherData.current_weather.temperature,
            name,
            country,
            ...(admin1 ? { region: admin1 } : {}),
          },
          metrics: {
            feelslike: {
              label: "Feels Like",
              value: weatherData.hourly.apparent_temperature[0],
              isTemp: true,
            },
            precipitation: {
              label: "Precipitation",
              value: `${weatherData.hourly.precipitation[0]} ${weatherData.hourly_units.precipitation}`,
            },
            humidity: {
              label: "Humidity",
              value: `${weatherData.hourly.relative_humidity_2m[0]}${weatherData.hourly_units.relative_humidity_2m}`,
            },
            windspeed: {
              label: "Wind Speed",
              value: weatherData.current_weather.windspeed,
            },
          },
          hourly: hourlyData,
          daily: weatherData.daily.time.map((time, i) => ({
            time,
            wc: weatherData.daily.weathercode[i],
            high: weatherData.daily.temperature_2m_max[i],
            low: weatherData.daily.temperature_2m_min[i],
          })),
        },
        loading: false,
        error: null,
      };

      window.dispatchEvent(
        new CustomEvent("weather-update", {
          detail: { state: this.state },
          bubbles: true,
          composed: true,
        }),
      );
    } catch (err) {
      this.state = { weather: null, loading: false, error: err.message };
    }

    this.render();
  }

  render() {
    const { loading, error, weather } = this.state;
    this.shadowRoot.innerHTML = `
      <style>
      </style>
      <weather-search></weather-search>
    `;
  }
}

window.customElements.define("weather-app", WeatherApp);
