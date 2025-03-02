// Sidebar Management
const SidebarManager = {
    init() {
        this.sidebar = document.getElementById('sidebar');
        this.toggleButton = document.getElementById('sidebarToggle');
        this.closeButton = document.getElementById('closeSidebar');
        
        this.attachEventListeners();
        this.handleResize();
    },

    attachEventListeners() {
        // Toggle sidebar
        if (this.toggleButton) {
            this.toggleButton.addEventListener('click', () => this.toggleSidebar());
        }

        // Close sidebar
        if (this.closeButton) {
            this.closeButton.addEventListener('click', () => this.closeSidebar());
        }

        // Close sidebar when clicking outside
        document.addEventListener('click', (e) => this.handleOutsideClick(e));

        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());

        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.sidebar?.classList.contains('show')) {
                this.closeSidebar();
            }
        });
    },

    toggleSidebar() {
        if (!this.sidebar) return;
        this.sidebar.classList.toggle('show');
    },

    closeSidebar() {
        if (!this.sidebar) return;
        this.sidebar.classList.remove('show');
    },

    handleOutsideClick(event) {
        if (!this.sidebar || !this.toggleButton) return;
        
        const isClickInside = this.sidebar.contains(event.target) || 
                            this.toggleButton.contains(event.target);
        
        if (!isClickInside && this.sidebar.classList.contains('show')) {
            this.closeSidebar();
        }
    },

    handleResize() {
        if (window.innerWidth > 991.98) {
            this.closeSidebar();
        }
    }
};

// Initialize sidebar management
document.addEventListener('DOMContentLoaded', () => {
    SidebarManager.init();
});