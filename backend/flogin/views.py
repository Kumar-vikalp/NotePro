import base64
import numpy as np
import io  # ✅ Correct import
import face_recognition
from django.core.files.base import ContentFile
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.authtoken.models import Token
from PIL import Image  # Import Pillow to handle image format conversion
from .models import User, UserImages
from .serializers import UserSerializer, UserImagesSerializer
import logging
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
import time

# Set up logging
logger = logging.getLogger(__name__)

class RegisterUser(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        logger.debug("Received POST request for registration")
        serializer = UserSerializer(data=request.data)
        
        if not serializer.is_valid():
            logger.debug(f"Invalid user data: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        username = request.data.get('username')
        face_image_data = request.data.get('face_image')
        
        if not face_image_data:
            return Response({'status': 'error', 'message': 'Face image is required'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        logger.debug(f"Processing registration for username: {username}")

        try:
            # Check if username exists
            if User.objects.filter(username=username).exists():
                logger.debug("Username already exists")
                return Response(
                    {'status': 'error', 'message': 'Username already exists!'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Process the base64 image
            if "," in face_image_data:
                face_image_data = face_image_data.split(",")[1]
            
            # Decode base64 image
            image_bytes = base64.b64decode(face_image_data)

            # Load image using PIL
            image = Image.open(io.BytesIO(image_bytes))

            # Convert image to RGB if it isn't already in that mode
            logger.debug(f"Image mode before conversion: {image.mode}")
            if image.mode != 'RGB':
                image = image.convert('RGB')
            logger.debug(f"Image mode after conversion: {image.mode}")

            # Convert the image to a numpy array for face_recognition
            img = np.array(image)

            # Now you can use face_recognition on the image
            img = face_recognition.load_image_file(io.BytesIO(image_bytes))

            # Detect faces
            face_locations = face_recognition.face_locations(img)
            
            if len(face_locations) == 0:
                logger.debug("No faces detected in the image")
                return Response(
                    {'status': 'error', 'message': 'No face detected!'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get face encodings
            face_encodings = face_recognition.face_encodings(img, face_locations)
            
            if len(face_encodings) == 0:
                logger.debug("Could not extract face features")
                return Response(
                    {'status': 'error', 'message': 'Could not extract face features!'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Save user data - using the serializer
            user = serializer.save()
            
            # Save the face image
            user_image = UserImages.objects.create(
                user=user,
                face_image=ContentFile(image_bytes, name=f"{username}_face.jpg")
            )
            
            # Create auth token for the user
            token, created = Token.objects.get_or_create(user=user)

            logger.debug("User registered successfully")
            return Response({
                'status': 'success',
                'message': 'User registered successfully!',
                'token': token.key
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Error during registration: {e}")
            return Response(
                {'status': 'error', 'message': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class LoginUser(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        username = request.data.get('username')
        face_image_data = request.data.get('face_image')
        
        if not username or not face_image_data:
            return Response(
                {'status': 'error', 'message': 'Username and face image are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Get user by username
            try:
                user = User.objects.get(username=username)
                user_image = UserImages.objects.get(user=user)
            except User.DoesNotExist:
                return Response(
                    {'status': 'error', 'message': 'User does not exist!'},
                    status=status.HTTP_404_NOT_FOUND
                )
            except UserImages.DoesNotExist:
                return Response(
                    {'status': 'error', 'message': 'User face image not found!'},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Process the base64 image
            if "," in face_image_data:
                face_image_data = face_image_data.split(",")[1]
                
            # Decode the base64-encoded face image
            image_bytes = base64.b64decode(face_image_data)
            
            # Load uploaded image
            nparr = np.frombuffer(image_bytes, np.uint8)
            uploaded_img = face_recognition.load_image_file(io.BytesIO(nparr))

            
            # Detect faces in uploaded image
            face_locations = face_recognition.face_locations(uploaded_img)
            
            if len(face_locations) == 0:
                return Response(
                    {'status': 'error', 'message': 'No face detected in the uploaded image!'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get face encodings from the uploaded image
            uploaded_face_encodings = face_recognition.face_encodings(uploaded_img, face_locations)
            
            if len(uploaded_face_encodings) == 0:
                return Response(
                    {'status': 'error', 'message': 'Could not extract face features from the uploaded image!'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Load stored face image
            stored_img = face_recognition.load_image_file(user_image.face_image.path)
            stored_face_locations = face_recognition.face_locations(stored_img)
            
            if len(stored_face_locations) == 0:
                return Response(
                    {'status': 'error', 'message': 'No face detected in the stored image!'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
                
            stored_face_encodings = face_recognition.face_encodings(stored_img, stored_face_locations)
            
            if len(stored_face_encodings) == 0:
                return Response(
                    {'status': 'error', 'message': 'Could not extract face features from the stored image!'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            # Compare faces
            match = face_recognition.compare_faces(
                [stored_face_encodings[0]], 
                uploaded_face_encodings[0],
                tolerance=0.6  # Adjust tolerance as needed
            )
            
            # Calculate face distance (lower means more similar)
            face_distance = face_recognition.face_distance(
                [stored_face_encodings[0]], 
                uploaded_face_encodings[0]
            )[0]
            
            logger.debug(f"Face match: {match[0]}, distance: {face_distance}")

            if match[0]:
                # Get or create auth token
                token, created = Token.objects.get_or_create(user=user)
                
                return Response({
                    'status': 'success',
                    'message': 'Login successful!',
                    'token': token.key,
                    'username': user.username,
                    'similarity': round((1 - face_distance) * 100, 2),
                }, status=status.HTTP_200_OK)
                
            else:
                return Response({
                    'status': 'error',
                    'message': 'Face does not match!',
                    'similarity': round((1 - face_distance) * 100, 2)  # Percentage similarity
                }, status=status.HTTP_401_UNAUTHORIZED)

        except Exception as e:
            logger.error(f"Error during login: {e}")
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class LogoutUser(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        start_time = time.time()

        try:
            request.user.auth_token.delete()  # Deletes the token
            end_time = time.time()
            duration = end_time - start_time
            logger.debug(f"Logout request processed in {duration} seconds")

            return Response({'status': 'success', 'message': 'Logged out successfully.'}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error during logout: {e}")
            return Response({'status': 'error', 'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)