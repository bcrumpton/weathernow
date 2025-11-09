import './weather-search';
import './weather-display';

class WeatherApp extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.state = { weather: null, loading: false, error: null };
        this.handleSearch = this.handleSearch.bind(this);
    }

    connectedCallback() {
        this.render();
        this.shadowRoot.addEventListener('city-search', this.handleSearch)
    }

    async handleSearch(event) {
        const city = event.detail.city;
        this.state = {weather: null, loading: true, error: null};
        this.render();

        try {
            const geo = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`);
            const geoData = await geo.json();

            console.log(geoData);
            
            const location = geoData.results?.[0];
            if(!location) throw new Error(`City ${city} not found`);

            const { latitude, longitude, name, country, admin1 } = location;
            const weatherRes = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
            );
            const weatherData = await weatherRes.json();

            const WEATHER_CODES = {
                0:  { text: "Clear sky", icon: "☀️" },
                1:  { text: "Mainly clear", icon: "🌤️" },
                2:  { text: "Partly cloudy", icon: "⛅" },
                3:  { text: "Overcast", icon: "☁️" },
                45: { text: "Fog", icon: "🌫️" },
                48: { text: "Depositing rime fog", icon: "🌫️" },
                51: { text: "Light drizzle", icon: "🌦️" },
                53: { text: "Moderate drizzle", icon: "🌦️" },
                55: { text: "Dense drizzle", icon: "🌧️" },
                56: { text: "Light freezing drizzle", icon: "🌧️❄️" },
                57: { text: "Dense freezing drizzle", icon: "🌧️❄️" },
                61: { text: "Slight rain", icon: "🌧️" },
                63: { text: "Moderate rain", icon: "🌧️" },
                65: { text: "Heavy rain", icon: "🌧️" },
                66: { text: "Light freezing rain", icon: "🌧️❄️" },
                67: { text: "Heavy freezing rain", icon: "🌧️❄️" },
                71: { text: "Slight snow fall", icon: "🌨️" },
                73: { text: "Moderate snow fall", icon: "🌨️" },
                75: { text: "Heavy snow fall", icon: "❄️" },
                77: { text: "Snow grains", icon: "❄️" },
                80: { text: "Slight rain showers", icon: "🌦️" },
                81: { text: "Moderate rain showers", icon: "🌦️" },
                82: { text: "Violent rain showers", icon: "⛈️" },
                85: { text: "Slight snow showers", icon: "🌨️" },
                86: { text: "Heavy snow showers", icon: "❄️" },
                95: { text: "Thunderstorm", icon: "⛈️" },
                96: { text: "Thunderstorm with slight hail", icon: "⛈️❄️" },
                99: { text: "Thunderstorm with heavy hail", icon: "⛈️❄️" }
            };

            this.state = {
                weather: {
                    name, 
                    country,
                    ...(admin1 ? { region: admin1 } : {}),
                    ...weatherData.current_weather,
                    weatherIcon: WEATHER_CODES[weatherData.current_weather.weathercode]?.icon || "❓",
                    weatherText: WEATHER_CODES[weatherData.current_weather.weathercode]?.text || "Unknown"
                },
                loading: false,
                error: null
            }
        } catch (err) {
            this.state = { weather: null, loading: false, error: err.message }
        }

        this.render();
    }

    render() {
        const { loading, error, weather } = this.state;
        console.log(loading, error, weather);
        this.shadowRoot.innerHTML = `
            <style>
            </style>
            <weather-search></weather-search>
            ${loading? `<p>Loading...` : ''}
            ${error ? `<p>Error: ${error}</p>` : ''}
            ${weather ? `<weather-display></weather-display>`: ''}
        `;

        const display = this.shadowRoot.querySelector('weather-display');
        if(display && weather) {
            display.data = weather;
        }
    }
}

window.customElements.define('weather-app', WeatherApp);