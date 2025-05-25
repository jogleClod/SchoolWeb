function applyTranslations(lang) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });
}

function initLanguageSelect() {
    const langSelect = document.getElementById('language-select');
    if (!langSelect) return;

    const savedLang = localStorage.getItem('preferredLanguage') || 'ru';
    langSelect.value = savedLang;
    applyTranslations(savedLang);

    langSelect.addEventListener('change', (e) => {
        const lang = e.target.value;
        localStorage.setItem('preferredLanguage', lang);
        applyTranslations(lang);
    });
}

window.addEventListener('DOMContentLoaded', () => {
    const checkSelect = setInterval(() => {
        const select = document.getElementById('language-select');
        if (select) {
            clearInterval(checkSelect);
            initLanguageSelect();
        }
    }, 100);
});
