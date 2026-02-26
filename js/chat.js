/**
 * Chat Integration for Haruka Yang Portfolio
 * Calls Vercel API backend → DeepSeek
 */

const CHAT_CONFIG = {
    // ★ 部署 Vercel 后替换为你的实际地址
    apiUrl: 'https://harukayang-chat-api.vercel.app/api/chat'
    // Vercel 部署地址，无需修改
};

(function () {
    var chatMessages = document.getElementById('chatMessages');
    var chatInput = document.getElementById('chatInput');
    var chatSend = document.getElementById('chatSend');
    var isSending = false;
    var history = []; // conversation history for context

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

    // ========== API call (streaming) ==========

    async function sendMessage(message) {
        var resp = await fetch(CHAT_CONFIG.apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: message, history: history })
        });

        if (!resp.ok) throw new Error('API error: ' + resp.status);
        return resp.body;
    }

    async function parseStream(readableStream, bubbleWrap) {
        var reader = readableStream.getReader();
        var decoder = new TextDecoder();
        var buffer = '';
        var fullText = '';
        var currentLineText = '';
        var currentBubble = addBubbleToGroup(bubbleWrap, '');

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
                    if (!delta || !delta.content) continue;

                    var chunk = delta.content;
                    fullText += chunk;

                    // Split on newlines for multi-bubble effect
                    var parts = chunk.split('\n');
                    for (var p = 0; p < parts.length; p++) {
                        if (p > 0 && currentLineText.trim()) {
                            currentLineText = '';
                            currentBubble = addBubbleToGroup(bubbleWrap, '');
                        }
                        currentLineText += parts[p];
                        currentBubble.textContent = currentLineText;
                    }
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                } catch (e) {
                    // skip
                }
            }
        }

        // Clean up empty bubbles
        var allBubbles = bubbleWrap.querySelectorAll('.chat-msg-bubble');
        for (var b = 0; b < allBubbles.length; b++) {
            if (!allBubbles[b].textContent.trim()) allBubbles[b].remove();
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
        history.push({ role: 'user', content: msg });

        chatInput.value = '';
        chatInput.style.height = 'auto';

        isSending = true;
        chatSend.disabled = true;
        showTyping();

        try {
            var stream = await sendMessage(msg);
            removeTyping();
            var bubbleWrap = createBotMsgGroup();
            var reply = await parseStream(stream, bubbleWrap);
            history.push({ role: 'assistant', content: reply });

            // Keep history manageable
            if (history.length > 20) history = history.slice(-20);
        } catch (err) {
            removeTyping();
            console.error('Chat error:', err);
            createMsgEl('bot', '抱歉，暂时无法回复，请稍后再试～');
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
})();
