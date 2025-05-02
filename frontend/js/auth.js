document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");

    const loginNav = document.getElementById("loginNav");
    const registerNav = document.getElementById("registerNav");
    const logoutNav = document.getElementById("logoutNav");
    const logoutBtn = document.getElementById("logoutBtn");
    const profileNav = document.getElementById("profileNav");
    const profileBtn = document.getElementById("profileBtn");

    if (token) {
        // User is logged in
        loginNav.style.display = "none";
        registerNav.style.display = "none";
        logoutNav.classList.remove("d-none");
        profileNav.classList.remove("d-none");

        // Attach the logout event to the logout button
        logoutBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            // First, attempt to log out on the backend
            try {
                await fetch("http://127.0.0.1:8000/api/logout/", {
                    method: "POST",
                    headers: {
                        "Authorization": `Token ${token}`,
                    }
                });
                // After backend logout, remove the token and other data from localStorage
                localStorage.removeItem("token");
                localStorage.removeItem("username");
                localStorage.removeItem("similarity");

                // Optionally, redirect to login page
                window.location.href = "login.html";
            } catch (error) {
                console.error('Logout failed:', error);
                alert('There was an error logging you out.');
            }
        });
    } else {
        // Not logged in
        loginNav.style.display = "block";
        registerNav.style.display = "block";
        logoutNav.classList.add("d-none");
        profileNav.classList.add("d-none");

    }
});
