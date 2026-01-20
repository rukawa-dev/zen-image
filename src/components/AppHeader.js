class AppHeader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <header class="h-[70px] bg-bg/80 backdrop-blur-md sticky top-0 z-50 border-b border-border flex items-center">
        <div class="max-w-custom mx-auto px-8 flex justify-between items-center w-full">
          <a href="/" class="text-2xl font-bold text-accent no-underline flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img src="src/assets/app-icon.png" alt="zen-image logo" class="w-8 h-8 rounded-lg shadow-md border border-border">
            zen-image
          </a>
        </div>
      </header>
    `;
  }
}
customElements.define('app-header', AppHeader);
