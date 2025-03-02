from django.db import models
from django.contrib.auth.models import User

class UserImages(models.Model):
    # Link to the user who uploaded the image
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    # Store the face image file, uploaded to 'user_faces/' directory
    face_image = models.ImageField(upload_to='user_faces/')

    # Timestamp of when the image was uploaded
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username}'s face image"
