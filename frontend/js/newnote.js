// API Configuration
const API_CONFIG = {
    baseUrl: 'http://127.0.0.1:8000/api/notes/',
    endpoints: {
        notes: '/notes/',
    },
    headers: {
        'Content-Type': 'application/json'
    }
};

document.addEventListener('DOMContentLoaded', async function() {
    const noteForm = document.getElementById('noteForm');
    const colorOptions = document.querySelectorAll('.color-option');
    const isEdit = new URLSearchParams(window.location.search).has('edit');
    const noteId = new URLSearchParams(window.location.search).get('edit');

    // Set form title based on mode
    document.getElementById('noteFormTitle').textContent = isEdit ? 'Edit Note' : 'New Note';

    // Set default color
    colorOptions[0].classList.add('active');

    // Color selection
    colorOptions.forEach(button => {
        button.addEventListener('click', () => {
            colorOptions.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });

    // Load note data if editing
    if (isEdit && noteId) {
        try {
            const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.notes}${noteId}/`);
            if (!response.ok) throw new Error('Failed to fetch note');
            
            const note = await response.json();
            if (note.status === 'success' && note.data) {
                populateForm(note.data);
            }
        } catch (error) {
            console.error('Error loading note:', error);
            showNotification('Failed to load note data', 'danger');
        }
    }

    // Form submission
    noteForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        const formData = {
            title: document.getElementById('noteTitle').value,
            note_type: document.getElementById('noteType').value,
            category: document.getElementById('noteCategory').value,
            color: document.querySelector('.color-option.active').dataset.color,
            content: document.getElementById('noteContent').value
        };

        try {
            const response = await fetch(
                isEdit ? `${API_CONFIG.baseUrl}${noteId}/` : `${API_CONFIG.baseUrl}`,
                {
                    method: isEdit ? 'PUT' : 'POST',
                    headers: API_CONFIG.headers,
                    body: JSON.stringify(formData)
                }
            );

            if (response.ok) {
                showNotification(`Note ${isEdit ? 'updated' : 'created'} successfully!`, 'success');
                window.location.href = 'index.html';
            } else {
                throw new Error('Failed to save note');
            }
        } catch (error) {
            console.error('Error saving note:', error);
            showNotification('Failed to save note. Please try again.', 'danger');
        }
    });
});

function populateForm(note) {
    document.getElementById('noteTitle').value = note.title || '';
    document.getElementById('noteType').value = note.note_type || 'public';
    document.getElementById('noteCategory').value = note.category || 'personal';
    document.getElementById('noteContent').value = note.content || '';

    // Set color
    const colorButtons = document.querySelectorAll('.color-option');
    colorButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.color === note.color) {
            btn.classList.add('active');
        }
    });
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show fixed-top m-3`;
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.prepend(notification);
    setTimeout(() => notification.remove(), 3000);
}