/**
 * i18n Configuration - Internationalization for Haruka Yang Portfolio
 * Supports: English (en-US), Chinese (zh-CN), Japanese (ja-JP)
 */

const SUPPORTED_LANGS = ['en-US', 'zh-CN', 'ja-JP'];
const DEFAULT_LANG = 'en-US';

const LANG_CONFIG = {
    'en-US': { flag: '🇺🇸', name: 'EN', fullName: 'English' },
    'zh-CN': { flag: '🇨🇳', name: '中文', fullName: '中文' },
    'ja-JP': { flag: '🇯🇵', name: '日本語', fullName: '日本語' }
};

// Detect browser language
function detectLanguage() {
    const stored = localStorage.getItem('language');
    if (stored && SUPPORTED_LANGS.includes(stored)) {
        return stored;
    }

    const browserLang = navigator.language || navigator.userLanguage;

    // Check for exact match
    if (SUPPORTED_LANGS.includes(browserLang)) {
        return browserLang;
    }

    // Check for partial match (e.g., 'zh' matches 'zh-CN')
    const langCode = browserLang.split('-')[0];
    const match = SUPPORTED_LANGS.find(lang => lang.startsWith(langCode));

    return match || DEFAULT_LANG;
}

// Initialize i18next
async function initI18n() {
    const detectedLang = detectLanguage();

    // Load all translation files
    const resources = {};
    for (const lang of SUPPORTED_LANGS) {
        try {
            const response = await fetch(`locales/${lang}.json`);
            const translations = await response.json();
            resources[lang] = { translation: translations };
        } catch (error) {
            console.warn(`Failed to load translations for ${lang}:`, error);
        }
    }

    await i18next.init({
        lng: detectedLang,
        fallbackLng: DEFAULT_LANG,
        resources: resources,
        interpolation: {
            escapeValue: false
        }
    });

    // Apply translations
    updateContent();
    updateLangSwitcher();

    return detectedLang;
}

// Update all elements with data-i18n attribute
function updateContent() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = i18next.t(key);
        if (translation && translation !== key) {
            element.textContent = translation;
        }
    });
}

// Update language switcher UI
function updateLangSwitcher() {
    const currentLang = i18next.language;
    const config = LANG_CONFIG[currentLang] || LANG_CONFIG[DEFAULT_LANG];

    const currentFlag = document.getElementById('currentFlag');
    const currentLangText = document.getElementById('currentLang');

    if (currentFlag) currentFlag.textContent = config.flag;
    if (currentLangText) currentLangText.textContent = config.name;

    // Update active state in dropdown
    document.querySelectorAll('.lang-option').forEach(option => {
        const lang = option.getAttribute('data-lang');
        option.classList.toggle('active', lang === currentLang);
    });
}

// Change language
async function changeLanguage(lang) {
    if (!SUPPORTED_LANGS.includes(lang)) return;

    await i18next.changeLanguage(lang);
    localStorage.setItem('language', lang);
    updateContent();
    updateLangSwitcher();

    // Close dropdown
    const dropdown = document.getElementById('langDropdown');
    if (dropdown) dropdown.classList.remove('active');
}

// Initialize language switcher events
function initLangSwitcher() {
    const langBtn = document.getElementById('langBtn');
    const langDropdown = document.getElementById('langDropdown');

    if (langBtn && langDropdown) {
        langBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            langDropdown.classList.toggle('active');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            langDropdown.classList.remove('active');
        });

        // Language option click handlers
        document.querySelectorAll('.lang-option').forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const lang = option.getAttribute('data-lang');
                changeLanguage(lang);
            });
        });
    }
}

// Export for use
window.i18nConfig = {
    init: initI18n,
    change: changeLanguage,
    initSwitcher: initLangSwitcher,
    SUPPORTED_LANGS,
    LANG_CONFIG
};
