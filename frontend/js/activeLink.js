function setActiveLink() {
    const links = document.querySelectorAll('.sidebar-nav .nav-link');
    const currentPage = window.location.pathname.split('/').pop();

    links.forEach(link => {
        const linkPath = link.getAttribute('href').split('/').pop();
        if (currentPage === linkPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setActiveLink();
});