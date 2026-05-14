c (typing effect, sound, history, dark)
   ============================================================ */

(function () {

  /* ──────────────────────────────────────────────────
     HELPER: Toast thông báo nhỏ giữa màn hình
  ────────────────────────────────────────────────── */
  function toast(msg, type) {
    let t = document.getElementById('devbyte-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'devbyte-toast';
      t.className = 'devbyte-toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.className = 'devbyte-toast show' + (type ? ' toast-' + type : '');
    clearTimeout(t._tmr);
    t._tmr = setTimeout(() => t.classList.remove('show'), 3000);
  }

  /* ──────────────────────────────────────────────────
     HELPER: Format kích thước file
  ────────────────────────────────────────────────── */
  function fmtSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  /* ──────────────────────────────────────────────────
     HELPER: Icon theo đuôi file
  ────────────────────────────────────────────────── */
  function fileIcon(name) {
    const ext = (name.split('.').pop() || '').toLowerCase();
    const map = {
      pdf:'📄', doc:'📝', docx:'📝',
      xls:'📊', xlsx:'📊',
      ppt:'📑', pptx:'📑',
      zip:'🗜️', rar:'🗜️',
      txt:'📃', csv:'📋',
      mp3:'🎵', wav:'🎵', mp4:'🎬',
    };
    return map[ext] || '📎';
  }

  /* ──────────────────────────────────────────────────
     HELPER: Thêm bubble user vào chatBox
     (đúng class của logic.js: message user-message)
  ────────────────────────────────────────────────── */
  function appendBubble(innerHtml) {
    const box = document.getElementById('chatBox');
    if (!box) return;
    const wrap = document.createElement('div');
    wrap.className = 'message user-message';
    wrap.innerHTML = innerHtml;
    box.appendChild(wrap);
    box.scrollTop = box.scrollHeight;
  }

  /* ══════════════════════════════════════════════════
     TOOL 1 – FILE UPLOAD  (#btnFile)
  ══════════════════════════════════════════════════ */
  function initFile() {
    const btn = document.getElementById('btnFile');
    if (!btn) return;

    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar,.mp3,.mp4,.wav';
    inp.style.display = 'none';
    document.body.appendChild(inp);

    btn.addEventListener('click', () => inp.click());

    inp.addEventListener('change', () => {
      const f = inp.files[0];
      if (!f) return;
      appendBubble(`
        <div class="file-preview-bubble">
          <span class="fpb-icon">${fileIcon(f.name)}</span>
          <div class="fpb-info">
            <span class="fpb-name">${f.name}</span>
            <span class="fpb-size">${fmtSize(f.size)}</span>
          </div>
        </div>`);
      toast('✅ Đã đính kèm: ' + f.name);
      inp.value = '';
      btn.classList.add('active-tool');
      setTimeout(() => btn.classList.remove('active-tool'), 1500);
    });
  }

  /* ══════════════════════════════════════════════════
     TOOL 2 – VOICE RECORDING  (#btnVoice)
  ══════════════════════════════════════════════════ */
  function initVoice() {
    const btn = document.getElementById('btnVoice');
    if (!btn) return;

    let recorder = null, chunks = [], active = false;

    btn.addEventListener('click', async () => {
      /* Dừng ghi */
      if (active) {
        recorder.stop();
        active = false;
        btn.classList.remove('recording');
        return;
      }
      /* Bắt đầu ghi */
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        recorder = new MediaRecorder(stream);
        chunks = [];

        recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };

        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/webm' });
          const url  = URL.createObjectURL(blob);
          appendBubble(`
            <div class="audio-preview-bubble">
              <span style="font-size:20px">🎤</span>
              <audio controls src="${url}"
                style="max-width:220px;height:34px;vertical-align:middle;"></audio>
            </div>`);
          toast('✅ Đã lưu đoạn ghi âm');
          stream.getTracks().forEach(t => t.stop());
        };

        recorder.start();
        active = true;
        btn.classList.add('recording');
        toast('🔴 Đang ghi âm… Nhấn lại để dừng', 'recording');
      } catch (err) {
        toast('❌ Không thể truy cập micro: ' + err.message, 'error');
      }
    });
  }

  /* ══════════════════════════════════════════════════
     TOOL 3 – IMAGE UPLOAD  (#btnImage)
  ══════════════════════════════════════════════════ */
  function initImageUpload() {
    const btn = document.getElementById('btnImage');
    if (!btn) return;

    const inp = document.createElement('input');
    inp.type  = 'file';
    inp.accept = 'image/png,image/jpeg,image/jpg,image/webp,image/gif,image/bmp,image/svg+xml';
    inp.style.display = 'none';
    document.body.appendChild(inp);

    btn.addEventListener('click', () => inp.click());

    inp.addEventListener('change', () => {
      const f = inp.files[0];
      if (!f) return;

      const reader = new FileReader();
      reader.onload = e => {
        const src = e.target.result;
        /* onclick dùng string để tránh closure scope issue trong innerHTML */
        appendBubble(`
          <div class="img-preview-bubble">
            <img src="${src}" alt="${f.name}"
              style="max-width:220px;max-height:180px;border-radius:12px;
                     cursor:zoom-in;border:1px solid rgba(255,255,255,.08);"
              onclick="
                var ov=document.createElement('div');
                ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.92);'
                  +'display:flex;align-items:center;justify-content:center;'
                  +'z-index:99999;cursor:zoom-out;animation:fadeIn .2s';
                var im=document.createElement('img');
                im.src='${src}';
                im.style.cssText='max-width:90vw;max-height:90vh;border-radius:14px;';
                ov.appendChild(im);
                ov.onclick=function(){document.body.removeChild(ov)};
                document.body.appendChild(ov);
              ">
            <span class="img-name">${f.name} · ${fmtSize(f.size)}</span>
          </div>`);
        toast('✅ Đã thêm ảnh: ' + f.name);
      };
      reader.readAsDataURL(f);
      inp.value = '';

      btn.classList.add('active-tool');
      setTimeout(() => btn.classList.remove('active-tool'), 1500);
    });
  }

  /* ══════════════════════════════════════════════════
     TOOL 4 – PRODUCT SEARCH  (#btnSearch)
     Tìm trong mảng products[] từ data.js
  ══════════════════════════════════════════════════ */
  function initSearch() {
    const btn = document.getElementById('btnSearch');
    if (!btn) return;

    /* Tạo overlay */
    const ov = document.createElement('div');
    ov.id = 'abSearchOverlay';
    ov.style.cssText =
      'display:none;position:fixed;top:0;left:0;right:0;' +
      'background:rgba(15,23,42,.96);backdrop-filter:blur(10px);' +
      'z-index:9100;padding:16px 20px;' +
      'border-bottom:1px solid rgba(255,255,255,.08);';
    ov.innerHTML = `
      <div style="max-width:580px;margin:0 auto;display:flex;gap:10px;align-items:center;">
        <i class="ri-search-line" style="font-size:20px;color:#38bdf8;flex-shrink:0"></i>
        <input id="abSearchInput" type="text" placeholder="Tìm tên điện thoại..."
          style="flex:1;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);
                 border-radius:12px;padding:10px 14px;color:white;font-size:14px;
                 outline:none;font-family:'Inter',sans-serif;">
        <button id="abSearchClose"
          style="background:none;border:none;color:#94a3b8;font-size:22px;
                 cursor:pointer;padding:0 4px;">✕</button>
      </div>
      <div id="abSearchResults"
        style="max-width:580px;margin:10px auto 0;max-height:52vh;overflow-y:auto;"></div>`;
    document.body.appendChild(ov);

    const inp  = document.getElementById('abSearchInput');
    const res  = document.getElementById('abSearchResults');
    const cBtn = document.getElementById('abSearchClose');

    /* Lấy dữ liệu từ data.js */
    function getData() {
      if (typeof products !== 'undefined') return products;
      return [];
    }

    function doSearch(kw) {
      res.innerHTML = '';
      if (!kw.trim()) return;
      const q = kw.toLowerCase();

      const found = getData().filter(p =>
        (p.name  || '').toLowerCase().includes(q) ||
        (p.brand || '').toLowerCase().includes(q)
      );

      if (!found.length) {
        res.innerHTML =
          '<p style="color:#64748b;font-size:13px;padding:8px 4px">Không tìm thấy sản phẩm phù hợp.</p>';
        return;
      }

      found.slice(0, 8).forEach(p => {
        const name  = p.name  || 'Sản phẩm';
        const price = p.price || '';
        const img   = p.image || p.img || '';
        const bat   = p.battery ? '🔋 ' + p.battery + 'mAh' : '';

        const card = document.createElement('div');
        card.style.cssText =
          'display:flex;gap:12px;align-items:center;padding:10px 12px;margin-bottom:8px;' +
          'cursor:pointer;background:rgba(255,255,255,.05);' +
          'border:1px solid rgba(255,255,255,.08);border-radius:14px;transition:background .2s;';
        card.onmouseenter = () => card.style.background = 'rgba(255,255,255,.09)';
        card.onmouseleave = () => card.style.background = 'rgba(255,255,255,.05)';

        card.innerHTML = `
          ${img
            ? `<img src="${img}" style="width:48px;height:48px;object-fit:cover;
                 border-radius:10px;flex-shrink:0" onerror="this.style.display='none'">`
            : '<span style="font-size:28px;flex-shrink:0">📱</span>'}
          <div style="flex:1;min-width:0">
            <div style="font-size:14px;font-weight:600;color:#e2e8f0">${name}</div>
            <div style="font-size:13px;color:#38bdf8;margin-top:3px">
              ${price ? '💰 ' + Number(price).toLocaleString('vi-VN') + ' ₫' : ''}
              ${bat ? '&nbsp;· &nbsp;' + bat : ''}
            </div>
          </div>
          <i class="ri-arrow-right-s-line" style="color:#475569;font-size:18px;flex-shrink:0"></i>`;

        /* Click → điền vào ô chat */
        card.addEventListener('click', () => {
          const chatIn = document.getElementById('userInput');
          if (chatIn) {
            chatIn.value = 'Cho mình biết thêm về ' + name;
            chatIn.focus();
          }
          closeSearch();
        });

        res.appendChild(card);
      });
    }

    let isOpen = false;

    function openSearch() {
      ov.style.display = 'block';
      isOpen = true;
      btn.classList.add('active-tool');
      setTimeout(() => inp.focus(), 60);
    }

    function closeSearch() {
      ov.style.display = 'none';
      isOpen = false;
      btn.classList.remove('active-tool');
      inp.value = '';
      res.innerHTML = '';
    }

    btn.addEventListener('click', () => isOpen ? closeSearch() : openSearch());
    cBtn.addEventListener('click', closeSearch);
    inp.addEventListener('input', e => doSearch(e.target.value));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSearch(); });
  }

  /* ══════════════════════════════════════════════════
     TOOL 5 – SETTINGS MODAL  (#btnSettings)
  ══════════════════════════════════════════════════ */
  function initSettings() {
    const btn = document.getElementById('btnSettings');
    if (!btn) return;

    const ov = document.createElement('div');
    ov.className = 'modal-overlay';
    ov.id = 'settingsModal';
    ov.innerHTML = `
      <div class="modal-box" style="max-width:420px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px">
          <h3 style="margin:0;font-size:17px">⚙️ Cài đặt</h3>
          <button id="settingsClose"
            style="background:none;border:none;color:#94a3b8;font-size:22px;cursor:pointer">✕</button>
        </div>

        <div class="settings-item">
          <span>Hiệu ứng gõ chữ</span>
          <label class="toggle-switch">
            <input type="checkbox" id="stTyping" checked>
            <span class="toggle-slider"></span>
          </label>
        </div>
        <div class="settings-item">
          <span>Âm thanh thông báo</span>
          <label class="toggle-switch">
            <input type="checkbox" id="stSound">
            <span class="toggle-slider"></span>
          </label>
        </div>
        <div class="settings-item">
          <span>Lưu lịch sử chat</span>
          <label class="toggle-switch">
            <input type="checkbox" id="stHistory" checked>
            <span class="toggle-slider"></span>
          </label>
        </div>
        <div class="settings-item" style="border-bottom:none">
          <span>Chế độ tối</span>
          <label class="toggle-switch">
            <input type="checkbox" id="stDark" checked>
            <span class="toggle-slider"></span>
          </label>
        </div>

        <div style="display:flex;gap:10px;margin-top:20px;justify-content:flex-end">
          <button class="btn-modal btn-modal-outline" id="settingsCancel">Huỷ</button>
          <button class="btn-modal" id="settingsSave">💾 Lưu</button>
        </div>
      </div>`;
    document.body.appendChild(ov);

    const KEY = 'devbyte_settings';

    function openSettings() {
      try {
        const s = JSON.parse(localStorage.getItem(KEY) || '{}');
        if (s.typing   !== undefined) document.getElementById('stTyping').checked  = s.typing;
        if (s.sound    !== undefined) document.getElementById('stSound').checked   = s.sound;
        if (s.history  !== undefined) document.getElementById('stHistory').checked = s.history;
        if (s.darkMode !== undefined) document.getElementById('stDark').checked    = s.darkMode;
      } catch (_) {}
      ov.classList.add('show');
    }

    function closeSettings() { ov.classList.remove('show'); }

    function saveSettings() {
      const s = {
        typing:   document.getElementById('stTyping').checked,
        sound:    document.getElementById('stSound').checked,
        history:  document.getElementById('stHistory').checked,
        darkMode: document.getElementById('stDark').checked,
      };
      localStorage.setItem(KEY, JSON.stringify(s));
      document.body.classList.toggle('light-mode', !s.darkMode);
      toast('✅ Đã lưu cài đặt');
      closeSettings();
    }

    btn.addEventListener('click', openSettings);
    ov.addEventListener('click',  e => { if (e.target === ov) closeSettings(); });
    document.getElementById('settingsClose').addEventListener('click',  closeSettings);
    document.getElementById('settingsCancel').addEventListener('click', closeSettings);
    document.getElementById('settingsSave').addEventListener('click',   saveSettings);
  }

  /* ══════════════════════════════════════════════════
     INIT – Gọi khi DOM sẵn sàng
  ══════════════════════════════════════════════════ */
  function init() {
    initFile();
    initVoice();
    initImageUpload();
    initSearch();
    initSettings();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
