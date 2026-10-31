// إضافة / تعديل مشروع: POST api/businesses/save.php (يعدّل إذا وُجد ?id=)
(function () {
    'use strict';
    const { api, showAlert, showFieldErrors, clearFieldErrors, setBusy, initPage } = App;

    const form = document.getElementById('businessForm');
    const box = document.getElementById('formAlert');
    const btn = form.querySelector('button[type="submit"]');
    const editId = parseInt(new URLSearchParams(location.search).get('id'), 10) || 0;

    async function prepare(user) {
        if (!editId) {
            form.elements.contact_email.value = user.email; // قيمة مبدئية يمكن تغييرها
            return;
        }
        document.getElementById('formTitle').textContent = 'تعديل المشروع';
        document.getElementById('crumbTitle').textContent = 'تعديل المشروع';
        try {
            const list = (await api('businesses/mine.php')).businesses;
            const b = list.filter(function (x) { return x.business_id === editId; })[0];
            if (!b) { showAlert(box, 'المشروع غير موجود', 'error'); form.querySelector('button').disabled = true; return; }
            if (b.status !== 'active') { showAlert(box, 'تم إخفاء هذا المشروع من قبل الإدارة ولا يمكن تعديله', 'error'); btn.disabled = true; return; }
            form.elements.business_name.value = b.business_name;
            form.elements.description.value = b.description || '';
            form.elements.contact_email.value = b.contact_email;
            form.elements.contact_phone.value = b.contact_phone || '';
        } catch (e) {
            showAlert(box, e.message, 'error');
        }
    }

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        showAlert(box);
        clearFieldErrors(form);

        const body = {
            business_name: form.elements.business_name.value.trim(),
            description: form.elements.description.value.trim(),
            contact_email: form.elements.contact_email.value.trim(),
            contact_phone: form.elements.contact_phone.value.trim()
        };
        if (editId) body.business_id = editId;

        setBusy(btn, true, 'جارٍ الحفظ...');
        try {
            await api('businesses/save.php', { method: 'POST', json: body });
            location.href = 'dashboard.html';
        } catch (err) {
            setBusy(btn, false);
            showAlert(box, err.message, 'error');
            showFieldErrors(form, err.fields);
        }
    });

    initPage({ roles: ['owner'] }).then(prepare);
})();
