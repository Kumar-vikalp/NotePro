// script.js
document.addEventListener('DOMContentLoaded', () => {
    // Fetch notes when page loads
    fetchNotes();

    // Initialize Bootstrap tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
});

const API_URL = 'http://127.0.0.1:8000/api/notes/';

// Fetch all notes from API
async function fetchNotes() {
    try {
        const response = await fetch(API_URL);
        const result = await response.json();
        
        if (result.status === 'success') {
            renderNotes(result.data);
        }
    } catch (error) {
        console.error('Error fetching notes:', error);
        showAlert('Failed to load notes. Please try again.', 'danger');
    }
}

// Render notes to the DOM
function renderNotes(notes) {
    const container = document.getElementById('notesContainer');
    container.innerHTML = '';

    notes.forEach(note => {
        const noteCard = createNoteCard(note);
        container.appendChild(noteCard);
    });
}

// Create individual note card
function createNoteCard(note) {
    const col = document.createElement('div');
    col.className = 'col-12 col-md-6 col-lg-4 mb-4';

    const card = document.createElement('div');
    card.className = `card border-${note.color} h-100`;
    card.innerHTML = `
        <div class="card-header bg-${note.color} text-white">
            <h5 class="card-title mb-0">${note.title}</h5>
        </div>
        <div class="card-body">
            <p class="card-text" style="color: var(--text-color);">${note.content}</p>
            <div class="d-flex justify-content-between align-items-center">
                <span class="badge bg-secondary">${note.category}</span>
                <small class="text-muted">${new Date(note.created_at).toLocaleDateString()}</small>
            </div>
        </div>
        <div class="card-footer bg-transparent">
            <button class="btn btn-sm btn-outline-primary edit-btn" data-id="${note.id}">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${note.id}">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;

    // Add event listeners for edit/delete
    card.querySelector('.edit-btn').addEventListener('click', () => editNote(note.id));
    card.querySelector('.delete-btn').addEventListener('click', () => deleteNote(note.id));

    return col;
}

// Delete note function
async function deleteNote(noteId) {
    if (confirm('Are you sure you want to delete this note?')) {
        try {
            const response = await fetch(`${API_URL}${noteId}/`, {
                method: 'DELETE'
            });

            if (response.ok) {
                showAlert('Note deleted successfully!', 'success');
                fetchNotes(); // Refresh notes list
            }
        } catch (error) {
            console.error('Error deleting note:', error);
            showAlert('Failed to delete note.', 'danger');
        }
    }
}

// Edit note function (redirect to edit page)
function editNote(noteId) {
    window.location.href = `new-note.html?edit=${noteId}`;
}

// Show alert messages
function showAlert(message, type) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show fixed-top m-3`;
    alert.role = 'alert';
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    document.body.prepend(alert);
    setTimeout(() => alert.remove(), 3000);
}

// For new-note.js (handle form submissions)
if (document.getElementById('noteForm')) {
    document.getElementById('noteForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            title: document.getElementById('noteTitle').value,
            note_type: document.getElementById('noteType').value,
            category: document.getElementById('noteCategory').value,
            color: document.querySelector('.color-option.active').dataset.color,
            content: document.getElementById('noteContent').value
        };

        const isEdit = new URLSearchParams(window.location.search).has('edit');
        const noteId = new URLSearchParams(window.location.search).get('edit');

        try {
            const response = await fetch(
                isEdit ? `${API_URL}${noteId}/` : API_URL,
                {
                    method: isEdit ? 'PUT' : 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                }
            );

            if (response.ok) {
                showAlert(`Note ${isEdit ? 'updated' : 'created'} successfully!`, 'success');
                if (!isEdit) {
                    window.location.href = 'index.html'; // Redirect to home after creation
                }
            }
        } catch (error) {
            console.error('Error saving note:', error);
            showAlert('Failed to save note. Please try again.', 'danger');
        }
    });
}