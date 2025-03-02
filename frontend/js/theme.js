// Theme Management
const ThemeManager = {
    THEME_KEY: 'app-theme',
    
    init() {
        this.themeToggle = document.getElementById('themeToggle');
        this.loadTheme();
        this.attachEventListeners();
    },

    loadTheme() {
        const savedTheme = localStorage.getItem(this.THEME_KEY) || 'light';
        this.applyTheme(savedTheme);
    },

    applyTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        this.updateThemeIcon(theme);
        localStorage.setItem(this.THEME_KEY, theme);
        
        // Dispatch custom event for other components
        window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
    },

    toggleTheme() {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
    },

    updateThemeIcon(theme) {
        if (!this.themeToggle) return;
        
        const icon = this.themeToggle.querySelector('i');
        if (icon) {
            icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        }
    },

    attachEventListeners() {
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Handle system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            const newTheme = e.matches ? 'dark' : 'light';
            this.applyTheme(newTheme);
        });
    }
};

// Initialize theme management
document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
});