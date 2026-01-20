class AppFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <footer class="mt-16 py-8 border-t border-border text-center text-text-secondary text-sm">
        <p>Copyright &copy; <a href="https://rukawa-dev.github.io/land-gate/" target="_blank" class="text-text-secondary font-semibold hover:text-accent transition-colors">SOFT-LAND</a>. All rights reserved.</p>
      </footer>
    `;
  }
}
customElements.define('app-footer', AppFooter);
