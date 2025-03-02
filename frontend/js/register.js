// Get references to the video, canvas, and buttons
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const captureButton = document.getElementById('capture-button');
const registerForm = document.getElementById('register-form');
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
        messageDiv.innerText = "Please enable the camera.";
        return;
    }
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);  // Draw video frame to canvas
    capturedImage = canvas.toDataURL('image/jpeg'); // Convert captured image to base64 format
    messageDiv.innerText = "Face captured successfully!";
});

// Handle form submission
registerForm.onsubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission

    if (!capturedImage) {
        messageDiv.innerText = "Please capture your face first.";
        return;
    }

    // Create the form data, including the captured image
    const formData = new FormData(registerForm);
    formData.append('face_image', capturedImage); // Append the captured image (base64)

    // Send the form data to the API
    const response = await fetch('http://127.0.0.1:8000/api/register/', {
        method: 'POST',
        body: formData
    });

    const data = await response.json();
    messageDiv.innerText = data.message || 'Registration failed.';
};
