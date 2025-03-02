from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status
from rest_framework.filters import SearchFilter  # Import SearchFilter
from .models import Note
from .serializers import NoteSerializer
import logging

# Set up logging
logger = logging.getLogger(__name__)

class NoteView(generics.GenericAPIView):
    queryset = Note.objects.all()
    serializer_class = NoteSerializer
    filter_backends = [SearchFilter]  # Enable search filtering
    search_fields = ['title', 'content']  # Fields you want to search on (title and content)

    def get(self, request, pk=None):
        if pk:
            try:
                note = self.get_object()  # Gets note by pk
                serializer = self.get_serializer(note)
                return Response({'status': 'success', 'data': serializer.data}, status=status.HTTP_200_OK)
            except Note.DoesNotExist:
                return Response({'status': 'error', 'message': 'Note not found'}, status=status.HTTP_404_NOT_FOUND)
        else:
            notes = self.get_queryset()  # Get all notes, possibly filtered by search
            serializer = self.get_serializer(notes, many=True)
            return Response({'status': 'success', 'data': serializer.data}, status=status.HTTP_200_OK)

    def post(self, request):
        logger.debug("Received POST request for creating a new note")
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'status': 'success', 'message': 'Note created successfully!'}, status=status.HTTP_201_CREATED)
        return Response({'status': 'error', 'message': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk=None):
        try:
            note = self.get_object()  # Get note by pk
            serializer = self.get_serializer(note, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response({'status': 'success', 'message': 'Note updated successfully!'}, status=status.HTTP_200_OK)
            return Response({'status': 'error', 'message': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        except Note.DoesNotExist:
            return Response({'status': 'error', 'message': 'Note not found'}, status=status.HTTP_404_NOT_FOUND)

    def patch(self, request, pk=None):
        try:
            note = self.get_object()  # Get note by pk
            serializer = self.get_serializer(note, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({'status': 'success', 'message': 'Note partially updated successfully!'}, status=status.HTTP_200_OK)
            return Response({'status': 'error', 'message': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        except Note.DoesNotExist:
            return Response({'status': 'error', 'message': 'Note not found'}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk=None):
        try:
            note = self.get_object()  # Get note by pk
            note.delete()
            return Response({'status': 'success', 'message': 'Note deleted successfully!'}, status=status.HTTP_204_NO_CONTENT)
        except Note.DoesNotExist:
            return Response({'status': 'error', 'message': 'Note not found'}, status=status.HTTP_404_NOT_FOUND)
