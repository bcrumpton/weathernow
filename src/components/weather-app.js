import './weather-search';

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

            this.state = {
                weather: {
                    name, 
                    country,
                    ...(admin1 ? { region: admin1 } : {}),
                    ...weatherData.current_weather
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
            ${weather ? `
                <div>
                    <p>${weather.name}${weather.region ? `, ${weather.region}` : ''}</p>
                    <p>${weather.temperature}&deg; C</p>
                </div>`: ''}
        `;
    }
}

window.customElements.define('weather-app', WeatherApp);