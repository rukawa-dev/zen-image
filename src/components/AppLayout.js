import './AppHeader.js';
import './AppFooter.js';

class AppLayout extends HTMLElement {
  static resourcesInjected = false;

  constructor() {
    super();
  }

  injectHeadResources() {
    // 리소스는 이제 각 HTML 파일의 <head>에서 정적으로 관리됩니다.
    // 이는 로딩 순서 보장 및 FOUC 방지를 위함입니다.
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
