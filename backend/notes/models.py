from django.db import models

class Note(models.Model):
    NOTE_TYPES = [
        ('public', 'Public'),
        ('archive', 'Archive'),
    ]

    CATEGORIES = [
        ('personal', 'Personal'),
        ('work', 'Work'),
        ('study', 'Study'),
    ]

    COLORS = [
        ('primary', 'Primary'),
        ('success', 'Success'),
        ('danger', 'Danger'),
        ('warning', 'Warning'),
    ]

    title = models.CharField(max_length=255)
    note_type = models.CharField(max_length=10, choices=NOTE_TYPES)
    category = models.CharField(max_length=10, choices=CATEGORIES)
    color = models.CharField(max_length=10, choices=COLORS)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title