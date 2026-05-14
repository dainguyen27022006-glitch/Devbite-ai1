// ============================================================
//  SIDEBAR UPGRADE – DevByte AI  (FIXED)
//  Fix 1: profileMenu khai báo đúng thứ tự (không còn undefined)
//  Fix 2: More menu hiện đúng vị trí (bên dưới, không ra ngoài sidebar)
//  Fix 3: Recent chat lưu + restore toàn bộ messages khi bấm lại
// ============================================================

// ===== LẤY THÔNG TIN USER TỪ SESSION =====
function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem('devbyte_session') || 'null')
            || JSON.parse(sessionStorage.getItem('devbyte_session') || 'null');
    } catch { return null; }
}

// ===== CẬP NHẬT TÊN USER Ở SIDEBAR =====
function loadUserProfile() {
    const user = getCurrentUser();
    if (!user) return;
    const name = user.fullname || user.email || 'Người dùng';
    const el = (id) => document.getElementById(id);
    if (el('profileName'))     el('profileName').textContent     = name;
    if (el('profileMenuName')) el('profileMenuName').textContent = name;
    if (el('profileAvatar'))   el('profileAvatar').textContent   = name.charAt(0).toUpperCase();
    if (el('profileMenuAvatar')) el('profileMenuAvatar').textContent = name.charAt(0).toUpperCase();
    if (el('profilePlan'))     el('profilePlan').textContent     = 'Free Plan';
}

// ============================================================
//  QUẢN LÝ LỊCH SỬ CHAT
//  Mỗi chat lưu: { id, title, time, messages[] }
//  messages[] = [ { sender: 'user'|'bot', html: '...' } ]
// ============================================================

let currentChatId = null;

function getChatHistory() {
    try { return JSON.parse(localStorage.getItem('devbyte_chats') || '[]'); }
    catch { return []; }
}

function saveChatHistory(chats) {
    localStorage.setItem('devbyte_chats', JSON.stringify(chats));
}

// ── Lưu snapshot toàn bộ chatBox vào chat hiện tại ──
function snapshotCurrentChat() {
    if (!currentChatId) return;
    const chatBox = document.getElementById('chatBox');
    if (!chatBox) return;

    const chats = getChatHistory();
    const chat  = chats.find(c => c.id === currentChatId);
    if (!chat) return;

    // Lưu từng message bubble (giữ nguyên HTML bên trong)
    chat.messages = Array.from(chatBox.children).map(el => ({
        cls: el.className,   // 'message user-message' hoặc 'message bot-message'
        html: el.innerHTML
    }));
    saveChatHistory(chats);
}

// ── Tạo chat mới ──
function createNewChat() {
    // Lưu snapshot chat hiện tại trước khi tạo mới
    snapshotCurrentChat();

    currentChatId = Date.now().toString();
    const chatBox = document.getElementById('chatBox');
    if (chatBox) {
        chatBox.innerHTML = `
            <div class="message bot-message">
                👋 Xin chào! Mình là <b>DevByte AI</b> — trợ lý tư vấn điện thoại của bạn.<br><br>
                Bạn có thể hỏi mình về:<br>
                📱 So sánh điện thoại &nbsp;|&nbsp; 🔋 Pin trâu &nbsp;|&nbsp; 💰 Giá tốt
            </div>`;
    }
    renderRecentChats();
}

// ── Lưu tin nhắn vào history metadata + cập nhật Recent ──
function saveMessageToHistory(userText) {
    if (!currentChatId) currentChatId = Date.now().toString();

    let chats = getChatHistory();
    const existing = chats.find(c => c.id === currentChatId);

    if (!existing) {
        chats.unshift({
            id: currentChatId,
            title: userText.slice(0, 32),
            time: Date.now(),
            messages: []
        });
        if (chats.length > 20) chats = chats.slice(0, 20);
        saveChatHistory(chats);
    }

    renderRecentChats();
}

// ── Render danh sách Recent ──
function renderRecentChats(filter) {
    filter = filter || '';
    const container = document.getElementById('recentList');
    if (!container) return;

    const chats = getChatHistory();
    const filtered = filter
        ? chats.filter(c => (c.title || '').toLowerCase().includes(filter.toLowerCase()))
        : chats;

    if (!filtered.length) {
        container.innerHTML = '<div class="recent-empty">Chưa có đoạn chat nào</div>';
        return;
    }

    container.innerHTML = filtered.map(c => `
        <div class="recent-chat ${c.id === currentChatId ? 'active' : ''}"
             data-id="${c.id}"
             onclick="loadChat('${c.id}')">
            <i class="ri-chat-3-line"></i>
            <span title="${c.title || ''}">${c.title || 'Chat mới'}</span>
        </div>
    `).join('');
}

// ── Load lại chat cũ từ localStorage ──
function loadChat(id) {
    if (id === currentChatId) return;  // đang ở chat này rồi

    // Lưu snapshot chat đang mở trước khi chuyển
    snapshotCurrentChat();

    currentChatId = id;

    const chats   = getChatHistory();
    const chat    = chats.find(c => c.id === id);
    const chatBox = document.getElementById('chatBox');

    if (chatBox) {
        if (chat && chat.messages && chat.messages.length) {
            // Restore toàn bộ messages đã lưu
            chatBox.innerHTML = '';
            chat.messages.forEach(m => {
                const div = document.createElement('div');
                div.className = m.cls || 'message';
                div.innerHTML = m.html;
                chatBox.appendChild(div);
            });
            chatBox.scrollTop = chatBox.scrollHeight;
        } else {
            chatBox.innerHTML = '<div class="recent-empty" style="padding:20px;text-align:center;color:#475569">Không có nội dung chat này.</div>';
        }
    }

    // Cập nhật highlight
    renderRecentChats();
}

// ============================================================
//  DOM READY
// ============================================================
document.addEventListener('DOMContentLoaded', () => {

    loadUserProfile();
    renderRecentChats();
    currentChatId = Date.now().toString();

    // ── Khai báo TẤT CẢ biến trước khi dùng ──
    const newChatBtn     = document.querySelector('.new-chat-btn');
    const searchInput    = document.getElementById('searchChatInput');
    const moreBtn        = document.getElementById('moreBtn');
    const moreMenu       = document.getElementById('moreMenu');
    const profileTrigger = document.getElementById('profileTrigger');
    const profileMenu    = document.getElementById('profileMenu');   // ← FIX: khai báo trước

    // New Chat
    if (newChatBtn) newChatBtn.addEventListener('click', createNewChat);

    // Search Chat
    if (searchInput) {
        searchInput.addEventListener('input', () => renderRecentChats(searchInput.value));
    }

    // ── More toggle (FIX: profileMenu đã khai báo rồi) ──
    if (moreBtn && moreMenu) {
        moreBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            moreMenu.classList.toggle('show');
            if (profileMenu) profileMenu.classList.remove('show');  // ← không còn lỗi
        });
    }

    // Profile menu toggle
    if (profileTrigger && profileMenu) {
        profileTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            profileMenu.classList.toggle('show');
            if (moreMenu) moreMenu.classList.remove('show');
        });
    }

    // Đóng tất cả menu khi click ra ngoài
    document.addEventListener('click', () => {
        if (moreMenu)    moreMenu.classList.remove('show');
        if (profileMenu) profileMenu.classList.remove('show');
    });

    // More > Image → trigger nút #btnImage của action-bar.js
    document.getElementById('moreImage')?.addEventListener('click', () => {
        document.getElementById('btnImage')?.click();
        moreMenu?.classList.remove('show');
    });

    // More > Deep Research
    document.getElementById('moreDeepResearch')?.addEventListener('click', () => {
        showDeepResearchPanel();
        moreMenu?.classList.remove('show');
    });

    // Profile > Try Plus
    document.getElementById('menuTryPlus')?.addEventListener('click', () => {
        window.location.href = 'pricing.html';
    });

    // Profile > Profile
    document.getElementById('menuProfile')?.addEventListener('click', () => {
        showProfileModal();
        profileMenu?.classList.remove('show');
    });

    // Profile > Settings (mở modal settings của action-bar.js)
    document.getElementById('menuSettings')?.addEventListener('click', () => {
        document.getElementById('btnSettings')?.click();
        profileMenu?.classList.remove('show');
    });

    // Profile > Log Out
    document.getElementById('menuLogout')?.addEventListener('click', () => {
        localStorage.removeItem('devbyte_session');
        sessionStorage.removeItem('devbyte_session');
        window.location.href = 'login.html';
    });
});

// ============================================================
//  HOOK sendMessage – lưu lịch sử tự động sau mỗi lần gửi
//  Chạy sau khi logic.js đã load nên wrap an toàn
// ============================================================
window.addEventListener('load', () => {
    const orig = window.sendMessage;
    if (typeof orig !== 'function') return;

    window.sendMessage = function () {
        const input = document.getElementById('userInput');
        const text  = input?.value?.trim();
        if (text) saveMessageToHistory(text);

        orig();  // gọi sendMessage gốc của logic.js

        // Sau khi bot trả lời xong (~2s), snapshot lại để lưu cả response
        setTimeout(snapshotCurrentChat, 2500);
    };
});

// ============================================================
//  DEEP RESEARCH PANEL
// ============================================================
function showDeepResearchPanel() {
    document.getElementById('deepResearchPanel')?.remove();

    const panel = document.createElement('div');
    panel.id = 'deepResearchPanel';
    panel.className = 'deep-research-panel';
    panel.innerHTML = `
        <div class="drp-header">
            <span>🔬 Deep Research</span>
            <button onclick="document.getElementById('deepResearchPanel').remove()">✕</button>
        </div>
        <p class="drp-sub">Chọn chủ đề để so sánh chuyên sâu:</p>
        <div class="drp-suggestions">
            <button onclick="quickAsk('So sánh iPhone 13 vs Samsung A50 về camera, hiệu năng và pin')">📷 Camera & Hiệu năng</button>
            <button onclick="quickAsk('So sánh pin iPhone 11 vs Xiaomi Redmi Note 10')">🔋 Dung lượng pin</button>
            <button onclick="quickAsk('Điện thoại nào pin trâu nhất dưới 5 triệu?')">💰 Giá tốt nhất</button>
            <button onclick="quickAsk('So sánh toàn diện iPhone 13 vs iPhone 11')">📱 So sánh iPhone</button>
        </div>`;

    document.querySelector('.chat-container')?.prepend(panel);
    setTimeout(() => panel.classList.add('show'), 10);

    panel.querySelectorAll('.drp-suggestions button').forEach(btn => {
        btn.addEventListener('click', () => panel.remove());
    });
}

// ============================================================
//  PROFILE MODAL
// ============================================================
function showProfileModal() {
    document.getElementById('profileEditModal')?.remove();

    const user = getCurrentUser();
    if (!user) return;

    const users    = JSON.parse(localStorage.getItem('devbyte_users') || '[]');
    const fullUser = users.find(u => u.email === user.email) || user;

    const modal = document.createElement('div');
    modal.id = 'profileEditModal';
    modal.className = 'modal-overlay show';
    modal.innerHTML = `
        <div class="modal-box profile-modal-box">
            <h2 style="margin-bottom:20px;font-size:18px">Chỉnh sửa hồ sơ</h2>
            <div class="profile-avatar-big">${(fullUser.fullname || 'U').charAt(0).toUpperCase()}</div>
            <div class="profile-fields">
                <div class="pf-field">
                    <label>Họ và tên</label>
                    <input id="editName" type="text" value="${fullUser.fullname || ''}" placeholder="Nhập tên...">
                </div>
                <div class="pf-field">
                    <label>Email</label>
                    <input type="text" value="${fullUser.email || ''}" readonly style="opacity:.5">
                </div>
                <p style="font-size:12px;color:#64748b;margin-top:-6px">
                    Hồ sơ giúp mọi người nhận ra bạn trong các cuộc trò chuyện nhóm.
                </p>
            </div>
            <div style="display:flex;gap:10px;margin-top:16px">
                <button class="btn-modal btn-modal-outline"
                    onclick="document.getElementById('profileEditModal').remove()">Hủy</button>
                <button class="btn-modal" onclick="saveProfile()">Lưu</button>
            </div>
        </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}

function saveProfile() {
    const newName = document.getElementById('editName')?.value.trim();
    if (!newName) return;

    const user = getCurrentUser();
    if (!user) return;

    const users = JSON.parse(localStorage.getItem('devbyte_users') || '[]');
    const idx   = users.findIndex(u => u.email === user.email);
    if (idx !== -1) {
        users[idx].fullname = newName;
        localStorage.setItem('devbyte_users', JSON.stringify(users));
    }

    user.fullname = newName;
    if (localStorage.getItem('devbyte_session')) {
        localStorage.setItem('devbyte_session', JSON.stringify(user));
    } else {
        sessionStorage.setItem('devbyte_session', JSON.stringify(user));
    }

    loadUserProfile();
    document.getElementById('profileEditModal')?.remove();
}
