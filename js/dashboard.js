// لوحة صاحب المشروع: مشاريعي ومنتجاتي (api/businesses/mine.php + api/listings/mine.php)
(function () {
    'use strict';
    const { api, el, clear, fmtPrice, showAlert, initPage, imageOrPlaceholder } = App;

    const alertBox = document.getElementById('pageAlert');
    const businessList = document.getElementById('businessList');
    const rows = document.getElementById('listingRows');

    function statusBadge(status) {
        return el('span', { class: status === 'active' ? 'status-active' : 'status-removed', text: status === 'active' ? 'نشط' : 'مخفي من الإدارة' });
    }

    async function remove(endpoint, body, message) {
        if (!confirm(message)) return;
        try {
            await api(endpoint, { method: 'POST', json: body });
            await load();
        } catch (e) {
            showAlert(alertBox, e.message, 'error');
        }
    }

    function renderBusinesses(list) {
        clear(businessList);
        if (!list.length) {
            businessList.appendChild(el('p', { class: 'empty-state' },
                'ما عندك أي مشروع بعد. ',
                el('a', { href: 'edit_business.html', text: 'أنشئ مشروعك الأول', class: 'btn-small' }),
                ' ثم أضف منتجاتك.'
            ));
            return;
        }
        list.forEach(function (b) {
            const contact = [b.contact_email, b.contact_phone].filter(Boolean).join(' | ');
            businessList.appendChild(el('div', { class: 'business-row' },
                el('div', {},
                    el('h4', { text: b.business_name }),
                    el('p', { text: contact + ' — ' + b.listings_count + ' منتج' })
                ),
                el('div', { class: 'row-actions' },
                    statusBadge(b.status),
                    b.status === 'active'
                        ? el('a', { href: 'edit_business.html?id=' + b.business_id, class: 'btn-edit', text: 'تعديل' })
                        : null,
                    el('button', {
                        type: 'button', class: 'btn-delete', text: 'حذف',
                        onclick: function () {
                            remove('businesses/delete.php', { business_id: b.business_id },
                                'سيتم حذف المشروع "' + b.business_name + '" مع كل منتجاته وصوره نهائياً. هل أنت متأكد؟');
                        }
                    })
                )
            ));
        });
    }

    function renderListings(list) {
        clear(rows);
        if (!list.length) {
            rows.appendChild(el('tr', {}, el('td', { colspan: 6, class: 'empty-state', text: 'لا توجد منتجات بعد.' })));
            return;
        }
        list.forEach(function (l) {
            const hidden = l.status !== 'active' || l.business_status !== 'active';
            rows.appendChild(el('tr', {},
                el('td', {}, el('div', { class: 'table-img' }, l.cover_url ? el('img', { src: l.cover_url, alt: l.title, loading: 'lazy' }) : null)),
                el('td', {}, el('a', { href: 'project.html?id=' + l.listing_id, text: l.title }), el('span', { class: 'cell-sub', text: l.category_name })),
                el('td', { text: l.business_name }),
                el('td', { text: fmtPrice(l) }),
                el('td', {}, statusBadge(hidden ? 'removed' : 'active')),
                el('td', {},
                    hidden ? null : el('a', { href: 'add_project.html?id=' + l.listing_id, class: 'btn-edit', text: 'تعديل' }),
                    el('button', {
                        type: 'button', class: 'btn-delete', text: 'حذف',
                        onclick: function () {
                            remove('listings/delete.php', { listing_id: l.listing_id }, 'حذف المنتج "' + l.title + '" نهائياً؟');
                        }
                    })
                )
            ));
        });
    }

    async function load() {
        try {
            const [b, l] = await Promise.all([api('businesses/mine.php'), api('listings/mine.php')]);
            renderBusinesses(b.businesses);
            renderListings(l.listings);
            const hiddenCount = l.listings.filter(function (x) { return x.status !== 'active' || x.business_status !== 'active'; }).length;
            document.getElementById('statBusinesses').textContent = b.businesses.length;
            document.getElementById('statActive').textContent = l.listings.length - hiddenCount;
            document.getElementById('statHidden').textContent = hiddenCount;
        } catch (e) {
            showAlert(alertBox, e.message, 'error');
        }
    }

    initPage({ roles: ['owner'] }).then(function (user) {
        document.getElementById('welcome').textContent = 'مرحباً بك، ' + user.full_name.split(' ')[0] + ' 👋';
        return load();
    });
})();
