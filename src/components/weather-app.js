import './weather-search';
import './weather-hero';
import './weather-metric';

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

            // console.log(geoData);
            
            const location = geoData.results?.[0];
            if(!location) throw new Error(`City ${city} not found`);

            const { latitude, longitude, name, country, admin1 } = location;
            const weatherRes = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=apparent_temperature,relative_humidity_2m,precipitation,windspeed_10m`
            );
            const weatherData = await weatherRes.json();

            // console.log(weatherData)

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
                    ...weatherData.current_weather,
                    hero: {
                        weatherIcon: WEATHER_CODES[weatherData.current_weather.weathercode]?.icon || "❓",
                        weatherText: WEATHER_CODES[weatherData.current_weather.weathercode]?.text || "Unknown",
                        time: weatherData.current_weather.time,
                        temperature: weatherData.current_weather.temperature,
                        name,
                        country,
                        ...(admin1 ? { region: admin1 } : {})
                    },
                    metrics: {
                        feelslike: { 
                            label: "Feels Like", 
                            value: `${weatherData.hourly.apparent_temperature[0]} ${weatherData.hourly_units.apparent_temperature}` 
                        },
                        precipitation: { 
                            label: "Precipitation", 
                            value:  `${weatherData.hourly.precipitation[0]} ${weatherData.hourly_units.precipitation}` 
                        },
                        humidity: { 
                            label: "Humidity", 
                            value: `${weatherData.hourly.relative_humidity_2m[0]}${weatherData.hourly_units.relative_humidity_2m}` 
                        },
                        windspeed: { 
                            label: "Wind Speed", 
                            value: weatherData.current_weather.windspeed 
                        }
                    }
                },
                loading: false,
                error: null
            }

            window.dispatchEvent(
                new CustomEvent('weather-update', {
                    detail: { state: this.state },
                    bubbles: true,
                    composed: true
                })
            )

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
        `;
    }
}

window.customElements.define('weather-app', WeatherApp);