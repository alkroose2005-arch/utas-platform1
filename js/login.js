// تسجيل الدخول: POST api/auth/login.php
(function () {
    'use strict';
    const { api, showAlert, showFieldErrors, clearFieldErrors, setBusy, initPage, homeFor, safeNext } = App;

    const form = document.getElementById('loginForm');
    const box = document.getElementById('formAlert');
    const btn = form.querySelector('button[type="submit"]');

    initPage().then(function (user) {
        if (user) location.replace(homeFor(user.role)); // مسجّل دخول مسبقاً
    });

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        showAlert(box);
        clearFieldErrors(form);

        const email = form.elements.email.value.trim();
        const password = form.elements.password.value;
        if (!email || !password) {
            showAlert(box, 'أدخل البريد الإلكتروني وكلمة المرور', 'error');
            return;
        }

        setBusy(btn, true, 'جارٍ الدخول...');
        try {
            const data = await api('auth/login.php', { method: 'POST', json: { email: email, password: password } });
            const next = safeNext(new URLSearchParams(location.search).get('next'));
            location.href = next || homeFor(data.user.role);
        } catch (err) {
            setBusy(btn, false);
            showAlert(box, err.message, 'error');
            showFieldErrors(form, err.fields);
        }
    });
})();
