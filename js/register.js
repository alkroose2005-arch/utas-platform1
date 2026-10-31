// إنشاء حساب: POST api/auth/register.php
(function () {
    'use strict';
    const { api, showAlert, showFieldErrors, clearFieldErrors, setBusy, initPage, homeFor, el } = App;

    const form = document.getElementById('registerForm');
    const box = document.getElementById('formAlert');
    const btn = form.querySelector('button[type="submit"]');

    initPage().then(function (user) {
        if (user) location.replace(homeFor(user.role));
    });

    function localErrors() {
        const e = {};
        if (form.elements.full_name.value.trim().length < 3) e.full_name = 'الاسم الكامل يجب ألا يقل عن 3 أحرف';
        if (!form.elements.email.value.trim()) e.email = 'أدخل بريدك الجامعي';
        if (!form.elements.role.value) e.role = 'اختر نوع الحساب';
        if (form.elements.password.value.length < 8) e.password = 'كلمة المرور يجب ألا تقل عن 8 أحرف';
        else if (form.elements.password.value !== form.elements.confirm_password.value) e.confirm_password = 'كلمتا المرور غير متطابقتين';
        return e;
    }

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        showAlert(box);
        clearFieldErrors(form);

        const errs = localErrors();
        if (Object.keys(errs).length) {
            showFieldErrors(form, errs);
            return;
        }

        setBusy(btn, true, 'جارٍ إنشاء الحساب...');
        try {
            const data = await api('auth/register.php', {
                method: 'POST',
                json: {
                    full_name: form.elements.full_name.value.trim(),
                    email: form.elements.email.value.trim(),
                    password: form.elements.password.value,
                    role: form.elements.role.value
                }
            });
            // أصحاب المشاريع يبدؤون بإضافة مشروعهم
            location.href = data.user.role === 'owner' ? 'edit_business.html' : 'index.html';
        } catch (err) {
            setBusy(btn, false);
            showAlert(box, err.message, 'error');
            showFieldErrors(form, err.fields);
        }
    });
})();
