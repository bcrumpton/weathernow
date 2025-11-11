class WeatherMetric extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.state = {loading: true, data: null };
    }

    connectedCallback() {
        window.addEventListener('weather-update', (e) => {
            const data = e.detail
            this.updateFromWeather(data)
        })

        this.render();
    }

    updateFromWeather(data) {
        const { metrics } = data.state.weather;
        const type = this.getAttribute('type');
        const key = type.replace(/\s+/g, '').toLowerCase();
        const metric = metrics[key];
        this.state = { loading: false, data: metric }
        this.render();
    }

    render() {
        const {loading, data} = this.state;
        if(loading) {
            this.shadowRoot.innerHTML = `<p>No data available</p>`;
            return;
        }

        this.shadowRoot.innerHTML = `
            <style>
                .weather-metric {
                    border-radius: 1rem;
                    background: #302f4a;
                    padding: 1.5rem;
                }

                .weather-metric__label {
                    color: #d4d3d9;
                }

                .weather-metric__value {
                    font-size: 2rem;
                }
                
                p {
                    margin: 0;
                }
            </style>
            <div class="weather-metric">
                <p class="weather-metric__label">${data.label}</p>
                <p class="weather-metric__value">${data.value}</p>
            </div>
        `;
    }
}

window.customElements.define('weather-metric', WeatherMetric);


