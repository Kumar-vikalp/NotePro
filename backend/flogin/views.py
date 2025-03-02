import base64
import numpy as np
import cv2
from django.shortcuts import render
from django.core.files.base import ContentFile
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import User, UserImages
from .serializers import UserSerializer, UserImagesSerializer
import logging

# Set up logging
logger = logging.getLogger(__name__)

# Create a face recognizer
face_recognizer = cv2.face.LBPHFaceRecognizer_create()

# Create a face recognizer
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')


class RegisterUser(APIView):
    def post(self, request):
        logger.debug("Received POST request for registration")
        username = request.data.get('username')
        face_image_data = request.data.get('face_image')
        
        logger.debug(f"Received username: {username}")
        logger.debug(f"Received face image data: {face_image_data[:30]}...")  # Log part of the base64 string to verify it's being received

        try:
            # Check if username exists
            if User.objects.filter(username=username).exists():
                logger.debug("Username already exists")
                return Response({'status': 'error', 'message': 'Username already exists!'}, status=status.HTTP_400_BAD_REQUEST)

            # Decode base64 image
            face_image_data = base64.b64decode(face_image_data.split(",")[1])
            nparr = np.frombuffer(face_image_data, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            if img is None:
                logger.debug("Failed to decode the image")
                return Response({'status': 'error', 'message': 'Invalid image format!'}, status=status.HTTP_400_BAD_REQUEST)

            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

            # Detect faces
            faces = face_cascade.detectMultiScale(gray, scaleFactor=1.2, minNeighbors=5)
            if len(faces) == 0:
                logger.debug("No faces detected in the image")
                return Response({'status': 'error', 'message': 'No face detected!'}, status=status.HTTP_400_BAD_REQUEST)

            x, y, w, h = faces[0]
            face_region = gray[y:y + h, x:x + w]

            # Save user data
            user = User(username=username)
            user.save()

            # Convert the detected face to an image file format (jpg)
            face_image = cv2.imencode('.jpg', face_region)[1].tobytes()

            # Save the face image as a file using Django's ContentFile
            user_image = UserImages.objects.create(
                user=user,
                face_image=ContentFile(face_image, name=f"{username}_face.jpg")
            )

            logger.debug("User registered successfully")
            return Response({'status': 'success', 'message': 'User registered successfully!'}, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Error during registration: {e}")
            return Response({'status': 'error', 'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class LoginUser(APIView):
    def post(self, request):
        username = request.data.get('username')
        face_image_data = request.data.get('face_image')

        try:
            # Get user by username
            user = User.objects.get(username=username)
            user_image = UserImages.objects.get(user=user)

            # Decode the base64-encoded face image
            face_image_data = base64.b64decode(face_image_data.split(",")[1])
            nparr = np.frombuffer(face_image_data, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            if img is None:
                return Response({'status': 'error', 'message': 'Invalid image format!'}, status=status.HTTP_400_BAD_REQUEST)

            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

            # Detect face in uploaded image
            faces = face_cascade.detectMultiScale(gray, scaleFactor=1.2, minNeighbors=5)
            if len(faces) == 0:
                return Response({'status': 'error', 'message': 'No face detected!'}, status=status.HTTP_400_BAD_REQUEST)

            # Assuming only one face is detected
            x, y, w, h = faces[0]
            face_region = gray[y:y + h, x:x + w]

            # Load stored face image
            known_face = cv2.imdecode(np.frombuffer(user_image.face_image.read(), np.uint8), cv2.IMREAD_GRAYSCALE)

            # Train the recognizer with the stored face image (one for now)
            face_recognizer.train([known_face], np.array([0]))  # Training with only one image

            # Predict the face
            label, confidence = face_recognizer.predict(face_region)

            if confidence < 50:  # Lower confidence means a better match
                return Response({'status': 'success', 'message': 'Login successful!'}, status=status.HTTP_200_OK)
            else:
                return Response({'status': 'error', 'message': 'Face does not match!'}, status=status.HTTP_401_UNAUTHORIZED)

        except User.DoesNotExist:
            return Response({'status': 'error', 'message': 'User does not exist!'}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return Response({'status': 'error', 'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)