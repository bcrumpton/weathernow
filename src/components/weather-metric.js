class WeatherMetric extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.state = { loading: true, data: null };
  }

  connectedCallback() {
    window.addEventListener("weather-update", (e) => this.updateFromWeather(e.detail));
    window.addEventListener("unit-change", () => this.render());
    this.render();
  }

  updateFromWeather(data) {
    const { metrics } = data.state.weather;
    const type = this.getAttribute("type");
    const key = type.replace(/\s+/g, "").toLowerCase();
    const metric = metrics[key];
    this.state = { loading: false, data: metric };
    this.render();
  }

  render() {
    const { loading, data } = this.state;
    if (loading) {
      this.shadowRoot.innerHTML = `<p>No data available</p>`;
      return;
    }

    this.shadowRoot.innerHTML = `
      <style>
        .weather-metric {
            border-radius: 1rem;
            background: #302f4a;
            padding: 1.5rem;
            border: 1px solid #464646;
        }

        .weather-metric__label {
            color: #d4d3d9;
        }

        .weather-metric__value {
            font-size: 1.875rem;
        }

        p {
            margin: 0;
        }
      </style>
      <div class="weather-metric">
        <p class="weather-metric__label">${data.label}</p>
        <p class="weather-metric__value">${data.isTemp ? `${window.weatherUnit === "F" ? Math.round(data.value * 9/5 + 32) : Math.round(data.value)}°${window.weatherUnit ?? "C"}` : data.value}</p>
      </div>
    `;
  }
}

window.customElements.define("weather-metric", WeatherMetric);
