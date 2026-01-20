class AppLayout extends HTMLElement {
  connectedCallback() {
    const title = this.getAttribute('page-title') || 'Image Tool';
    const showBack = this.getAttribute('show-back') !== 'false';
    const content = this.innerHTML;

    this.innerHTML = `
      <app-header></app-header>
      
      <main class="max-w-custom mx-auto px-8 flex-1 w-full">
        <div class="animate-fade-in py-8">
          <!-- Page Header -->
          <div class="flex items-center gap-4 mb-8">
            ${showBack ? `
              <a href="/"
                class="group flex items-center justify-center w-10 h-10 rounded-full bg-surface/40 backdrop-blur-md border border-border/50 text-accent hover:bg-accent hover:text-bg transition-all duration-300">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                  class="group-hover:-translate-x-0.5 transition-transform">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </a>
            ` : ''}
            <h2 class="text-3xl font-semibold">${title}</h2>
          </div>
          
          <div id="layout-content">
            ${content}
          </div>
        </div>
      </main>

      <app-footer></app-footer>
    `;
  }
}

customElements.define('app-layout', AppLayout);
