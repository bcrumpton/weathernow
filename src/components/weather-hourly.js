import { WEATHER_CODES } from "./weatherCodes";

class WeatherHourly extends HTMLElement {
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
    const byDay = data.state.weather.hourly;
    const days = Object.keys(byDay);
    this.state = {
      loading: false,
      byDay,
      days,
      selectedDay: this.state.selectedDay ?? days[0],
    };
    this.render();
  }

  render() {
    const { loading, byDay, days, selectedDay } = this.state;
    if (loading) {
      this.shadowRoot.innerHTML = `<p>No data available</p>`;
      return;
    }

    const dayLabel = (d) =>
      new Date(d + "T12:00:00").toLocaleDateString([], { weekday: "long" });

    const options = days
      .map(
        (d) =>
          `<option value="${d}"${d === selectedDay ? " selected" : ""}>${dayLabel(d)}</option>`,
      )
      .join("");

    const toTemp = (c) =>
      window.weatherUnit === "F" ? Math.round(c * 9/5 + 32) : Math.round(c);

    const items = (byDay[selectedDay] ?? [])
      .map(
        ({ time, temp, wc }) => `
      <div class="weather-hourly__item">
        <p>${new Date(time + ":00").toLocaleTimeString([], { hour: "numeric" })}&emsp;<span>${WEATHER_CODES[wc].icon}</span></p>
        <p>${toTemp(temp)}&deg;</p>
      </div>
    `,
      )
      .join("");

    this.shadowRoot.innerHTML = `
      <style>
        .weather-hourly__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .weather-hourly__list {
          display: flex;
          gap: 1rem;
          overflow-x: auto;
          flex-direction: column;
        }

        .weather-hourly__item {
          display: flex;
          justify-content: space-between;
        }

        .weather-hourly select {
          border: 1px solid #464646;
          color: white;
          background: #302F4a;
          height: 40px;
          border-radius: 8px;
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          width: 100%;
          padding: 10px 35px 10px 10px;
          font-size: 16px;
          background-image: url('data:image/svg+xml;utf8,<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 9L12 15L18 9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke="white"/></svg>');
          background-repeat: no-repeat;
          background-position: right 10px center;
          background-size: 20px;
          cursor: pointer;
        }
      </style>
      <div class="weather-hourly">
        <div class="weather-hourly__header">
          <h4>Hourly Forecast</h4>
          <div class="weather-hourly__select">
            <select>${options}</select>
          </div>
        </div>
        <div class="weather-hourly__list">${items}</div>
      </div>
    `;

    this.shadowRoot.querySelector("select").addEventListener("change", (e) => {
      this.state = { ...this.state, selectedDay: e.target.value };
      this.render();
    });
  }
}

window.customElements.define("weather-hourly", WeatherHourly);
