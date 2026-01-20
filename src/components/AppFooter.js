class AppFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <footer class="mt-auto py-12 border-t border-border/50 text-center text-text-secondary text-sm">
        <p class="opacity-70 mb-4">Copyright &copy; <a href="https://rukawa-dev.github.io/land-gate/" target="_blank" class="text-accent underline-offset-4 hover:underline transition-all">SOFT-LAND</a>. All rights reserved.</p>
        <div class="flex justify-center">
          <img src="https://hits.sh/rukawa-dev.github.io/zen-image.svg" alt="Hits" class="opacity-60 hover:opacity-100 transition-opacity">
        </div>
      </footer>
    `;
  }
}
customElements.define('app-footer', AppFooter);
