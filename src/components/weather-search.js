
class WeatherSearch extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    connectedCallback() {
        this.render();
    }

    handleSubmit(e) {
        e.preventDefault();
        const input = this.shadowRoot.querySelector('input');
        const city = input.value.trim();
        if(!city) return

        this.dispatchEvent(
            new CustomEvent('city-search', {
                detail: { city },
                bubbles: true,
                composed: true
            })
        )
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
            </style>
            <form>
                <input type="search" placeholder="Search for a city, e.g. New York" />
                <input type="submit" value="Search" />
            </form>
        `;

        this.shadowRoot.querySelector('form').onsubmit = this.handleSubmit;
    }
}

window.customElements.define('weather-search', WeatherSearch);