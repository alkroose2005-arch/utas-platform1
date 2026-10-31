// إضافة / تعديل منتج: POST api/listings/save.php (multipart) — يعدّل إذا وُجد ?id=
(function () {
    'use strict';
    const { api, el, clear, showAlert, showFieldErrors, clearFieldErrors, setBusy, initPage } = App;

    const MAX_IMAGES = 5;
    const MAX_BYTES = 5 * 1024 * 1024;
    const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];

    const form = document.getElementById('productForm');
    const box = document.getElementById('formAlert');
    const btn = document.getElementById('submitBtn');
    const imagesInput = document.getElementById('images');
    const existingBox = document.getElementById('existingImages');
    const editId = parseInt(new URLSearchParams(location.search).get('id'), 10) || 0;
    let existingImages = [];

    function renderExisting() {
        clear(existingBox);
        existingImages.forEach(function (im) {
            existingBox.appendChild(el('div', { class: 'existing-image' },
                el('img', { src: im.image_url, alt: '' }),
                el('button', {
                    type: 'button', title: 'حذف الصورة', text: '×',
                    onclick: async function () {
                        if (!confirm('حذف هذه الصورة؟')) return;
                        try {
                            await api('listings/delete_image.php', { method: 'POST', json: { image_id: im.image_id } });
                            existingImages = existingImages.filter(function (x) { return x.image_id !== im.image_id; });
                            renderExisting();
                        } catch (e) {
                            showAlert(box, e.message, 'error');
                        }
                    }
                })
            ));
        });
    }

    async function prepare() {
        // المشاريع والتصنيفات
        let businesses, categories;
        try {
            [businesses, categories] = await Promise.all([api('businesses/mine.php'), api('categories.php')]);
        } catch (e) {
            showAlert(box, e.message, 'error');
            btn.disabled = true;
            return;
        }
        categories.categories.forEach(function (c) {
            form.elements.category_id.appendChild(el('option', { value: c.category_id, text: c.category_name }));
        });
        const active = businesses.businesses.filter(function (b) { return b.status === 'active'; });
        active.forEach(function (b) {
            form.elements.business_id.appendChild(el('option', { value: b.business_id, text: b.business_name }));
        });
        if (!active.length) {
            clear(box);
            box.appendChild(document.createTextNode('لازم تنشئ مشروعاً أولاً قبل إضافة منتج. '));
            box.appendChild(el('a', { href: 'edit_business.html', text: 'إنشاء مشروع' }));
            box.classList.add('alert-info');
            box.hidden = false;
            btn.disabled = true;
            return;
        }

        if (!editId) return;

        // وضع التعديل
        document.getElementById('formTitle').textContent = 'تعديل المنتج';
        document.getElementById('formSubtitle').textContent = 'عدّل البيانات ثم احفظ التغييرات';
        document.getElementById('crumbTitle').textContent = 'تعديل المنتج';
        btn.textContent = 'حفظ التعديلات';
        try {
            const l = (await api('listings/get.php', { query: { id: editId } })).listing;
            if (!active.some(function (b) { return b.business_id === l.business_id; })) {
                throw new App.ApiError('لا يمكنك تعديل هذا المنتج', 403);
            }
            form.elements.business_id.value = l.business_id;
            form.elements.business_id.disabled = true; // لا يمكن نقل المنتج بين المشاريع
            form.elements.title.value = l.title;
            form.elements.category_id.value = l.category_id;
            form.elements.price.value = l.price === null ? '' : (l.price_max !== null ? l.price + ' - ' + l.price_max : String(l.price));
            form.elements.description.value = l.description || '';
            existingImages = l.images;
            renderExisting();
        } catch (e) {
            showAlert(box, e.message, 'error');
            btn.disabled = true;
        }
    }

    function imageProblem() {
        const files = Array.prototype.slice.call(imagesInput.files);
        if (existingImages.length + files.length > MAX_IMAGES) {
            return 'الحد الأقصى ' + MAX_IMAGES + ' صور لكل منتج (لديك حالياً ' + existingImages.length + ')';
        }
        for (let i = 0; i < files.length; i++) {
            if (ALLOWED.indexOf(files[i].type) === -1) return 'الصورة "' + files[i].name + '" ليست JPG أو PNG أو WEBP';
            if (files[i].size > MAX_BYTES) return 'الصورة "' + files[i].name + '" أكبر من 5 ميجابايت';
        }
        return '';
    }

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        showAlert(box);
        clearFieldErrors(form);

        const errs = {};
        if (form.elements.title.value.trim().length < 2) errs.title = 'اكتب اسم المنتج';
        if (!form.elements.category_id.value) errs.category_id = 'اختر التصنيف';
        if (!form.elements.description.value.trim()) errs.description = 'اكتب وصفاً للمنتج';
        if (!editId && !form.elements.business_id.value) errs.business_id = 'اختر المشروع';
        const imgErr = imageProblem();
        if (imgErr) errs.images = imgErr;
        if (Object.keys(errs).length) {
            showFieldErrors(form, errs);
            return;
        }

        const fd = new FormData();
        if (editId) fd.append('listing_id', editId);
        else fd.append('business_id', form.elements.business_id.value);
        fd.append('title', form.elements.title.value.trim());
        fd.append('category_id', form.elements.category_id.value);
        fd.append('price', form.elements.price.value.trim());
        fd.append('description', form.elements.description.value.trim());
        Array.prototype.forEach.call(imagesInput.files, function (f) { fd.append('images[]', f); });

        setBusy(btn, true, 'جارٍ الحفظ...');
        try {
            await api('listings/save.php', { method: 'POST', form: fd });
            location.href = 'dashboard.html';
        } catch (err) {
            setBusy(btn, false);
            showAlert(box, err.message, 'error');
            showFieldErrors(form, err.fields);
        }
    });

    initPage({ roles: ['owner'] }).then(prepare);
})();
