class I18n {
    constructor() {
        this.currentLanguage = this.getStoredLanguage() || this.getBrowserLanguage();
        this.init();
    }

    /**
     * Get the stored language from localStorage
     */
    getStoredLanguage() {
        return localStorage.getItem('language') || 'en';
    }

    /**
     * Get the browser language
     */
    getBrowserLanguage() {
        const browserLang = navigator.language || navigator.userLanguage;
        return browserLang.startsWith('es') ? 'es' : 'en';
    }

    /**
     * Initialize the translation system
     */
    init() {
        this.updateLanguage();
        this.createLanguageSelector();
    }

    /**
     * Cambia el idioma actual
     */
    changeLanguage(language) {
        this.currentLanguage = language;
        localStorage.setItem('language', language);
        this.updateLanguage();
    }

    /**
     * Get a translation by key
     */
    t(key) {
        return translations[this.currentLanguage]?.[key] || key;
    }

    /**
     * Update all the texts of the page
     */
    updateLanguage() {
        // Update elements with data-i18n
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (key) {
                element.textContent = this.t(key);
            }
        });

        // Update placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            if (key) {
                element.setAttribute('placeholder', this.t(key));
            }
        });

        // Update titles
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            if (key) {
                element.setAttribute('title', this.t(key));
            }
        });

        // Update alt attributes
        document.querySelectorAll('[data-i18n-alt]').forEach(element => {
            const key = element.getAttribute('data-i18n-alt');
            if (key) {
                element.setAttribute('alt', this.t(key));
            }
        });

        // Update select options dynamically
        this.updateSelectOptions();

        // Update the language of the HTML
        document.documentElement.lang = this.currentLanguage;
    }

    /**
     * Update the options of the select elements
     */
    updateSelectOptions() {
        const expirationSelect = document.getElementById('expiration');
        if (expirationSelect) {
            const options = expirationSelect.querySelectorAll('option');
            options.forEach(option => {
                const key = option.getAttribute('data-i18n');
                if (key) {
                    option.textContent = this.t(key);
                }
            });
        }
    }

    /**
     * Create the language selector
     */
    createLanguageSelector() {
        // Search if a language selector already exists
        let languageSelector = document.getElementById('languageSelector');
        
        if (!languageSelector) {
            languageSelector = document.createElement('div');
            languageSelector.id = 'languageSelector';
            languageSelector.className = 'language-selector';
            
            const label = document.createElement('label');
            label.textContent = this.t('language') + ': ';
            
            const select = document.createElement('select');
            select.id = 'languageSelect';
            select.className = 'language-select';
            
            const optionEn = document.createElement('option');
            optionEn.value = 'en';
            optionEn.textContent = this.t('english');
            
            const optionEs = document.createElement('option');
            optionEs.value = 'es';
            optionEs.textContent = this.t('spanish');
            
            select.appendChild(optionEn);
            select.appendChild(optionEs);
            select.value = this.currentLanguage;
            
            select.addEventListener('change', (e) => {
                const target = e.target;
                this.changeLanguage(target.value);
            });
            
            languageSelector.appendChild(label);
            languageSelector.appendChild(select);
            
            // Insert in the header
            const header = document.querySelector('.header');
            if (header) {
                header.appendChild(languageSelector);
            }
        }
    }
}

// Initialize when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.i18n = new I18n();
});

// Global function to get translations
function t(key) {
    return window.i18n?.t(key) || key;
} 