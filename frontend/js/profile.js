document.addEventListener('DOMContentLoaded', function() {
    // Retrieve username and similarity from localStorage
    const username = localStorage.getItem('username');
    const similarity = localStorage.getItem('similarity');
    
    // Get references to the elements where the data will be inserted
    const usernameElement = document.getElementById('username');
    const similarityElement = document.getElementById('similarity');

    // Check if the data exists and display it, otherwise show a fallback message
    if (username && similarity) {
        usernameElement.innerText = `${username}`;
        similarityElement.innerText = `${similarity}%`;
    } else {
        usernameElement.innerText = 'Username not available';
        similarityElement.innerText = 'Similarity not available';
    }
});
