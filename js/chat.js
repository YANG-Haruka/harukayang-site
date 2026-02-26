/**
 * Chat Integration for Haruka Yang Portfolio
 * Calls Vercel API backend → DeepSeek + Contact mode
 */

const CHAT_CONFIG = {
    apiUrl: 'https://api.harukayang.com/api/chat',
    contactUrl: 'https://api.harukayang.com/api/contact'
};

(function () {
    var chatMessages = document.getElementById('chatMessages');
    var chatInput = document.getElementById('chatInput');
    var chatSend = document.getElementById('chatSend');
    var contactBtn = document.getElementById('contactBtn');
    var chatActions = document.getElementById('chatActions');
    var chatInputArea = chatInput.closest('.chat-input-area');
    var isSending = false;
    var contactMode = false; // false | 'step1' | 'step2'
    var contactInfo = '';
    var history = [];

    // Generate or restore session ID for chat logging
    var sessionId = sessionStorage.getItem('chatSessionId');
    if (!sessionId) {
        sessionId = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
        sessionStorage.setItem('chatSessionId', sessionId);
    }

    // ========== i18n helper ==========

    function t(key, fallback) {
        if (typeof i18next !== 'undefined' && i18next.isInitialized) {
            var val = i18next.t(key);
            if (val && val !== key) return val;
        }
        return fallback;
    }

    // ========== Render helpers ==========

    function createMsgEl(role, text) {
        var row = document.createElement('div');
        row.className = 'chat-msg chat-msg--' + role;

        if (role === 'bot') {
            var avatar = document.createElement('div');
            avatar.className = 'chat-msg-avatar';
            avatar.innerHTML = '<img src="imgs/haruka.jpg" alt="">';
            row.appendChild(avatar);
        }

        var bubble = document.createElement('div');
        bubble.className = 'chat-msg-bubble';
        bubble.textContent = text || '';
        row.appendChild(bubble);

        chatMessages.appendChild(row);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return bubble;
    }

    function createSystemMsg(text) {
        var row = document.createElement('div');
        row.className = 'chat-msg chat-msg--system';
        var bubble = document.createElement('div');
        bubble.className = 'chat-msg-bubble';
        bubble.textContent = text;
        row.appendChild(bubble);
        chatMessages.appendChild(row);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function createBotMsgGroup() {
        var row = document.createElement('div');
        row.className = 'chat-msg chat-msg--bot chat-msg--group';

        var avatar = document.createElement('div');
        avatar.className = 'chat-msg-avatar';
        avatar.innerHTML = '<img src="imgs/haruka.jpg" alt="">';
        row.appendChild(avatar);

        var bubbleWrap = document.createElement('div');
        bubbleWrap.className = 'chat-msg-bubbles';
        row.appendChild(bubbleWrap);

        chatMessages.appendChild(row);
        return bubbleWrap;
    }

    function addBubbleToGroup(wrapEl, text) {
        var bubble = document.createElement('div');
        bubble.className = 'chat-msg-bubble';
        bubble.textContent = text;
        wrapEl.appendChild(bubble);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return bubble;
    }

    function showTyping() {
        var row = document.createElement('div');
        row.className = 'chat-msg chat-msg--bot chat-msg--typing';
        row.id = 'chatTyping';

        var avatar = document.createElement('div');
        avatar.className = 'chat-msg-avatar';
        avatar.innerHTML = '<img src="imgs/haruka.jpg" alt="">';
        row.appendChild(avatar);

        var bubble = document.createElement('div');
        bubble.className = 'chat-msg-bubble';
        bubble.innerHTML = '<span class="typing-dots"><span></span><span></span><span></span></span>';
        row.appendChild(bubble);

        chatMessages.appendChild(row);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function removeTyping() {
        var el = document.getElementById('chatTyping');
        if (el) el.remove();
    }

    // ========== Contact mode ==========

    function enterContactMode() {
        contactMode = 'step1';
        contactInfo = '';
        contactBtn.classList.add('active');
        contactBtn.textContent = t('chat.backToChat', '返回聊天');
        chatInputArea.classList.add('contact-mode');
        chatInput.placeholder = t('chat.contactStep1Placeholder', '你的微信号、邮箱或其他联系方式...');

        var welcome = chatMessages.querySelector('.chat-welcome');
        if (welcome) welcome.remove();

        createSystemMsg(t('chat.contactStep1', '请先留下你的联系方式（微信 / 邮箱等）'));
        chatInput.focus();
    }

    function enterContactStep2() {
        contactMode = 'step2';
        chatInput.placeholder = t('chat.contactStep2Placeholder', '你想说的话...');
        createSystemMsg(t('chat.contactStep2', '收到！现在请输入你想说的话～'));
        chatInput.focus();
    }

    function exitContactMode() {
        contactMode = false;
        contactInfo = '';
        contactBtn.classList.remove('active');
        contactBtn.textContent = t('chat.contactBtn', '联系本人');
        chatInputArea.classList.remove('contact-mode');
        chatInput.placeholder = t('chat.placeholder', '说点什么...');
        if (chatActions) chatActions.classList.remove('visible');
    }

    async function sendContact(contact, message) {
        var resp = await fetch(CHAT_CONFIG.contactUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contact: contact, message: message })
        });
        if (!resp.ok) throw new Error('Contact API error: ' + resp.status);
        return resp.json();
    }

    // ========== AI chat API ==========

    async function sendMessage(message) {
        var resp = await fetch(CHAT_CONFIG.apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: message, history: history, sessionId: sessionId })
        });

        if (!resp.ok) throw new Error('API error: ' + resp.status);
        return resp.body;
    }

    // Collect full streamed response text
    async function collectStream(readableStream) {
        var reader = readableStream.getReader();
        var decoder = new TextDecoder();
        var buffer = '';
        var fullText = '';

        while (true) {
            var result = await reader.read();
            if (result.done) break;

            buffer += decoder.decode(result.value, { stream: true });
            var lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (var i = 0; i < lines.length; i++) {
                var line = lines[i].trim();
                if (!line || !line.startsWith('data:')) continue;
                var dataStr = line.slice(5).trim();
                if (dataStr === '[DONE]') continue;
                try {
                    var data = JSON.parse(dataStr);
                    var delta = data.choices && data.choices[0] && data.choices[0].delta;
                    if (delta && delta.content) fullText += delta.content;
                } catch (e) {}
            }
        }
        return fullText;
    }

    function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

    // Simulate typing: show text character by character
    async function typeText(bubble, text) {
        // Pre-measure: set full text to get final dimensions, then lock width
        bubble.textContent = text;
        var finalWidth = bubble.offsetWidth;
        bubble.style.minWidth = finalWidth + 'px';
        bubble.textContent = '';

        var len = text.length;
        // Typing speed: 30-60ms per char, faster for longer texts
        var baseDelay = len > 20 ? 25 : 40;
        for (var i = 0; i < len; i++) {
            bubble.textContent = text.slice(0, i + 1);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            await sleep(baseDelay + Math.random() * 20);
        }
        // Typing done, release fixed width
        bubble.style.minWidth = '';
    }

    // Display reply: split by newline, type each bubble sequentially with delay
    async function displayReply(fullText, bubbleWrap) {
        var msgLines = fullText.split('\n').filter(function (l) { return l.trim(); });
        for (var i = 0; i < msgLines.length; i++) {
            if (i > 0) {
                // Pause between messages (600-1200ms, like typing gap)
                showTyping();
                await sleep(600 + Math.random() * 600);
                removeTyping();
            }
            var bubble = addBubbleToGroup(bubbleWrap, '');
            await typeText(bubble, msgLines[i]);
        }
        return fullText;
    }

    // ========== Send handler ==========

    async function handleSend() {
        var msg = chatInput.value.trim();
        if (!msg || isSending) return;

        var welcome = chatMessages.querySelector('.chat-welcome');
        if (welcome) welcome.remove();

        createMsgEl('user', msg);
        chatInput.value = '';
        chatInput.style.height = 'auto';

        isSending = true;
        chatSend.disabled = true;

        if (contactMode === 'step1') {
            // Step 1: collect contact info, then move to step 2
            contactInfo = msg;
            enterContactStep2();
        } else if (contactMode === 'step2') {
            // Step 2: send contact info + message to email
            try {
                await sendContact(contactInfo, msg);
                createSystemMsg(t('chat.contactSent', '已收到！悠会尽快回复你的～'));
            } catch (err) {
                console.error('Contact error:', err);
                createSystemMsg('发送失败，请稍后再试');
            }
            exitContactMode();
        } else {
            // AI chat mode
            history.push({ role: 'user', content: msg });
            showTyping();

            try {
                var stream = await sendMessage(msg);
                var fullReply = await collectStream(stream);
                removeTyping();

                // Detect contact marker and strip it (AI may output variants)
                var contactPattern = /\[CONTACT\]|\[联系本人\]|【CONTACT】|【联系本人】/gi;
                var showContact = contactPattern.test(fullReply);
                var cleanReply = fullReply.replace(contactPattern, '').trim();

                var bubbleWrap = createBotMsgGroup();
                await displayReply(cleanReply, bubbleWrap);
                history.push({ role: 'assistant', content: cleanReply });
                if (history.length > 20) history = history.slice(-20);

                // Show contact button if AI detected contact intent
                if (showContact && chatActions) {
                    chatActions.classList.add('visible');
                }
            } catch (err) {
                removeTyping();
                console.error('Chat error:', err);
                createMsgEl('bot', '抱歉，暂时无法回复，请稍后再试～');
            }
        }

        isSending = false;
        chatSend.disabled = false;
        chatInput.focus();
    }

    // ========== Bind events ==========

    chatSend.addEventListener('click', handleSend);

    chatInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    });

    chatInput.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 100) + 'px';
    });

    contactBtn.addEventListener('click', function () {
        if (contactMode) {
            exitContactMode();
        } else {
            enterContactMode();
        }
    });
})();
