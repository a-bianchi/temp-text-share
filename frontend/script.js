// DOM Elements
const textForm = document.getElementById('textForm');
const contentTextarea = document.getElementById('content');
const charCount = document.getElementById('charCount');
const shareModal = document.getElementById('shareModal');
const shareLink = document.getElementById('shareLink');

// API Configuration
const API_BASE_URL = 'http://192.168.88.252:8010'; // Backend API URL

// Real-time character counter and validation
contentTextarea.addEventListener('input', function() {
    const count = this.value.length;
    charCount.textContent = count;
    
    // Get validation elements
    const minError = document.getElementById('minError');
    const maxError = document.getElementById('maxError');
    
    // Hide all errors initially
    minError.style.display = 'none';
    maxError.style.display = 'none';
    
    // Validate minimum length
    if (count < 1) {
        minError.style.display = 'flex';
        charCount.style.color = '#dc3545';
    }
    // Validate maximum length
    else if (count > 10000) {
        maxError.style.display = 'flex';
        charCount.style.color = '#dc3545';
    }
    // Change color based on length
    else if (count > 8000) {
        charCount.style.color = '#ffc107';
    } else {
        charCount.style.color = '#666';
    }
});

// Form handling
textForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const content = formData.get('content').trim();
    const expiration = formData.get('expiration');
    
    // Validations
    if (!content) {
        showError(window.i18n ? window.i18n.t('contentRequired') : 'Content is required');
        return;
    }
    
    if (content.length < 1) {
        showError(window.i18n ? window.i18n.t('minCharacters') : 'Minimum 1 character required');
        return;
    }
    
    if (content.length > 10000) {
        showError(window.i18n ? window.i18n.t('textTooLong') : 'Text is too long. Maximum 10,000 characters.');
        return;
    }
    
    // Show loading state
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="btn-icon">⏳</span> Sending...';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch(`${API_BASE_URL}/text`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content: content,
                ttl: parseInt(expiration)
            })
        });
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Show modal with link
        const shareUrl = `${window.location.origin}/view.html?id=${data.id}`;
        shareLink.value = shareUrl;
        showModal();
        
        // Clear form
        clearForm();
        
    } catch (error) {
        console.error('Error sending text:', error);
        showError('Error sending text. Please try again.');
    } finally {
        // Restore button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
});

// Function to clear form
function clearForm() {
    textForm.reset();
    charCount.textContent = '0';
    charCount.style.color = '#666';
    
    // Clear validation messages
    const minError = document.getElementById('minError');
    const maxError = document.getElementById('maxError');
    if (minError) minError.style.display = 'none';
    if (maxError) maxError.style.display = 'none';
}

// Function to show errors
function showError(message) {
    // Create temporary error notification
    const notification = document.createElement('div');
    notification.className = 'notification error';
    notification.innerHTML = `
        <img src="image/ahahah.webp" alt="Error" class="notification-error-image">
        <span class="notification-text">${message}</span>
    `;
    
    // Apply error styles
    notification.style.background = '#dc3545';
    notification.style.transform = 'translateX(400px)';
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Hide after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 5000);
}

// Modal functions
function showModal() {
    shareModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    shareModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Close modal when clicking outside
shareModal.addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
});

// Close modal with Escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && shareModal.style.display === 'block') {
        closeModal();
    }
});

// Function to copy link
async function copyLink() {
    try {
        await navigator.clipboard.writeText(shareLink.value);
        showNotification('Link copied to clipboard');
    } catch (error) {
        console.error('Error copying:', error);
        // Fallback for browsers that don't support clipboard API
        shareLink.select();
        shareLink.setSelectionRange(0, 99999);
        document.execCommand('copy');
        showNotification('Link copied to clipboard');
    }
}

// Function to show notifications
function showNotification(message) {
    const notification = document.getElementById('copyNotification');
    const textElement = notification.querySelector('.notification-text');
    
    textElement.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Real-time input validation
contentTextarea.addEventListener('paste', function(e) {
    // Limit pasted content size
    setTimeout(() => {
        if (this.value.length > 50000) {
            this.value = this.value.substring(0, 50000);
            showError('Text has been truncated to 50,000 characters');
        }
    }, 100);
});

// Textarea auto-resize
contentTextarea.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 400) + 'px';
});

// Function to generate unique ID (fallback)
function generateId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Function to format TTL values for display
function formatTTLValue(minutes) {
    if (minutes === 1) return '1 minute';
    if (minutes === 15) return '15 minutes';
    if (minutes === 60) return '1 hour';
    if (minutes === 1440) return '24 hours';
    return `${minutes} minutes`;
}

// Function to format dates
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Function to calculate remaining time
function getTimeRemaining(expirationDate) {
    const now = new Date();
    const expiration = new Date(expirationDate);
    const diff = expiration - now;
    
    if (diff <= 0) {
        return 'Expired';
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
        return `${days} day${days > 1 ? 's' : ''}`;
    } else if (hours > 0) {
        return `${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
        return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
}

// Initialization
document.addEventListener('DOMContentLoaded', function() {
    // Focus on textarea when page loads
    contentTextarea.focus();
    
    // Check if there's saved data in localStorage
    const savedContent = localStorage.getItem('draftContent');
    
    if (savedContent) {
        contentTextarea.value = savedContent;
        charCount.textContent = savedContent.length;
    }
    
    // Auto-save draft
    contentTextarea.addEventListener('input', function() {
        localStorage.setItem('draftContent', this.value);
    });
    
    // Clear draft when successfully sent
    textForm.addEventListener('submit', function() {
        localStorage.removeItem('draftContent');
    });
}); 