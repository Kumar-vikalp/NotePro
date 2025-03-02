from django.urls import path
from .views import *

urlpatterns = [
    path('notes/', NoteView.as_view(), name='notes'),
    path('notes/<int:pk>/', NoteView.as_view(), name='note-detail'),  # for GET, PUT, PATCH, DELETE single note


]
