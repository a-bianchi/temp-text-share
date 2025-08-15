// DOM Elements
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const textContent = document.getElementById('textContent');
const textBody = document.getElementById('textBody');
const createdAt = document.getElementById('createdAt');
const expiresAt = document.getElementById('expiresAt');
const errorMessage = document.getElementById('errorMessage');
const revealBtn = document.getElementById('revealBtn');

// Text obfuscation variables
let isTextObfuscated = true;
let revealTimeout = null;
let originalText = '';

// API Configuration
const API_BASE_URL = 'http://localhost:8009'; // Change according to your backend

// Get text ID from URL
function getTextId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Function to load text
async function loadText() {
    const textId = getTextId();
    
    if (!textId) {
        showError('No valid text ID provided');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/text/${textId}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Text does not exist or has expired');
            } else {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
        }
        
        const data = await response.json();
        displayText(data);
        
    } catch (error) {
        console.error('Error loading text:', error);
        showError(error.message || 'Error loading text');
    }
}

// Function to display text
function displayText(textData) {
    // Hide loading and error states
    loadingState.style.display = 'none';
    errorState.style.display = 'none';
    
    // Show text content
    textContent.style.display = 'block';
    
    // Set page title
    document.title = 'Shared Text';
    
    // Store original text and configure content
    originalText = textData.content;
    textBody.value = originalText;
    
    // Initially obfuscate the text
    obfuscateText();
    
    // Configure metadata
    if (textData.createdAt) {
        createdAt.textContent = `Created: ${formatDate(textData.createdAt)}`;
    } else {
        createdAt.textContent = 'Created: Unknown';
    }
    
    // Handle TTL (Time To Live)
    if (textData.ttl !== undefined) {
        if (textData.ttl === 0) {
            expiresAt.textContent = 'Expired';
            // Hide text content for already expired texts
            textContent.style.display = 'none';
            showError('This text has expired');
            return; // Exit early for expired texts
        } else {
            // Calculate remaining time based on creation timestamp and TTL
            const calculateRemainingTime = () => {
                if (!textData.createdAt) {
                    // Fallback: use current time if no timestamp provided
                    return textData.ttl * 60;
                }
                
                const createdAt = new Date(textData.createdAt);
                const now = new Date();
                const elapsedMinutes = (now - createdAt) / (1000 * 60);
                const remainingMinutes = textData.ttl - elapsedMinutes;
                
                return Math.max(0, Math.floor(remainingMinutes * 60)); // Convert to seconds
            };
            
            let remainingSeconds = calculateRemainingTime();
            
            // If already expired, show error immediately
            if (remainingSeconds <= 0) {
                expiresAt.textContent = 'Expired';
                textContent.style.display = 'none';
                showError('This text has expired');
                return;
            }
            
            // Update countdown every second
            const updateCountdown = () => {
                if (remainingSeconds <= 0) {
                    expiresAt.textContent = 'Expired';
                    
                    // Hide text content and show error immediately
                    textContent.style.display = 'none';
                    showError('This text has expired');
                    
                    // Reload page after 2 seconds to show expired message
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                    
                    return;
                }
                
                const minutes = Math.floor(remainingSeconds / 60);
                const seconds = remainingSeconds % 60;
                
                if (minutes > 0) {
                    expiresAt.textContent = `Expires in: ${minutes}:${seconds.toString().padStart(2, '0')}`;
                } else {
                    expiresAt.textContent = `Expires in: ${seconds}s`;
                }
                
                remainingSeconds--;
            };
            
            // Initial update
            updateCountdown();
            
            // Update every second
            const countdownInterval = setInterval(() => {
                updateCountdown();
                if (remainingSeconds <= 0) {
                    clearInterval(countdownInterval);
                }
            }, 1000);
        }
    } else {
        expiresAt.textContent = 'Never expires';
    }
    
    // Configure meta tags for sharing
    setupMetaTags(textData);
}

// Function to show errors
function showError(message) {
    loadingState.style.display = 'none';
    errorState.style.display = 'block';
    textContent.style.display = 'none';
    
    errorMessage.textContent = message;
}

// Function to copy text
async function copyText() {
    // Always copy the original text, not the displayed text
    const textToCopy = originalText || textBody.value;
    
    try {
        await navigator.clipboard.writeText(textToCopy);
        showNotification(window.i18n ? window.i18n.t('textCopied') : 'Text copied to clipboard');
    } catch (error) {
        console.error('Error copying:', error);
        // Fallback for browsers that don't support clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification(window.i18n ? window.i18n.t('textCopied') : 'Text copied to clipboard');
    }
}

// Function to share text
async function shareText() {
    const textData = {
        text: originalText || textBody.value,
        url: window.location.href
    };
    
    if (navigator.share) {
        try {
            await navigator.share(textData);
        } catch (error) {
            console.log('Error sharing:', error);
            fallbackShare();
        }
    } else {
        fallbackShare();
    }
}

// Fallback function for sharing
function fallbackShare() {
    const url = window.location.href;
    
    // Create temporary element to copy URL
    const tempInput = document.createElement('input');
    tempInput.value = url;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    
    showNotification('Link copied to clipboard');
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

// Function to format dates
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return 'Invalid date';
        }
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return 'Invalid date';
    }
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

// Function to configure meta tags
function setupMetaTags(textData) {
    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.name = 'description';
        document.head.appendChild(metaDescription);
    }
    
    const content = textData.content.substring(0, 160);
    metaDescription.content = `${content}...`;
    
    // Configure Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
        ogTitle.content = 'Shared Text';
    }
    
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
        ogDescription.content = content + '...';
    }
    
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
        ogUrl.content = window.location.href;
    }
}

// Function to highlight syntax (optional)
function highlightSyntax(text) {
    // Detect if it's code based on common patterns
    const codePatterns = [
        /function\s+\w+\s*\(/g,
        /const\s+\w+\s*=/g,
        /let\s+\w+\s*=/g,
        /var\s+\w+\s*=/g,
        /if\s*\(/g,
        /for\s*\(/g,
        /while\s*\(/g,
        /class\s+\w+/g,
        /import\s+/g,
        /export\s+/g,
        /console\.log/g,
        /return\s+/g
    ];
    
    const hasCodePatterns = codePatterns.some(pattern => pattern.test(text));
    
    if (hasCodePatterns) {
        textBody.classList.add('code-content');
    }
}

// Function to detect content type
function detectContentType(text) {
    const lines = text.split('\n');
    const avgLineLength = lines.reduce((sum, line) => sum + line.length, 0) / lines.length;
    
    if (avgLineLength < 50 && lines.length > 5) {
        return 'code';
    } else if (text.includes('http') || text.includes('www.')) {
        return 'links';
    } else {
        return 'text';
    }
}

// Function to apply formatting based on content type
function applyContentFormatting(text, contentType) {
    switch (contentType) {
        case 'code':
            textBody.classList.add('code-content');
            break;
        case 'links':
            textBody.classList.add('links-content');
            // Convert URLs to clickable links
            const urlRegex = /(https?:\/\/[^\s]+)/g;
            textBody.innerHTML = text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
            return; // Don't use textContent to preserve HTML
        default:
            textBody.classList.add('text-content');
    }
    
    textBody.textContent = text;
}

// Function to generate text preview
function generatePreview(text) {
    const maxLength = 200;
    if (text.length <= maxLength) {
        return text;
    }
    
    // Find a natural break point
    const truncated = text.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    
    if (lastSpace > maxLength * 0.8) {
        return truncated.substring(0, lastSpace) + '...';
    }
    
    return truncated + '...';
}

// Function to configure keyboard shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + C to copy
        if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
            e.preventDefault();
            copyText();
        }
        
        // Ctrl/Cmd + S to share
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            shareText();
        }
        
        // Escape to go home
        if (e.key === 'Escape') {
            window.location.href = 'index.html';
        }
    });
}

// Function to configure PWA (Progressive Web App)
function setupPWA() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered:', registration);
            })
            .catch(error => {
                console.log('SW error:', error);
            });
    }
}

// Function to configure analytics (optional)
function setupAnalytics() {
    // Here you can add Google Analytics, Matomo, etc.
    console.log('Text page viewed:', getTextId());
}

// Initialization
document.addEventListener('DOMContentLoaded', function() {
    // Configure keyboard shortcuts
    setupKeyboardShortcuts();
    
    // Configure PWA
    setupPWA();
    
    // Configure analytics
    setupAnalytics();
    
    // Load text
    loadText();
    
    // Configure back button
    window.addEventListener('popstate', function() {
        if (document.referrer.includes(window.location.hostname)) {
            window.history.back();
        } else {
            window.location.href = 'index.html';
        }
    });
});

// Function to handle network errors
window.addEventListener('online', function() {
    if (errorState.style.display === 'block') {
        loadText(); // Retry loading
    }
});

window.addEventListener('offline', function() {
    if (loadingState.style.display !== 'none') {
        showError('No internet connection. Check your connection.');
    }
});

// Text obfuscation functions
function obfuscateText() {
    if (!originalText) return;
    
    isTextObfuscated = true;
    textBody.classList.add('obfuscated');
    textBody.disabled = true;
    
    // Update button text
    if (revealBtn) {
        const btnText = revealBtn.querySelector('span[data-i18n]');
        if (btnText) {
            btnText.textContent = window.i18n ? window.i18n.t('revealText') : 'Reveal Text';
        }
    }
}

function revealText() {
    if (!originalText) return;
    
    isTextObfuscated = false;
    textBody.classList.remove('obfuscated');
    textBody.disabled = false;
    
    // Update button text
    if (revealBtn) {
        const btnText = revealBtn.querySelector('span[data-i18n]');
        if (btnText) {
            btnText.textContent = window.i18n ? window.i18n.t('hideText') : 'Hide Text';
        }
    }
    
    // Show notification
    showNotification(window.i18n ? window.i18n.t('textRevealed') : 'Text revealed for 10 seconds');
    
    // Auto-obfuscate after 10 seconds
    if (revealTimeout) {
        clearTimeout(revealTimeout);
    }
    
    revealTimeout = setTimeout(() => {
        obfuscateText();
        showNotification(window.i18n ? window.i18n.t('textHidden') : 'Text is now hidden');
    }, 10000);
}

function toggleTextVisibility() {
    if (isTextObfuscated) {
        revealText();
    } else {
        obfuscateText();
        if (revealTimeout) {
            clearTimeout(revealTimeout);
            revealTimeout = null;
        }
        showNotification(window.i18n ? window.i18n.t('textHidden') : 'Text is now hidden');
    }
} 