const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const captureButton = document.getElementById('capture-button');
const loginForm = document.getElementById('login-form');
const messageDiv = document.getElementById('message');

let capturedImage = null;

// Access the camera and start the video stream
navigator.mediaDevices.getUserMedia({ video: true })
    .then((stream) => {
        video.srcObject = stream;
    })
    .catch((err) => {
        console.log('Error accessing camera: ' + err);
        messageDiv.innerText = 'Camera not accessible. Please check permissions.';
    });

// Capture image from the video stream
captureButton.addEventListener('click', () => {
    if (!video.srcObject) {
        messageDiv.innerText = "Camera is not available.";
        return;
    }

    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);  // Draw video frame to canvas
    capturedImage = canvas.toDataURL('image/jpeg'); // Convert captured image to base64 format

    console.log("Captured image:", capturedImage);  // Log the captured image for debugging

    messageDiv.innerText = "Face captured successfully! Ready to login.";
});

// Handle form submission
loginForm.onsubmit = async (e) => {
    e.preventDefault();

    if (!capturedImage) {
        messageDiv.innerText = "Please capture your face first.";
        return;
    }

    const requestData = {
        username: document.getElementById('username').value,
        face_image: capturedImage
    };

    try {
        const response = await fetch('http://127.0.0.1:8000/api/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',  // Ensure the backend gets JSON
            },
            body: JSON.stringify(requestData)
        });

        // Log the raw response for debugging
        console.log('Response status:', response.status);
        const data = await response.json();

        if (response.ok) {
            if (data.status === 'success') {
                messageDiv.innerText = data.message || 'Login successful!';
                localStorage.setItem('token', data.token);
                // Optionally store the username and similarity if returned from API
                localStorage.setItem('username', data.username);
                localStorage.setItem('similarity', data.similarity);

                window.location.href = '/frontend/index.html'; // Redirect after login
            } else {
                messageDiv.innerText = data.message || 'Login failed. Please try again.';
            }
        } else {
            // Handle 401 Unauthorized error explicitly
            messageDiv.innerText = data.message || 'Login failed: Unauthorized access. Please check your credentials.';
        }
    } catch (error) {
        console.error('Error:', error);
        messageDiv.innerText = 'An error occurred while processing your login.';
    }
};
