/* ============================================================
   PROFILE WIDGET – DevByte AI
   File: js/profile-widget.js
   Dùng cho: blog.html, pricing.html, sitemap.html, guide.html
   Chức năng:
     - Hiện widget avatar + tên góc dưới trái
     - Bấm → popup menu (Try Plus / Profile / Settings / Log out)
     - Try Plus  → pricing.html
     - Profile   → modal chỉnh sửa hồ sơ
     - Settings  → modal cài đặt
     - Log out   → login.html
   ============================================================ */

(function () {

  /* ── Lấy session ── */
  function getSession() {
    try {
      return JSON.parse(localStorage.getItem('devbyte_session') || 'null')
          || JSON.parse(sessionStorage.getItem('devbyte_session') || 'null');
    } catch (_) { return null; }
  }

  /* ── Inject CSS một lần ── */
  const style = document.createElement('style');
  style.textContent = `
    #pw-widget {
      position: fixed; bottom: 20px; left: 20px;
      background: #0f172a;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px; padding: 10px 14px;
      display: flex; align-items: center; gap: 10px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      z-index: 9990; cursor: pointer;
      transition: border-color .2s;
      font-family: 'Inter', Arial, sans-serif;
      user-select: none;
    }
    #pw-widget:hover { border-color: #38bdf8; }

    #pw-avatar {
      width: 40px; height: 40px; border-radius: 50%;
      background: linear-gradient(135deg, #2563eb, #06b6d4);
      display: flex; align-items: center; justify-content: center;
      font-size: 16px; font-weight: 700; color: white; flex-shrink: 0;
    }
    #pw-info-name  { font-size: 14px; font-weight: 600; color: white; }
    #pw-info-plan  { font-size: 12px; color: #64748b; }

    /* ── POPUP MENU ── */
    #pw-menu {
      display: none;
      position: fixed; bottom: 88px; left: 20px;
      background: #0f172a;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px; padding: 8px;
      min-width: 220px; z-index: 9991;
      box-shadow: 0 -10px 40px rgba(0,0,0,0.5);
      font-family: 'Inter', Arial, sans-serif;
      animation: pwUp .18s ease;
    }
    @keyframes pwUp {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .pw-menu-header {
      display: flex; align-items: center; gap: 10px;
      padding: 8px 10px 12px;
      border-bottom: 1px solid rgba(255,255,255,0.06);
      margin-bottom: 4px;
    }
    .pw-menu-avatar {
      width: 36px; height: 36px; border-radius: 50%;
      background: linear-gradient(135deg, #2563eb, #06b6d4);
      display: flex; align-items: center; justify-content: center;
      font-size: 14px; font-weight: 700; color: white; flex-shrink: 0;
    }
    .pw-menu-uname { font-size: 14px; font-weight: 600; color: white; margin: 0; }
    .pw-menu-plan  { font-size: 12px; color: #64748b; }

    .pw-item {
      display: flex; align-items: center; gap: 10px;
      padding: 9px 12px; border-radius: 10px;
      font-size: 14px; cursor: pointer;
      transition: background .15s;
    }
    .pw-item:hover { background: rgba(255,255,255,0.07); }
    .pw-item.plus  { color: #fbbf24; }
    .pw-item.plus:hover { background: rgba(251,191,36,0.08); }
    .pw-item.normal { color: #cbd5e1; }
    .pw-item.danger { color: #f87171; }
    .pw-item.danger:hover { background: rgba(239,68,68,0.1); }

    /* ── MODAL BASE ── */
    .pw-modal-overlay {
      display: none; position: fixed; inset: 0;
      background: rgba(0,0,0,0.65);
      backdrop-filter: blur(6px);
      z-index: 9995;
      align-items: center; justify-content: center;
      font-family: 'Inter', Arial, sans-serif;
    }
    .pw-modal-overlay.open { display: flex; }
    .pw-modal-box {
      background: #0f172a;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 20px; padding: 28px;
      width: 90%; max-width: 380px;
      position: relative; color: white;
    }
    .pw-modal-title {
      font-size: 18px; font-weight: 700;
      margin-bottom: 20px;
    }
    .pw-modal-close {
      position: absolute; top: 14px; right: 14px;
      background: none; border: none;
      color: #64748b; font-size: 22px; cursor: pointer;
    }
    .pw-modal-close:hover { color: white; }

    /* ── PROFILE MODAL ── */
    .pw-profile-avatar {
      width: 72px; height: 72px; border-radius: 50%;
      background: linear-gradient(135deg, #f97316, #fbbf24);
      display: flex; align-items: center; justify-content: center;
      font-size: 28px; font-weight: 700; color: white;
      margin: 0 auto 20px;
    }
    .pw-field { margin-bottom: 14px; }
    .pw-field label {
      display: block; font-size: 12px; color: #94a3b8;
      margin-bottom: 6px; font-weight: 500;
    }
    .pw-field input {
      width: 100%; height: 44px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px; color: white;
      font-size: 14px; padding: 0 14px;
      outline: none; font-family: inherit;
      box-sizing: border-box; transition: border .2s;
    }
    .pw-field input:focus { border-color: #38bdf8; }
    .pw-hint { font-size: 12px; color: #64748b; margin-bottom: 20px; }
    .pw-btn-row { display: flex; gap: 10px; justify-content: flex-end; }
    .pw-btn {
      padding: 10px 20px; border-radius: 12px;
      font-size: 14px; font-weight: 600;
      cursor: pointer; font-family: inherit; border: none;
    }
    .pw-btn.outline {
      background: none;
      border: 1px solid rgba(255,255,255,0.1);
      color: #94a3b8;
    }
    .pw-btn.primary { background: #2563eb; color: white; }
    .pw-btn:hover { opacity: .85; }

    /* ── SETTINGS MODAL ── */
    .pw-settings-item {
      display: flex; justify-content: space-between;
      align-items: center; padding: 12px 0;
      border-bottom: 1px solid rgba(255,255,255,0.06);
      font-size: 14px; color: #cbd5e1;
    }
    .pw-settings-item:last-of-type { border-bottom: none; }
    .pw-toggle { position: relative; width: 42px; height: 24px; cursor: pointer; }
    .pw-toggle input { display: none; }
    .pw-slider {
      position: absolute; inset: 0;
      background: #334155; border-radius: 24px; transition: .3s;
    }
    .pw-slider::before {
      content: ''; position: absolute;
      width: 18px; height: 18px;
      left: 3px; top: 3px;
      background: white; border-radius: 50%; transition: .3s;
    }
    .pw-toggle input:checked + .pw-slider { background: #2563eb; }
    .pw-toggle input:checked + .pw-slider::before { transform: translateX(18px); }
  `;
  document.head.appendChild(style);

  /* ════════════════════════════════════════════
     BUILD HTML
  ════════════════════════════════════════════ */
  document.body.insertAdjacentHTML('beforeend', `

    <!-- WIDGET -->
    <div id="pw-widget">
      <div id="pw-avatar">T</div>
      <div>
        <div id="pw-info-name">Người dùng</div>
        <div id="pw-info-plan">Free Plan</div>
      </div>
    </div>

    <!-- POPUP MENU -->
    <div id="pw-menu">
      <div class="pw-menu-header">
        <div class="pw-menu-avatar" id="pw-menu-avatar">T</div>
        <div>
          <div class="pw-menu-uname" id="pw-menu-name">Người dùng</div>
          <div class="pw-menu-plan">Free Plan</div>
        </div>
      </div>

      <div class="pw-item plus" id="pw-try-plus">
        <i class="ri-vip-crown-line"></i> Try Plus
      </div>
      <div class="pw-item normal" id="pw-profile-btn">
        <i class="ri-user-line"></i> Profile
      </div>
      <div class="pw-item normal" id="pw-settings-btn">
        <i class="ri-settings-3-line"></i> Settings
      </div>
      <div class="pw-item danger" id="pw-logout">
        <i class="ri-logout-box-r-line"></i> Log out
      </div>
    </div>

    <!-- PROFILE MODAL -->
    <div class="pw-modal-overlay" id="pw-profile-modal">
      <div class="pw-modal-box">
        <button class="pw-modal-close" id="pw-profile-close">✕</button>
        <div class="pw-modal-title">Chỉnh sửa hồ sơ</div>
        <div class="pw-profile-avatar" id="pw-profile-letter">T</div>
        <div class="pw-field">
          <label>Họ và tên</label>
          <input type="text" id="pw-edit-name" placeholder="Nhập tên...">
        </div>
        <div class="pw-field">
          <label>Email</label>
          <input type="text" id="pw-edit-email" readonly style="opacity:.5">
        </div>
        <p class="pw-hint">Hồ sơ giúp mọi người nhận ra bạn trong các cuộc trò chuyện nhóm.</p>
        <div class="pw-btn-row">
          <button class="pw-btn outline" id="pw-profile-cancel">Huỷ</button>
          <button class="pw-btn primary" id="pw-profile-save">Lưu</button>
        </div>
      </div>
    </div>

    <!-- SETTINGS MODAL -->
    <div class="pw-modal-overlay" id="pw-settings-modal">
      <div class="pw-modal-box">
        <button class="pw-modal-close" id="pw-settings-close">✕</button>
        <div class="pw-modal-title">⚙️ Cài đặt</div>

        <div class="pw-settings-item">
          <span>Hiệu ứng gõ chữ</span>
          <label class="pw-toggle">
            <input type="checkbox" id="st-typing" checked>
            <span class="pw-slider"></span>
          </label>
        </div>
        <div class="pw-settings-item">
          <span>Âm thanh thông báo</span>
          <label class="pw-toggle">
            <input type="checkbox" id="st-sound">
            <span class="pw-slider"></span>
          </label>
        </div>
        <div class="pw-settings-item">
          <span>Lưu lịch sử chat</span>
          <label class="pw-toggle">
            <input type="checkbox" id="st-history" checked>
            <span class="pw-slider"></span>
          </label>
        </div>
        <div class="pw-settings-item">
          <span>Chế độ tối</span>
          <label class="pw-toggle">
            <input type="checkbox" id="st-dark" checked>
            <span class="pw-slider"></span>
          </label>
        </div>

        <div class="pw-btn-row" style="margin-top:20px">
          <button class="pw-btn outline" id="pw-settings-cancel">Huỷ</button>
          <button class="pw-btn primary" id="pw-settings-save">💾 Lưu</button>
        </div>
      </div>
    </div>
  `);

  /* ════════════════════════════════════════════
     LOAD USER INFO
  ════════════════════════════════════════════ */
  const s = getSession();
  if (s) {
    const name   = s.fullname || s.email || 'Người dùng';
    const letter = name.charAt(0).toUpperCase();
    document.getElementById('pw-avatar').textContent       = letter;
    document.getElementById('pw-info-name').textContent    = name;
    document.getElementById('pw-menu-avatar').textContent  = letter;
    document.getElementById('pw-menu-name').textContent    = name;
    document.getElementById('pw-profile-letter').textContent = letter;
  }

  /* ════════════════════════════════════════════
     TOGGLE POPUP MENU
  ════════════════════════════════════════════ */
  const widget = document.getElementById('pw-widget');
  const menu   = document.getElementById('pw-menu');

  widget.addEventListener('click', e => {
    e.stopPropagation();
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
  });
  document.addEventListener('click', () => menu.style.display = 'none');
  menu.addEventListener('click', e => e.stopPropagation());

  function closeMenu() { menu.style.display = 'none'; }

  /* ════════════════════════════════════════════
     TRY PLUS → pricing.html
  ════════════════════════════════════════════ */
  document.getElementById('pw-try-plus').addEventListener('click', () => {
    window.location.href = 'pricing.html';
  });

  /* ════════════════════════════════════════════
     PROFILE MODAL
  ════════════════════════════════════════════ */
  const profileModal  = document.getElementById('pw-profile-modal');

  document.getElementById('pw-profile-btn').addEventListener('click', () => {
    closeMenu();
    const s = getSession();
    if (s) {
      document.getElementById('pw-edit-name').value  = s.fullname || '';
      document.getElementById('pw-edit-email').value = s.email    || '';
      const letter = (s.fullname || s.email || 'T').charAt(0).toUpperCase();
      document.getElementById('pw-profile-letter').textContent = letter;
    }
    profileModal.classList.add('open');
  });

  function closeProfile() { profileModal.classList.remove('open'); }

  document.getElementById('pw-profile-close').addEventListener('click',  closeProfile);
  document.getElementById('pw-profile-cancel').addEventListener('click', closeProfile);
  profileModal.addEventListener('click', e => { if (e.target === profileModal) closeProfile(); });

  document.getElementById('pw-profile-save').addEventListener('click', () => {
    const newName = document.getElementById('pw-edit-name').value.trim();
    if (!newName) return;

    try {
      const useLs = !!localStorage.getItem('devbyte_session');
      const store  = useLs ? localStorage : sessionStorage;
      const sess   = JSON.parse(store.getItem('devbyte_session') || '{}');
      sess.fullname = newName;
      store.setItem('devbyte_session', JSON.stringify(sess));

      // Cập nhật users array
      const users = JSON.parse(localStorage.getItem('devbyte_users') || '[]');
      const idx   = users.findIndex(u => u.email === sess.email);
      if (idx !== -1) {
        users[idx].fullname = newName;
        localStorage.setItem('devbyte_users', JSON.stringify(users));
      }

      // Cập nhật widget ngay lập tức
      const letter = newName.charAt(0).toUpperCase();
      document.getElementById('pw-avatar').textContent      = letter;
      document.getElementById('pw-info-name').textContent   = newName;
      document.getElementById('pw-menu-avatar').textContent = letter;
      document.getElementById('pw-menu-name').textContent   = newName;
    } catch (_) {}

    closeProfile();
  });

  /* ════════════════════════════════════════════
     SETTINGS MODAL
  ════════════════════════════════════════════ */
  const settingsModal = document.getElementById('pw-settings-modal');
  const SETTINGS_KEY  = 'devbyte_settings';

  document.getElementById('pw-settings-btn').addEventListener('click', () => {
    closeMenu();
    // Load cài đặt đã lưu
    try {
      const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
      if (saved.typing   !== undefined) document.getElementById('st-typing').checked  = saved.typing;
      if (saved.sound    !== undefined) document.getElementById('st-sound').checked   = saved.sound;
      if (saved.history  !== undefined) document.getElementById('st-history').checked = saved.history;
      if (saved.darkMode !== undefined) document.getElementById('st-dark').checked    = saved.darkMode;
    } catch (_) {}
    settingsModal.classList.add('open');
  });

  function closeSettings() { settingsModal.classList.remove('open'); }

  document.getElementById('pw-settings-close').addEventListener('click',  closeSettings);
  document.getElementById('pw-settings-cancel').addEventListener('click', closeSettings);
  settingsModal.addEventListener('click', e => { if (e.target === settingsModal) closeSettings(); });

  document.getElementById('pw-settings-save').addEventListener('click', () => {
    const saved = {
      typing:   document.getElementById('st-typing').checked,
      sound:    document.getElementById('st-sound').checked,
      history:  document.getElementById('st-history').checked,
      darkMode: document.getElementById('st-dark').checked,
    };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(saved));
    closeSettings();
  });

  /* ════════════════════════════════════════════
     LOG OUT
  ════════════════════════════════════════════ */
  document.getElementById('pw-logout').addEventListener('click', () => {
    localStorage.removeItem('devbyte_session');
    sessionStorage.removeItem('devbyte_session');
    window.location.href = 'login.html';
  });

  /* Đóng modal khi nhấn ESC */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeProfile(); closeSettings(); closeMenu(); }
  });

})();
