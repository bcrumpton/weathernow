class HeroCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
            
            </style>
            <div class="hero-card">
                <div class="hero-card__spacetime">
                    <h3>Nashville, TN</h3>
                    <p>Tuesday Aug 6th, 2025<p>
                </div>
                <div class="hero-card__temps">
                    <div class="hero-card__icon"></div>
                    <div class="hero-card__units"></div>
                <div>
            </div>
        `;
    }
}
window.customElements.define('hero-card', HeroCard);