class AppFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <footer class="mt-16 py-12 border-t border-border/50 text-center text-text-secondary text-sm">
        <p class="opacity-70">Copyright &copy; <a href="https://rukawa-dev.github.io/land-gate/" target="_blank" class="text-accent underline-offset-4 hover:underline transition-all">SOFT-LAND</a>. All rights reserved.</p>
      </footer>
    `;
  }
}
customElements.define('app-footer', AppFooter);
