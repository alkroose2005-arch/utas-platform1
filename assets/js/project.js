// تفاصيل المنتج: GET api/listings/get.php?id=
(function () {
    'use strict';
    const { api, el, clear, fmtPrice, showAlert, initPage } = App;

    const details = document.getElementById('details');
    const loading = document.getElementById('loading');
    const alertBox = document.getElementById('pageAlert');

    function fail(message) {
        loading.hidden = true;
        showAlert(alertBox, message, 'error');
        alertBox.appendChild(document.createTextNode(' '));
        alertBox.appendChild(el('a', { href: 'index.html', text: 'العودة للرئيسية' }));
    }

    function renderGallery(listing) {
        const box = document.getElementById('gallery');
        clear(box);
        if (!listing.images.length) {
            box.appendChild(el('div', { class: 'img-placeholder', text: 'لا توجد صورة' }));
            return;
        }
        const main = el('img', { src: listing.images[0].image_url, alt: listing.title });
        box.appendChild(main);
        if (listing.images.length > 1) {
            const thumbs = el('div', { class: 'thumbs' });
            listing.images.forEach(function (im, i) {
                const t = el('img', {
                    src: im.image_url, alt: listing.title + ' ' + (i + 1),
                    class: i === 0 ? 'selected' : null,
                    onclick: function () {
                        main.src = im.image_url;
                        thumbs.querySelectorAll('img').forEach(function (n) { n.classList.remove('selected'); });
                        t.classList.add('selected');
                    }
                });
                thumbs.appendChild(t);
            });
            box.appendChild(thumbs);
        }
    }

    // رسالة جاهزة تُرسل مع واتساب/الإيميل (بلغة الواجهة الحالية)
    function contactMessage(listing) {
        return I18n.lang() === 'en'
            ? 'Hello, I am interested in "' + listing.title + '" listed on the Student Projects Platform.'
            : 'السلام عليكم، أنا مهتم بـ "' + listing.title + '" المعروض في منصة مشاريع الطلاب.';
    }

    function renderOwner(business, listing) {
        const list = document.getElementById('ownerList');
        const locked = document.getElementById('contactLocked');
        const actions = document.getElementById('actions');
        clear(list); clear(actions); clear(locked);

        const row = function (label, value) {
            list.appendChild(el('li', {}, el('strong', { text: label + ':' }), ' ', value));
        };
        row('المشروع', business.business_name);
        row('صاحب المشروع', business.owner_name);

        const allProducts = el('a', {
            href: 'index.html?business_id=' + business.business_id,
            class: 'btn-contact-outline', text: 'كل منتجات هذا المشروع'
        });

        if (business.contact_locked) {
            actions.appendChild(allProducts);
            locked.hidden = false;
            locked.appendChild(document.createTextNode('بيانات التواصل تظهر للمستخدمين المسجلين فقط. '));
            locked.appendChild(el('a', {
                href: 'login.html?next=' + encodeURIComponent(App.currentPage()), text: 'سجّل الدخول'
            }));
            locked.appendChild(document.createTextNode(' أو '));
            locked.appendChild(el('a', { href: 'register.html', text: 'أنشئ حساباً' }));
            return;
        }
        locked.hidden = true;

        const msg = contactMessage(listing);
        const subject = (I18n.lang() === 'en' ? 'Inquiry about: ' : 'استفسار عن: ') + listing.title;

        // الهاتف: يظهر الرقم + واتساب مباشر + اتصال
        if (business.contact_phone) {
            const tel = business.contact_phone.replace(/[^\d+]/g, '');
            row('الهاتف', el('a', { href: 'tel:' + tel, class: 'ltr-text', dir: 'ltr', text: business.contact_phone }));
            const wa = App.waNumber(business.contact_phone);
            if (wa) {
                actions.appendChild(el('a', {
                    href: 'https://wa.me/' + wa + '?text=' + encodeURIComponent(msg),
                    class: 'btn-whatsapp', target: '_blank', rel: 'noopener', text: 'تواصل عبر واتساب'
                }));
            }
        }

        // البريد: يظهر العنوان + فتح برنامج البريد + فتح Gmail مباشرة
        if (business.contact_email) {
            const mail = business.contact_email;
            row('البريد', el('a', { href: 'mailto:' + mail, class: 'ltr-text', dir: 'ltr', text: mail }));
            actions.appendChild(el('a', {
                href: 'mailto:' + mail + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(msg),
                class: 'btn-contact', text: 'تواصل عبر البريد'
            }));
            actions.appendChild(el('a', {
                href: 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(mail) +
                      '&su=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(msg),
                class: 'btn-contact-outline', target: '_blank', rel: 'noopener', text: 'فتح Gmail'
            }));
        }

        if (business.contact_phone) {
            actions.appendChild(el('a', {
                href: 'tel:' + business.contact_phone.replace(/[^\d+]/g, ''),
                class: 'btn-contact-outline', text: 'اتصال هاتفي'
            }));
        }
        actions.appendChild(allProducts);
    }

    async function load() {
        const id = parseInt(new URLSearchParams(location.search).get('id'), 10);
        if (!id) { fail('رابط المنتج غير صحيح'); return; }
        try {
            const l = (await api('listings/get.php', { query: { id: id } })).listing;
            document.title = l.title + ' - منصة مشاريع الطلاب';
            document.getElementById('crumbTitle').textContent = l.title;
            document.getElementById('badge').textContent = l.category_name;
            document.getElementById('title').textContent = l.title;
            document.getElementById('price').textContent = fmtPrice(l, true);
            document.getElementById('description').textContent = l.description || 'لا يوجد وصف.';
            renderGallery(l);
            renderOwner(l.business, l);
            if (l.status !== 'active' || l.business.status !== 'active') {
                showAlert(alertBox, 'هذا المنتج مخفي من الإدارة ولا يظهر للزوار، وأنت تراه لأنك المالك أو الأدمن.', 'info');
            }
            loading.hidden = true;
            details.hidden = false;
        } catch (e) {
            fail(e.status === 404 ? 'المنتج غير موجود أو تم إخفاؤه.' : e.message);
        }
    }

    initPage().then(load);
})();
