class WeatherDisplay extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._data = null;
    }

    set data(value) {
        this._data = value;
        this.render();;
    }

    get data() {
        return this._data;
    }

    render() {
        console.log('data', this._data);

        if(!this._data) {
            this.shadowRoot.innerHTML = `<p>No data available</p>`;
            return;
        }

        this.shadowRoot.innerHTML = `
            <style>
                p {
                    margin: 0;
                }

                .hero-card {
                    margin-top: 1rem;
                    background: #4658d9;
                    border-radius: .75rem;
                    padding: 1rem;
                    display: flex;
                    justify-content: space-between;
                    min-height: 286px;
                    align-items: center;
                }

                .hero-card__deg p {
                    font-size: 50px;
                }

                .hero-card__name {
                    font-size: 2rem;
                    font-weight: 500;
                }

                .hero-card__date {
                    color: #d4d3d9;
                }
            </style>
            <div class="hero-card">
                <div class="hero-card__place">
                    <p class="hero-card__name">${this._data.name}${this._data.region ? `, ${this._data.region}` : ''}</p>
                    <p class="hero-card__date">Tuesday, Aug 8th, 2025</p>
                </div>
                <div class="hero-card__deg">
                    <p>${this._data.weatherIcon} ${this._data.temperature}&deg; C</p>
                </div>
            </div>
        `;
    }
}

window.customElements.define('weather-display', WeatherDisplay);


