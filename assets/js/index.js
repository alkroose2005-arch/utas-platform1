// الصفحة الرئيسية: عرض المنتجات والبحث والفلترة من api/listings/search.php
(function () {
    'use strict';
    const { api, el, clear, fmtPrice, showAlert, debounce, renderPager, imageOrPlaceholder, initPage } = App;

    const grid = document.getElementById('projectsGrid');
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const noResults = document.getElementById('noResults');
    const pager = document.getElementById('pager');
    const filterNote = document.getElementById('filterNote');

    // الحالة تُقرأ من الرابط: ?q=&category_id=&business_id=&page=
    const params = new URLSearchParams(location.search);
    const state = {
        q: params.get('q') || '',
        category_id: params.get('category_id') || '',
        business_id: params.get('business_id') || '',
        page: Math.max(1, parseInt(params.get('page'), 10) || 1)
    };
    let requestId = 0; // لتجاهل الردود القديمة إذا تغيّر البحث أثناء الانتظار

    function card(item) {
        return el('div', { class: 'project-card' },
            imageOrPlaceholder(item.cover_url, item.title),
            el('div', { class: 'card-body' },
                el('span', { class: 'category-badge', text: item.category_name }),
                el('h3', { text: item.title }),
                el('p', { text: item.description || '' }),
                el('div', { class: 'card-footer' },
                    el('span', { class: 'price', text: fmtPrice(item) }),
                    el('a', { href: 'project.html?id=' + item.listing_id, class: 'btn-view', text: 'عرض التفاصيل' })
                )
            )
        );
    }

    function syncUrl() {
        const qs = new URLSearchParams();
        if (state.q) qs.set('q', state.q);
        if (state.category_id) qs.set('category_id', state.category_id);
        if (state.business_id) qs.set('business_id', state.business_id);
        if (state.page > 1) qs.set('page', state.page);
        const s = qs.toString();
        history.replaceState(null, '', location.pathname + (s ? '?' + s : ''));
    }

    function renderFilterNote() {
        if (!state.business_id) { filterNote.hidden = true; return; }
        clear(filterNote);
        filterNote.appendChild(document.createTextNode('تعرض الآن منتجات مشروع واحد فقط. '));
        filterNote.appendChild(el('a', {
            href: '#', text: 'عرض كل المنتجات',
            onclick: function (e) { e.preventDefault(); state.business_id = ''; state.page = 1; load(); }
        }));
        filterNote.hidden = false;
    }

    async function load() {
        const myId = ++requestId;
        syncUrl();
        renderFilterNote();
        clear(grid).appendChild(el('p', { class: 'loading-state', text: 'جارٍ التحميل...' }));
        noResults.style.display = 'none';
        try {
            const data = await api('listings/search.php', {
                query: { q: state.q, category_id: state.category_id, business_id: state.business_id, page: state.page, per_page: 12 }
            });
            if (myId !== requestId) return;
            clear(grid);
            data.items.forEach(function (it) { grid.appendChild(card(it)); });
            noResults.style.display = data.items.length === 0 ? 'block' : 'none';
            renderPager(pager, data, function (p) { state.page = p; load(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
        } catch (e) {
            if (myId !== requestId) return;
            clear(grid);
            clear(pager);
            const box = el('div', { class: 'alert alert-error' });
            grid.appendChild(box);
            showAlert(box, e.message, 'error');
        }
    }

    async function loadCategories() {
        try {
            const data = await api('categories.php');
            data.categories.forEach(function (c) {
                categoryFilter.appendChild(el('option', { value: c.category_id, text: c.category_name }));
            });
            categoryFilter.value = state.category_id;
        } catch (e) { /* الفلتر يبقى "الكل" والخطأ يظهر عند تحميل المنتجات */ }
    }

    searchInput.value = state.q;
    searchInput.addEventListener('input', debounce(function () {
        state.q = searchInput.value.trim();
        state.page = 1;
        load();
    }, 300));
    categoryFilter.addEventListener('change', function () {
        state.category_id = categoryFilter.value;
        state.page = 1;
        load();
    });

    initPage().then(function () { return loadCategories(); }).then(load);
})();
