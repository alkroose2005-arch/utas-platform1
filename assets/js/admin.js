// لوحة الأدمن: إحصائيات، مستخدمون، منتجات ومشاريع (api/admin/*)
(function () {
    'use strict';
    const { api, el, clear, fmtPrice, fmtDate, showAlert, debounce, renderPager, initPage, ROLE_LABELS } = App;

    const alertBox = document.getElementById('pageAlert');

    function th(labels) {
        return el('tr', {}, ...labels.map(function (t) { return el('th', { text: t }); }));
    }

    function emptyRow(cols, text) {
        return el('tr', {}, el('td', { colspan: cols, class: 'empty-state', text: text }));
    }

    async function act(fn) {
        try { await fn(); } catch (e) { showAlert(alertBox, e.message, 'error'); }
    }

    /* ---------- الإحصائيات ---------- */
    async function loadStats() {
        const s = await api('admin/stats.php');
        const sum = function (o) { return Object.keys(o).reduce(function (a, k) { return a + o[k]; }, 0); };
        document.getElementById('statUsers').textContent = sum(s.users);
        document.getElementById('statBusinesses').textContent = sum(s.businesses);
        document.getElementById('statListings').textContent = sum(s.listings);
        document.getElementById('statHidden').textContent = s.businesses.removed + s.listings.removed;
    }

    /* ---------- المستخدمون ---------- */
    const users = { q: '', role: '', page: 1 };
    const userRows = document.getElementById('userRows');

    async function loadUsers() {
        try {
            const d = await api('admin/users.php', { query: { q: users.q, role: users.role, page: users.page } });
            clear(userRows);
            if (!d.items.length) userRows.appendChild(emptyRow(6, 'لا يوجد مستخدمون مطابقون.'));
            d.items.forEach(function (u) {
                userRows.appendChild(el('tr', {},
                    el('td', { text: u.user_id }),
                    el('td', { text: u.full_name }),
                    el('td', { text: u.email }),
                    el('td', {}, el('span', { class: 'role-badge role-' + u.role, text: ROLE_LABELS[u.role] || u.role })),
                    el('td', { text: fmtDate(u.created_at) }),
                    el('td', {}, u.role === 'admin' ? el('span', { class: 'cell-sub', text: 'محمي' }) : el('button', {
                        type: 'button', class: 'btn-delete', text: 'حذف',
                        onclick: function () {
                            if (!confirm('حذف المستخدم "' + u.full_name + '" مع كل مشاريعه ومنتجاته وصوره نهائياً؟')) return;
                            act(async function () {
                                await api('admin/delete_user.php', { method: 'POST', json: { user_id: u.user_id } });
                                await Promise.all([loadUsers(), loadContent(), loadStats()]);
                            });
                        }
                    }))
                ));
            });
            renderPager(document.getElementById('userPager'), d, function (p) { users.page = p; loadUsers(); });
        } catch (e) {
            showAlert(alertBox, e.message, 'error');
        }
    }

    /* ---------- المحتوى: منتجات / مشاريع ---------- */
    const content = { type: 'listings', q: '', status: '', page: 1 };
    const contentHead = document.getElementById('contentHead');
    const contentRows = document.getElementById('contentRows');

    function statusCell(status) {
        return el('td', {}, el('span', { class: status === 'active' ? 'status-active' : 'status-removed', text: status === 'active' ? 'نشط' : 'مخفي' }));
    }

    function actions(kind, id, status, name, extra) {
        return el('td', {},
            extra || null,
            el('button', {
                type: 'button', class: status === 'active' ? 'btn-warn' : 'btn-approve', text: status === 'active' ? 'إخفاء' : 'إظهار',
                onclick: function () {
                    act(async function () {
                        await api('admin/set_status.php', { method: 'POST', json: { type: kind, id: id, status: status === 'active' ? 'removed' : 'active' } });
                        await Promise.all([loadContent(), loadStats()]);
                    });
                }
            }),
            el('button', {
                type: 'button', class: 'btn-delete', text: 'حذف',
                onclick: function () {
                    if (!confirm('حذف "' + name + '" نهائياً؟ (لإخفائه مؤقتاً استخدم زر الإخفاء)')) return;
                    act(async function () {
                        await api(kind === 'listing' ? 'listings/delete.php' : 'businesses/delete.php', {
                            method: 'POST', json: kind === 'listing' ? { listing_id: id } : { business_id: id }
                        });
                        await Promise.all([loadContent(), loadStats()]);
                    });
                }
            })
        );
    }

    async function loadContent() {
        try {
            const d = await api('admin/content.php', { query: { type: content.type, q: content.q, status: content.status, page: content.page } });
            clear(contentHead); clear(contentRows);
            if (content.type === 'listings') {
                contentHead.appendChild(th(['#', 'المنتج', 'المشروع', 'التصنيف', 'السعر', 'الحالة', 'إجراءات']));
                if (!d.items.length) contentRows.appendChild(emptyRow(7, 'لا توجد منتجات.'));
                d.items.forEach(function (l) {
                    contentRows.appendChild(el('tr', {},
                        el('td', { text: l.listing_id }),
                        el('td', { text: l.title }),
                        el('td', { text: l.business_name }),
                        el('td', { text: l.category_name }),
                        el('td', { text: fmtPrice(l) }),
                        statusCell(l.status),
                        actions('listing', l.listing_id, l.status, l.title,
                            el('a', { href: 'project.html?id=' + l.listing_id, class: 'btn-edit', text: 'عرض' }))
                    ));
                });
            } else {
                contentHead.appendChild(th(['#', 'المشروع', 'صاحب المشروع', 'التواصل', 'الحالة', 'إجراءات']));
                if (!d.items.length) contentRows.appendChild(emptyRow(6, 'لا توجد مشاريع.'));
                d.items.forEach(function (b) {
                    contentRows.appendChild(el('tr', {},
                        el('td', { text: b.business_id }),
                        el('td', { text: b.business_name }),
                        el('td', {}, b.owner_name, el('span', { class: 'cell-sub', text: b.owner_email })),
                        el('td', {}, b.contact_email, b.contact_phone ? el('span', { class: 'cell-sub', text: b.contact_phone }) : null),
                        statusCell(b.status),
                        actions('business', b.business_id, b.status, b.business_name,
                            el('a', { href: 'index.html?business_id=' + b.business_id, class: 'btn-edit', text: 'عرض' }))
                    ));
                });
            }
            renderPager(document.getElementById('contentPager'), d, function (p) { content.page = p; loadContent(); });
        } catch (e) {
            showAlert(alertBox, e.message, 'error');
        }
    }

    /* ---------- ربط عناصر التحكم ---------- */
    document.getElementById('userSearch').addEventListener('input', debounce(function (e) {
        users.q = e.target.value.trim(); users.page = 1; loadUsers();
    }, 300));
    document.getElementById('userRole').addEventListener('change', function (e) {
        users.role = e.target.value; users.page = 1; loadUsers();
    });
    document.getElementById('contentSearch').addEventListener('input', debounce(function (e) {
        content.q = e.target.value.trim(); content.page = 1; loadContent();
    }, 300));
    document.getElementById('contentStatus').addEventListener('change', function (e) {
        content.status = e.target.value; content.page = 1; loadContent();
    });
    document.querySelectorAll('.tab-btn').forEach(function (b) {
        b.addEventListener('click', function () {
            document.querySelectorAll('.tab-btn').forEach(function (x) { x.classList.remove('active'); });
            b.classList.add('active');
            content.type = b.dataset.type; content.page = 1;
            loadContent();
        });
    });

    initPage({ roles: ['admin'] }).then(function (user) {
        document.getElementById('welcome').textContent = 'مرحباً بك، ' + user.full_name.split(' ')[0] + ' 👋';
        loadStats().catch(function (e) { showAlert(alertBox, e.message, 'error'); });
        loadUsers();
        loadContent();
    });
})();
