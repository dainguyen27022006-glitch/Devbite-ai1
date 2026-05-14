// ============================================================
// auth.js — DevByte AI | Nguyễn Tuấn Phát Đại
// Quản lý: Authentication, Session, Search/Filter, Modal Utils
// ============================================================

// ===== SESSION HELPERS =====

const Auth = {

    /** Lấy session hiện tại (localStorage ưu tiên, fallback sessionStorage) */
    getSession() {
        const ls = localStorage.getItem('devbyte_session');
        const ss = sessionStorage.getItem('devbyte_session');
        try { return ls ? JSON.parse(ls) : ss ? JSON.parse(ss) : null; }
        catch { return null; }
    },

    /** Kiểm tra có đang đăng nhập không */
    isLoggedIn() {
        const s = this.getSession();
        return s && s.loggedIn === true;
    },

    /** Đăng xuất */
    logout() {
        localStorage.removeItem('devbyte_session');
        sessionStorage.removeItem('devbyte_session');
        window.location.href = 'login.html';
    },

    /** Bảo vệ trang — gọi ở đầu các trang cần login */
    requireLogin(redirectTo = 'login.html') {
        if (!this.isLoggedIn()) {
            window.location.href = redirectTo;
        }
    },

    /** Hiển thị tên user ở element (nếu có) */
    displayUser(elementId) {
        const s = this.getSession();
        const el = document.getElementById(elementId);
        if (el && s) el.textContent = s.fullname || s.email;
    },

    /** Lấy tất cả users đã đăng ký */
    getAllUsers() {
        try { return JSON.parse(localStorage.getItem('devbyte_users') || '[]'); }
        catch { return []; }
    }
};

// ===== MODAL UTILS =====

const Modal = {

    /** Mở modal theo ID */
    open(id) {
        const el = document.getElementById(id);
        if (el) el.classList.add('show');
    },

    /** Đóng modal theo ID */
    close(id) {
        const el = document.getElementById(id);
        if (el) el.classList.remove('show');
    },

    /** Đóng modal khi click overlay */
    bindOverlayClose(id) {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('click', function(e) {
            if (e.target === el) Modal.close(id);
        });
    },

    /** Tạo và show toast notification */
    toast(message, type = 'info', duration = 3000) {
        const colors = {
            success: { bg: 'rgba(34,197,94,.15)', border: 'rgba(34,197,94,.3)', icon: '✅' },
            error:   { bg: 'rgba(239,68,68,.15)', border: 'rgba(239,68,68,.3)',  icon: '❌' },
            info:    { bg: 'rgba(56,189,248,.15)', border: 'rgba(56,189,248,.3)', icon: 'ℹ️' },
        };
        const c = colors[type] || colors.info;

        const toast = document.createElement('div');
        toast.style.cssText = `
            position:fixed; bottom:24px; right:24px; z-index:9999;
            background:${c.bg}; border:1px solid ${c.border};
            backdrop-filter:blur(20px);
            border-radius:16px; padding:14px 20px;
            color:white; font-size:14px; font-family:'Inter',sans-serif;
            display:flex; align-items:center; gap:10px;
            box-shadow:0 10px 30px rgba(0,0,0,.3);
            transform:translateY(20px); opacity:0;
            transition: transform .3s, opacity .3s;
            max-width:320px;
        `;
        toast.innerHTML = `<span style="font-size:16px">${c.icon}</span><span>${message}</span>`;
        document.body.appendChild(toast);

        requestAnimationFrame(() => {
            toast.style.transform = 'translateY(0)';
            toast.style.opacity = '1';
        });

        setTimeout(() => {
            toast.style.transform = 'translateY(20px)';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
};

// ===== SEARCH & FILTER ENGINE =====

const SearchFilter = {

    /**
     * Tìm kiếm full-text trong mảng objects
     * @param {Array} data - Mảng dữ liệu cần tìm
     * @param {string} query - Chuỗi tìm kiếm
     * @param {Array<string>} fields - Các field cần tìm trong (vd: ['name', 'brand'])
     * @returns {Array} Kết quả lọc
     */
    search(data, query, fields) {
        if (!query || !query.trim()) return data;
        const q = query.toLowerCase().trim();
        return data.filter(item =>
            fields.some(field => {
                const val = item[field];
                return val && String(val).toLowerCase().includes(q);
            })
        );
    },

    /**
     * Lọc theo khoảng giá
     * @param {Array} data
     * @param {number} min
     * @param {number} max
     * @param {string} priceField - tên field giá (default: 'price')
     */
    filterByPrice(data, min, max, priceField = 'price') {
        return data.filter(item => {
            const p = item[priceField];
            if (min !== null && min !== '' && p < Number(min)) return false;
            if (max !== null && max !== '' && p > Number(max)) return false;
            return true;
        });
    },

    /**
     * Sắp xếp dữ liệu
     * @param {Array} data
     * @param {string} field - field cần sort
     * @param {'asc'|'desc'} direction
     */
    sort(data, field, direction = 'asc') {
        return [...data].sort((a, b) => {
            const va = a[field], vb = b[field];
            if (typeof va === 'string') {
                return direction === 'asc'
                    ? va.localeCompare(vb)
                    : vb.localeCompare(va);
            }
            return direction === 'asc' ? va - vb : vb - va;
        });
    },

    /**
     * Lọc theo một field cụ thể (vd: brand, category)
     * @param {Array} data
     * @param {string} field
     * @param {*} value - nếu null/'' bỏ qua filter
     */
    filterBy(data, field, value) {
        if (value === null || value === '' || value === 'all') return data;
        return data.filter(item => String(item[field]).toLowerCase() === String(value).toLowerCase());
    },

    /**
     * Kết hợp nhiều bộ lọc liên tiếp
     * @param {Array} data - Dữ liệu gốc
     * @param {Object} filters - { query, fields, minPrice, maxPrice, priceField, sortField, sortDir, filterField, filterValue }
     */
    applyAll(data, filters = {}) {
        let result = [...data];

        if (filters.query && filters.fields) {
            result = this.search(result, filters.query, filters.fields);
        }
        if (filters.filterField) {
            result = this.filterBy(result, filters.filterField, filters.filterValue);
        }
        if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
            result = this.filterByPrice(
                result,
                filters.minPrice ?? '',
                filters.maxPrice ?? '',
                filters.priceField || 'price'
            );
        }
        if (filters.sortField) {
            result = this.sort(result, filters.sortField, filters.sortDir || 'asc');
        }

        return result;
    },

    /**
     * Pagination helper
     * @param {Array} data - Dữ liệu đã lọc
     * @param {number} page - Trang hiện tại (bắt đầu từ 1)
     * @param {number} perPage - Số item mỗi trang
     * @returns {{ items: Array, total: number, totalPages: number }}
     */
    paginate(data, page = 1, perPage = 9) {
        const total = data.length;
        const totalPages = Math.ceil(total / perPage);
        const start = (page - 1) * perPage;
        return {
            items: data.slice(start, start + perPage),
            total,
            totalPages,
            page
        };
    }
};

// ===== FORM VALIDATION UTILS =====

const Validate = {

    required(val, label = 'Trường này') {
        if (!val || !String(val).trim()) return `${label} không được để trống`;
        return null;
    },

    minLength(val, min, label = 'Trường này') {
        if (String(val).trim().length < min) return `${label} phải có ít nhất ${min} ký tự`;
        return null;
    },

    email(val) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'Email không hợp lệ';
        return null;
    },

    phone(val) {
        if (!/^(0|\+84)[3-9]\d{8}$/.test(String(val).replace(/\s/g, '')))
            return 'Số điện thoại Việt Nam không hợp lệ';
        return null;
    },

    passwordStrength(val) {
        if (val.length < 8) return 'Mật khẩu phải có ít nhất 8 ký tự';
        return null;
    },

    passwordMatch(val, confirm) {
        if (val !== confirm) return 'Mật khẩu xác nhận không khớp';
        return null;
    },

    /**
     * Chạy nhiều rule, trả về lỗi đầu tiên hoặc null nếu hợp lệ
     * @param {*} val
     * @param {Array<Function>} rules - mảng hàm nhận val và trả về lỗi string | null
     */
    run(val, rules) {
        for (const rule of rules) {
            const err = rule(val);
            if (err) return err;
        }
        return null;
    }
};

// ===== DOM HELPER =====

const DOM = {
    /** Render danh sách sản phẩm vào container */
    renderList(containerId, items, renderFn, emptyMsg = 'Không tìm thấy sản phẩm nào.') {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!items || items.length === 0) {
            container.innerHTML = `
                <div style="text-align:center;padding:60px 20px;color:#94a3b8;font-size:15px;">
                    🔍 ${emptyMsg}
                </div>`;
            return;
        }

        container.innerHTML = items.map(renderFn).join('');
    },

    /** Render pagination buttons */
    renderPagination(containerId, { page, totalPages }, onPageClick) {
        const container = document.getElementById(containerId);
        if (!container || totalPages <= 1) {
            if (container) container.innerHTML = '';
            return;
        }

        let html = '';
        for (let i = 1; i <= totalPages; i++) {
            html += `
                <button
                    onclick="(${onPageClick.toString()})(${i})"
                    style="
                        padding:8px 14px; border-radius:10px; border:1px solid
                        ${i === page ? '#2563eb' : 'rgba(255,255,255,.08)'};
                        background:${i === page ? 'rgba(37,99,235,.3)' : 'rgba(255,255,255,.04)'};
                        color:${i === page ? 'white' : '#94a3b8'};
                        cursor:pointer; font-size:13px; font-family:'Inter',sans-serif;
                        transition:.2s; margin:2px;
                    "
                >${i}</button>
            `;
        }
        container.innerHTML = html;
    }
};

// ===== AUTO-BIND LOGOUT BUTTONS =====

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-action="logout"]').forEach(btn => {
        btn.addEventListener('click', () => Auth.logout());
    });
    document.querySelectorAll('[data-modal-close]').forEach(btn => {
        btn.addEventListener('click', () => Modal.close(btn.dataset.modalClose));
    });
});
