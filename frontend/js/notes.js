// API Configuration
const API_CONFIG = {
    baseUrl: 'http://127.0.0.1:8000/api',
    endpoints: {
        notes: '/notes/',
    },
    headers: {
        'Content-Type': 'application/json'
    }
};

// State Management
let notesState = {
    notes: [],
    loading: false,
    error: null
};

// API Service
const apiService = {
    async fetchNotes() {
        try {
            const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.notes}`);
            if (!response.ok) throw new Error('Failed to fetch notes');
            const data = await response.json();
            return data.status === 'success' ? data.data : [];
        } catch (error) {
            console.error('Error fetching notes:', error);
            throw error;
        }
    },

    async deleteNote(noteId) {
        try {
            const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.notes}${noteId}/`, {
                method: 'DELETE',
                headers: API_CONFIG.headers
            });
            if (!response.ok) throw new Error('Failed to delete note');
            return true;
        } catch (error) {
            console.error('Error deleting note:', error);
            throw error;
        }
    }
};

// UI Components
const NotesUI = {
    createNoteCard(note) {
        const col = document.createElement('div');
        col.className = 'col-12 col-md-6 col-lg-4 mb-4 fade-in';

        col.innerHTML = `
            <div class="card h-100">
                <div class="card-header bg-${note.color} text-white d-flex justify-content-between align-items-center">
                    <h5 class="card-title mb-0 text-truncate pe-2">${this.escapeHtml(note.title)}</h5>
                    <div class="d-flex gap-2">
                        <button class="btn btn-link text-white edit-note p-1" data-id="${note.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-link text-white delete-note p-1" data-id="${note.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="card-body d-flex flex-column">
                    <p class="card-text flex-grow-1" style="max-height: 100px; overflow-y: auto;">${this.escapeHtml(note.content)}</p>
                    <div class="d-flex justify-content-between align-items-center mt-2">
                        <span class="badge bg-secondary">${this.escapeHtml(note.category)}</span>
                        <small class="text-muted">${new Date(note.created_at).toLocaleDateString()}</small>
                    </div>
                </div>
            </div>
        `;

        this.attachNoteEventListeners(col, note.id);
        return col;
    },

    attachNoteEventListeners(noteElement, noteId) {
        noteElement.querySelector('.edit-note').addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = `new-note.html?edit=${noteId}`;
        });

        noteElement.querySelector('.delete-note').addEventListener('click', (e) => {
            e.preventDefault();
            this.handleDeleteNote(noteId);
        });
    },

    async handleDeleteNote(noteId) {
        if (!confirm('Are you sure you want to delete this note?')) return;

        try {
            await apiService.deleteNote(noteId);
            showNotification('Note deleted successfully', 'success');
            await loadNotes();
        } catch (error) {
            showNotification('Failed to delete note', 'error');
        }
    },

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
};

// Notification System
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

// Main Functions
async function loadNotes() {
    const container = document.getElementById('notesContainer');
    if (!container) return;

    try {
        notesState.loading = true;
        container.innerHTML = '<div class="text-center w-100"><div class="spinner-border"></div></div>';

        const notes = await apiService.fetchNotes();
        notesState.notes = notes;
        
        container.innerHTML = '';
        notes.forEach(note => {
            container.appendChild(NotesUI.createNoteCard(note));
        });
    } catch (error) {
        showNotification('Failed to load notes', 'error');
        container.innerHTML = '<div class="alert alert-danger">Failed to load notes. Please try again later.</div>';
    } finally {
        notesState.loading = false;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadNotes();
});