class WeatherHero extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.state = { loading: true, data: null };
  }

  connectedCallback() {
    window.addEventListener("weather-update", (e) =>
      this.updateFromWeather(e.detail),
    );
    window.addEventListener("unit-change", () => this.render());
    this.render();
  }

  updateFromWeather(data) {
    const { hero } = data.state.weather;
    this.state = { loading: false, data: hero };
    this.render();
  }

  render() {
    const { loading, data } = this.state;

    if (!data) {
      this.shadowRoot.innerHTML = `<p>No data available</p>`;
      return;
    }

    this.shadowRoot.innerHTML = `
            <style>
                p {
                    margin: 0;
                }

                .hero-card {
                    background: #4658d9;
                    border-radius: .75rem;
                    padding: 1rem 2rem;
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
                    <p class="hero-card__name">${data.name}${data.region ? `, ${data.region}` : ""}</p>
                    <p class="hero-card__date">Tuesday, Aug 8th, 2025</p>
                </div>
                <div class="hero-card__deg">
                    <p>${data.weatherIcon} ${window.weatherUnit === "F" ? Math.round((data.temperature * 9) / 5 + 32) : Math.round(data.temperature)}&deg; ${window.weatherUnit ?? "C"}</p>
                </div>
            </div>
        `;
  }
}

window.customElements.define("weather-hero", WeatherHero);
