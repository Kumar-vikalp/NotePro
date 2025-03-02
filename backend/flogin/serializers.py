from rest_framework import serializers
from .models import User, UserImages

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']

class UserImagesSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserImages
        fields = ['id', 'user', 'face_image']