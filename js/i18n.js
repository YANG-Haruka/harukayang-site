/**
 * i18n Configuration - Internationalization for Haruka Yang Portfolio
 * Supports: English (en-US), Chinese (zh-CN), Japanese (ja-JP)
 * Translations are inlined to avoid fetch dependency issues
 */

const SUPPORTED_LANGS = ['en-US', 'zh-CN', 'ja-JP'];
const DEFAULT_LANG = 'en-US';

const LANG_CONFIG = {
    'en-US': { flag: '🇺🇸', name: 'EN', fullName: 'English' },
    'zh-CN': { flag: '🇨🇳', name: '中文', fullName: '中文' },
    'ja-JP': { flag: '🇯🇵', name: '日本語', fullName: '日本語' }
};

// Inlined translations - no fetch required
const TRANSLATIONS = {
    'en-US': {
        translation: {
            nav: { home: "Home", about: "About", works: "Works", contact: "Contact", tipme: "Tip Me" },
            hero: { subtitle: "Welcome to My Universe", cta: "Explore", scroll: "Scroll" },
            about: {
                title: "About Me",
                subtitle: "A Developer with Passion for Innovation",
                greeting: "Hello, I'm YANG JIZHOU. You can also call me Haruka.",
                p1: "I am a full-stack developer with a deep passion for crafting elegant and efficient digital experiences. I love transforming creative visions into reality through code.",
                p2: "My journey began with a curiosity for technology, evolving into a relentless pursuit of innovation and excellence. I explore the intersection where technology meets artistry.",
                p3: "When I'm not coding, you'll find me exploring emerging technologies, reading, or contemplating my next creative project over a cup of coffee."
            },
            portfolio: {
                title: "My Works",
                subtitle: "Selected Projects",
                visitSite: "Visit Site",
                viewProject: "View Project",
                liveDemo: "Live Demo",
                haruwine: { desc: "AI Cocktail Sommelier" },
                linguaharu: { desc: "Open-source AI Document Translator" }
            },
            contact: { title: "Contact", subtitle: "Let's Create Something Beautiful" },
            chat: { botName: "Haruka AI", online: "Online", welcome: "Hey~ Feel free to chat with me!", placeholder: "Say something...", contactBtn: "Contact Me", contactStep1: "Please leave your contact info first (WeChat / Email / etc.)", contactStep1Placeholder: "Your WeChat, Email, or other contact...", contactStep2: "Got it! Now tell me what you'd like to say~", contactStep2Placeholder: "Your message...", contactSent: "Received! Haruka will get back to you soon~", backToChat: "Back to Chat" }
        }
    },
    'zh-CN': {
        translation: {
            nav: { home: "\u9996\u9875", about: "\u5173\u4E8E", works: "\u4F5C\u54C1", contact: "\u8054\u7CFB", tipme: "\u6253\u8D4F\u6211" },
            hero: { subtitle: "欢迎来到我的世界", cta: "探索", scroll: "向下滚动" },
            about: {
                title: "关于我",
                subtitle: "热爱创新的开发者",
                greeting: "你好，我是杨际舟，也可以叫我悠",
                p1: "我是一名全栈开发者，热衷于打造优雅高效的数字体验。我喜欢用代码将创意转化为现实。",
                p2: "我的旅程始于对技术的好奇，逐渐演变为对创新与卓越的不懈追求。我探索技术与艺术的交汇点。",
                p3: "在不写代码的时候，你会发现我在探索新兴技术、阅读，或者一边喝咖啡一边思考下一个创意项目。"
            },
            portfolio: {
                title: "我的作品",
                subtitle: "精选项目",
                visitSite: "访问网站",
                viewProject: "查看项目",
                liveDemo: "在线体验",
                haruwine: { desc: "AI 鸡尾酒推荐助手" },
                linguaharu: { desc: "开源AI文档翻译工具" }
            },
            contact: { title: "联系我", subtitle: "一起创造美好的事物" },
            chat: { botName: "AI小悠", online: "在线", welcome: "嘿～有什么想聊的随便问我", placeholder: "说点什么...", contactBtn: "联系本人", contactStep1: "请先留下你的联系方式（微信 / 邮箱等）", contactStep1Placeholder: "你的微信号、邮箱或其他联系方式...", contactStep2: "收到！现在请输入你想说的话～", contactStep2Placeholder: "你想说的话...", contactSent: "已收到！悠会尽快回复你的～", backToChat: "返回聊天" }
        }
    },
    'ja-JP': {
        translation: {
            nav: { home: "\u30DB\u30FC\u30E0", about: "\u79C1\u306B\u3064\u3044\u3066", works: "\u4F5C\u54C1", contact: "\u304A\u554F\u3044\u5408\u308F\u305B", tipme: "\u6295\u3052\u92AD" },
            hero: { subtitle: "私の世界へようこそ", cta: "探索する", scroll: "スクロール" },
            about: {
                title: "私について",
                subtitle: "イノベーションに情熱を注ぐ開発者",
                greeting: "こんにちは、YANG JIZHOU です。悠（Haruka）とも呼んでください。",
                p1: "私はフルスタック開発者として、エレガントで効率的なデジタル体験の創造に情熱を注いでいます。コードを通じてクリエイティブなビジョンを現実に変えることが大好きです。",
                p2: "テクノロジーへの好奇心から始まった私の旅は、イノベーションと卓越性への絶え間ない追求へと発展しました。テクノロジーとアートが交差する場所を探求しています。",
                p3: "コーディングをしていない時は、新しいテクノロジーを探求したり、読書をしたり、コーヒーを飲みながら次のクリエイティブプロジェクトを考えたりしています。"
            },
            portfolio: {
                title: "作品集",
                subtitle: "厳選プロジェクト",
                visitSite: "サイトを見る",
                viewProject: "プロジェクトを見る",
                liveDemo: "ライブデモ",
                haruwine: { desc: "AI カクテルソムリエ" },
                linguaharu: { desc: "オープンソースAI文書翻訳ツール" }
            },
            contact: { title: "お問い合わせ", subtitle: "一緒に素敵なものを創りましょう" },
            chat: { botName: "AI悠ちゃん", online: "オンライン", welcome: "やあ～何でも気軽に聞いてね！", placeholder: "メッセージを入力...", contactBtn: "本人に連絡", contactStep1: "まず連絡先を教えてね（LINE / メールなど）", contactStep1Placeholder: "LINE、メールなどの連絡先...", contactStep2: "了解！伝えたいことを入力してね～", contactStep2Placeholder: "メッセージを入力...", contactSent: "受け取りました！悠からすぐ返信します～", backToChat: "チャットに戻る" }
        }
    }
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

    await i18next.init({
        lng: detectedLang,
        fallbackLng: DEFAULT_LANG,
        supportedLngs: SUPPORTED_LANGS,
        load: 'currentOnly',
        resources: TRANSLATIONS,
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
    // Handle placeholder translations
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        const translation = i18next.t(key);
        if (translation && translation !== key) {
            element.placeholder = translation;
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
