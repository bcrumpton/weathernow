class WeatherSearch extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  connectedCallback() {
    this.render();
  }

  handleSubmit(e) {
    e.preventDefault();
    const input = this.shadowRoot.querySelector("input");
    const city = input.value.trim();
    if (!city) return;

    this.dispatchEvent(
      new CustomEvent("city-search", {
        detail: { city },
        bubbles: true,
        composed: true,
      }),
    );
  }

  render() {
    this.shadowRoot.innerHTML = `
            <style>
                form {
                    width: 100%;
                    display: flex;
                    margin-top: 1rem;
                    gap: 1rem;
                }

                input[type="search"] {
                    background-color: #302F4a;
                    border-radius: .75rem;
                    color: white;
                    border: 1px solid #464646;
                    padding: 1rem;
                    margin-right: 1rem;
                    height: 56px;
                    font-size: 1rem;
                    font-family: "Special Gothic", sans-serif;
                    font-weight: 500;
                    font-optical-sizing: auto;
                    width: 90%;
                }

                input[type="search"]::placeholder {
                    color: white;
                }

                input[type="submit"] {
                    border: 1px solid #717fe5;
                    padding: 1rem;
                    background: #4658D9;
                    color: white;
                    border-radius: .75rem;
                    font-size: 1rem;
                    font-family: "Special Gothic", sans-serif;
                    font-weight: 500;
                    font-optical-sizing: auto;
                    width: 20%;
                }
            </style>
            <form>
                <input type="search" placeholder="Search for a city, e.g. New York" />
                <input type="submit" value="Search" />
            </form>
        `;

    this.shadowRoot.querySelector("form").onsubmit = this.handleSubmit;
  }
}

window.customElements.define("weather-search", WeatherSearch);
