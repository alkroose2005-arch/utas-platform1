/* ==========================================================================
   common.js — دوال مشتركة لكل الصفحات: الاتصال بالـ API، الشريط العلوي، الحماية، أدوات مساعدة
   كل النصوص القادمة من السيرفر تُعرض بـ textContent (حماية من XSS)
   ========================================================================== */
(function () {
    'use strict';

    const API_BASE = 'api/'; // مسار نسبي: يعمل مهما كان اسم المجلد داخل htdocs

    /* ---------- الاتصال بالـ API ---------- */

    class ApiError extends Error {
        constructor(message, status, fields) {
            super(message);
            this.status = status || 0;
            this.fields = fields || {};
        }
    }

    // api('auth/login.php', { method:'POST', json:{...} })  |  api('listings/save.php', { method:'POST', form: FormData })
    async function api(path, opts) {
        opts = opts || {};
        let url = API_BASE + path;
        if (opts.query) {
            const qs = new URLSearchParams();
            Object.keys(opts.query).forEach(function (k) {
                const v = opts.query[k];
                if (v !== undefined && v !== null && v !== '') qs.set(k, v);
            });
            const s = qs.toString();
            if (s) url += '?' + s;
        }
        const init = { method: opts.method || 'GET', credentials: 'same-origin', headers: {} };
        if (opts.json !== undefined) {
            init.headers['Content-Type'] = 'application/json';
            init.body = JSON.stringify(opts.json);
        } else if (opts.form) {
            init.body = opts.form; // المتصفح يضبط Content-Type مع الـ boundary بنفسه
        }

        let res;
        try {
            res = await fetch(url, init);
        } catch (e) {
            throw new ApiError('تعذر الاتصال بالسيرفر. تأكد من تشغيل Apache و MySQL في XAMPP وأن الموقع مفتوح من http://localhost/...', 0);
        }
        let data = null;
        try {
            data = await res.json();
        } catch (e) { /* ليس JSON */ }
        if (!data) {
            throw new ApiError('استجابة غير متوقعة من السيرفر. تأكد أن PHP يعمل وأن المجلد api موجود (الحالة ' + res.status + ')', res.status);
        }
        if (!data.ok) {
            throw new ApiError(data.error || 'حدث خطأ غير متوقع', res.status, data.fields);
        }
        return data;
    }

    /* ---------- عناصر DOM ---------- */

    // el('div', { class:'x', onclick: fn }, 'نص', childEl)
    function el(tag, attrs) {
        const node = document.createElement(tag);
        if (attrs) {
            Object.keys(attrs).forEach(function (k) {
                const v = attrs[k];
                if (v === null || v === undefined || v === false) return;
                if (k === 'class') node.className = v;
                else if (k === 'text') node.textContent = v;
                else if (k.indexOf('on') === 0 && typeof v === 'function') node.addEventListener(k.slice(2), v);
                else node.setAttribute(k, v === true ? '' : v);
            });
        }
        for (let i = 2; i < arguments.length; i++) {
            const c = arguments[i];
            if (c === null || c === undefined || c === false) continue;
            node.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c);
        }
        return node;
    }

    function clear(node) {
        while (node.firstChild) node.removeChild(node.firstChild);
        return node;
    }

    /* ---------- تنسيق ---------- */

    function num(v) {
        return Number(v).toLocaleString('en-US', { maximumFractionDigits: 3 });
    }

    // السعر: 3 ريال | 2 - 5 ريال | السعر عند التواصل
    function fmtPrice(item, long) {
        const unit = long ? 'ريال عماني' : 'ريال';
        if (item.price === null || item.price === undefined) return 'السعر عند التواصل';
        if (item.price_max !== null && item.price_max !== undefined) {
            return num(item.price) + ' - ' + num(item.price_max) + ' ' + unit;
        }
        return num(item.price) + ' ' + unit;
    }

    function fmtDate(s) {
        return s ? String(s).slice(0, 10) : '';
    }

    const ROLE_LABELS = { student: 'طالب', owner: 'صاحب مشروع', admin: 'مدير' };
    const STATUS_LABELS = { active: 'نشط', removed: 'مخفي' };

    /* ---------- تنبيهات ونماذج ---------- */

    // showAlert(boxEl, 'نص', 'error'|'success'|'info')  —  showAlert(boxEl) لإخفائه
    function showAlert(box, message, type) {
        if (!box) return;
        if (!message) {
            box.hidden = true;
            box.textContent = '';
            return;
        }
        box.classList.remove('alert-error', 'alert-success', 'alert-info');
        box.classList.add('alert', 'alert-' + (type || 'error'));
        box.textContent = message;
        box.hidden = false;
        box.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    function clearFieldErrors(form) {
        form.querySelectorAll('.field-error').forEach(function (n) { n.remove(); });
        form.querySelectorAll('.invalid').forEach(function (n) { n.classList.remove('invalid'); });
    }

    // يعرض أخطاء الحقول القادمة من السيرفر تحت كل حقل (المفتاح = name الحقل)
    function showFieldErrors(form, fields) {
        clearFieldErrors(form);
        let first = null;
        Object.keys(fields || {}).forEach(function (name) {
            const input = form.querySelector('[name="' + name + '"]') || form.querySelector('[name="' + name + '[]"]');
            if (!input) return;
            input.classList.add('invalid');
            const group = input.closest('.form-group') || input.parentNode;
            group.appendChild(el('span', { class: 'field-error', text: fields[name] }));
            if (!first) first = input;
        });
        if (first && first.focus) first.focus();
    }

    function setBusy(btn, busy, busyText) {
        if (!btn) return;
        if (busy) {
            btn.dataset.label = btn.textContent;
            btn.textContent = busyText || 'جارٍ التنفيذ...';
            btn.disabled = true;
        } else {
            if (btn.dataset.label) btn.textContent = btn.dataset.label;
            btn.disabled = false;
        }
    }

    /* ---------- الجلسة والشريط العلوي ---------- */

    function currentPage() {
        const name = location.pathname.split('/').pop() || 'index.html';
        return name + location.search;
    }

    function homeFor(role) {
        if (role === 'admin') return 'admin.html';
        if (role === 'owner') return 'dashboard.html';
        return 'index.html';
    }

    // يسمح فقط بصفحات داخلية (منع التحويل إلى مواقع خارجية)
    function safeNext(next) {
        return /^[a-z_]+\.html(\?[\w=&%.\-]*)?$/i.test(next || '') ? next : null;
    }

    function pageBanner(message) {
        if (document.querySelector('.site-banner')) return;
        document.body.insertBefore(el('div', { class: 'site-banner', text: message }), document.body.firstChild);
    }

    function renderNav(user) {
        const nav = document.getElementById('navLinks');
        if (!nav) return;
        clear(nav);
        const here = location.pathname.split('/').pop() || 'index.html';
        const link = function (href, text, cls) {
            const active = href === here ? ' active' : '';
            return el('a', { href: href, class: ((cls || '') + active).trim() || null, text: text });
        };

        // زر تبديل اللغة (عربي <-> English)
        const langButton = function () {
            nav.appendChild(el('a', {
                href: '#',
                class: 'lang-toggle',
                title: 'Language / اللغة',
                text: I18n.lang() === 'en' ? 'العربية' : 'English',
                onclick: function (e) { e.preventDefault(); I18n.set(I18n.lang() === 'en' ? 'ar' : 'en'); }
            }));
        };

        nav.appendChild(link('index.html', 'الرئيسية'));
        if (!user) {
            nav.appendChild(link('login.html', 'تسجيل الدخول'));
            nav.appendChild(link('register.html', 'حساب جديد', 'btn-register'));
            langButton();
            return;
        }
        if (user.role === 'owner') nav.appendChild(link('dashboard.html', 'لوحة التحكم'));
        if (user.role === 'admin') nav.appendChild(link('admin.html', 'لوحة الأدمن'));
        nav.appendChild(el('a', {
            href: '#',
            class: 'btn-register',
            text: 'تسجيل خروج',
            onclick: async function (e) {
                e.preventDefault();
                try { await api('auth/logout.php', { method: 'POST' }); } catch (err) { /* نكمل الخروج */ }
                location.href = 'index.html';
            }
        }));
        langButton();
    }

    // تُستدعى في أول كل صفحة. opts.roles = الأدوار المسموح لها بالصفحة (بدونها الصفحة عامة)
    // تعيد المستخدم الحالي أو null (وتحوّل الزائر تلقائياً إذا كانت الصفحة محمية)
    async function initPage(opts) {
        opts = opts || {};
        if (location.protocol === 'file:') {
            pageBanner('الموقع مفتوح كملف مباشر. افتحه عبر XAMPP من الرابط: http://localhost/utas-platform/');
        }
        let user = null;
        try {
            user = (await api('auth/me.php')).user;
        } catch (e) {
            pageBanner(e.message);
        }
        renderNav(user);
        if (opts.roles) {
            if (!user) {
                location.replace('login.html?next=' + encodeURIComponent(currentPage()));
                return new Promise(function () { /* نوقف التنفيذ حتى يتم التحويل */ });
            }
            if (opts.roles.indexOf(user.role) === -1) {
                location.replace(homeFor(user.role));
                return new Promise(function () {});
            }
        }
        return user;
    }

    // يحوّل رقم الهاتف إلى صيغة واتساب الدولية (أرقام فقط بدون + أو 00).
    // الرقم العُماني المحلي (8 أرقام) يأخذ رمز الدولة 968 تلقائياً. يعيد '' إذا الرقم لا يصلح.
    function waNumber(phone) {
        const raw = String(phone || '').trim();
        const international = /^(\+|00)/.test(raw);
        let d = raw.replace(/\D/g, '');
        if (/^00/.test(d)) d = d.slice(2);
        if (!international && d.length === 8) d = '968' + d;
        return d.length >= 8 && d.length <= 15 ? d : '';
    }

    function debounce(fn, ms) {
        let t;
        return function () {
            const args = arguments;
            clearTimeout(t);
            t = setTimeout(function () { fn.apply(null, args); }, ms);
        };
    }

    // ترقيم: pager(containerEl, data, goToPage) حيث data = { page, total_pages }
    function renderPager(container, data, onPage) {
        clear(container);
        if (!data || data.total_pages <= 1) return;
        container.appendChild(el('button', {
            type: 'button', text: 'السابق', disabled: data.page <= 1,
            onclick: function () { onPage(data.page - 1); }
        }));
        container.appendChild(el('span', { text: 'صفحة ' + data.page + ' من ' + data.total_pages }));
        container.appendChild(el('button', {
            type: 'button', text: 'التالي', disabled: data.page >= data.total_pages,
            onclick: function () { onPage(data.page + 1); }
        }));
    }

    // صورة المنتج أو مكان بديل
    function imageOrPlaceholder(url, alt, placeholderClass) {
        if (url) return el('img', { src: url, alt: alt || '', loading: 'lazy' });
        return el('div', { class: placeholderClass || 'card-img-placeholder', text: 'لا توجد صورة' });
    }

    window.App = {
        api: api, ApiError: ApiError, el: el, clear: clear, fmtPrice: fmtPrice, fmtDate: fmtDate,
        ROLE_LABELS: ROLE_LABELS, STATUS_LABELS: STATUS_LABELS,
        showAlert: showAlert, showFieldErrors: showFieldErrors, clearFieldErrors: clearFieldErrors, setBusy: setBusy,
        initPage: initPage, homeFor: homeFor, safeNext: safeNext, currentPage: currentPage,
        waNumber: waNumber, debounce: debounce, renderPager: renderPager, imageOrPlaceholder: imageOrPlaceholder
    };
})();
