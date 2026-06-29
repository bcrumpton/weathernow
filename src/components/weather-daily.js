import { WEATHER_CODES } from "./weatherCodes";

class WeatherDaily extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.state = { loading: true, data: null };
  }

  connectedCallback() {
    window.addEventListener("weather-update", (e) => {
      this.state = { loading: false, data: e.detail.state.weather.daily };
      this.render();
    });
    window.addEventListener("unit-change", () => this.render());
    this.render();
  }

  render() {
    const { loading, data } = this.state;
    if (loading) {
      this.shadowRoot.innerHTML = `<p>No data available</p>`;
      return;
    }

    const dayAbbrev = (d) =>
      new Date(d + "T12:00:00").toLocaleDateString([], { weekday: "short" });
    const toTemp = (c) =>
      window.weatherUnit === "F" ? Math.round(c * 9/5 + 32) : Math.round(c);

    const cards = data
      .map(
        ({ time, wc, high, low }) => `
        <div class="daily-card">
          <p class="day">${dayAbbrev(time)}</p>
          <p class="icon">${WEATHER_CODES[wc]?.icon ?? "❓"}</p>
          <div class="temps">
            <span>${toTemp(high)}&deg;</span>
            <span class="low">${toTemp(low)}&deg;</span>
          </div>
        </div>
      `,
      )
      .join("");

    this.shadowRoot.innerHTML = `
      <style>
        h4 { margin: 0 0 0.75rem; }

        .daily-list {
          display: flex;
          gap: 0.75rem;
          overflow-x: auto;
        }

        .daily-card {
          flex: 1;
          min-width: 4.5rem;
          background: #302f4a;
          border: 1px solid #464646;
          border-radius: 1rem;
          padding: 0.75rem 0.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .day { font-size: 0.85rem; color: #d4d3d9; }
        .icon { font-size: 1.5rem; }

        .temps {
          width: 100%;
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
        }

        .low { color: #d4d3d9; }

        p { margin: 0; }
      </style>
      <h4>Daily Forecast</h4>
      <div class="daily-list">${cards}</div>
    `;
  }
}

window.customElements.define("weather-daily", WeatherDaily);
