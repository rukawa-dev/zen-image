import './AppHeader.js';
import './AppFooter.js';

class AppLayout extends HTMLElement {
  static resourcesInjected = false;

  constructor() {
    super();
    this.injectHeadResources();
  }

  injectHeadResources() {
    if (AppLayout.resourcesInjected) return;

    const head = document.head;

    // 1. Fonts
    if (!head.querySelector('link[href*="SCoreDream.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://webfontworld.github.io/score/SCoreDream.css';
      head.appendChild(link);
    }

    // 2. Favicon
    if (!head.querySelector('link[rel="icon"]')) {
      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/png';
      link.href = 'src/assets/app-icon.png';
      head.appendChild(link);
    }

    // 3. Main CSS
    if (!head.querySelector('link[href*="main.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'src/styles/main.css';
      head.appendChild(link);
    }

    // 4. Tailwind CSS (CDN)
    if (!window.tailwind && !head.querySelector('script[src*="tailwindcss.com"]')) {
      const script = document.createElement('script');
      script.src = 'https://cdn.tailwindcss.com';
      head.appendChild(script);
    }

    // 5. Tailwind Config
    if (!head.querySelector('script[src*="tailwind.config.js"]')) {
      const script = document.createElement('script');
      script.src = 'src/config/tailwind.config.js';
      head.appendChild(script);
    }

    AppLayout.resourcesInjected = true;
  }

  connectedCallback() {
    const title = this.getAttribute('page-title') || 'Image Tool';
    const showBack = this.getAttribute('show-back') !== 'false';

    // 1. 기존 컨텐츠 보존 (DocumentFragment 사용)
    const contentFragment = document.createDocumentFragment();
    while (this.firstChild) {
      contentFragment.appendChild(this.firstChild);
    }

    // 2. 레이아웃 템플릿 생성
    const layoutWrapper = document.createElement('div');
    layoutWrapper.className = 'flex flex-col min-h-screen';
    layoutWrapper.innerHTML = `
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
          
          <div id="layout-content"></div>
        </div>
      </main>

      <app-footer></app-footer>
    `;

    // 3. 레이아웃 주입 및 컨텐츠 복구
    this.appendChild(layoutWrapper);
    const contentContainer = this.querySelector('#layout-content');
    contentContainer.appendChild(contentFragment);
  }
}

customElements.define('app-layout', AppLayout);
