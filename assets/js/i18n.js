/* ==========================================================================
   i18n.js — التبديل بين العربية والإنجليزية
   - اللغة تُحفظ في المتصفح (localStorage) ويمكن فرضها بـ ?lang=en أو ?lang=ar
   - العربية هي الأصل: الصفحات مكتوبة بالعربية، وعند اختيار الإنجليزية تُترجم النصوص
     تلقائياً من القاموس EN أدناه (النص العربي = المفتاح) ويتغير الاتجاه إلى LTR.
   - لإضافة ترجمة لنص جديد: أضف سطراً  'النص العربي': 'English text'  في القاموس.
   - النصوص التي فيها أجزاء متغيرة (أسماء، أرقام) تُعالَج في PATTERNS.
   يجب تحميل هذا الملف قبل common.js
   ========================================================================== */
(function () {
    'use strict';

    /* ---------- تحديد اللغة ---------- */
    let lang = 'ar';
    try {
        const q = new URLSearchParams(location.search).get('lang');
        if (q === 'en' || q === 'ar') localStorage.setItem('utas_lang', q);
        lang = localStorage.getItem('utas_lang') === 'en' ? 'en' : 'ar';
    } catch (e) { /* التخزين غير متاح: نبقى على العربية */ }

    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'en' ? 'ltr' : 'rtl';

    function setLang(l) {
        try { localStorage.setItem('utas_lang', l === 'en' ? 'en' : 'ar'); } catch (e) { /* تجاهل */ }
        location.reload();
    }

    /* ---------- القاموس: عربي ← إنجليزي ---------- */
    const EN = {
        /* عام / الشريط العلوي */
        'منصة مشاريع الطلاب': 'Student Projects Platform',
        'جامعة التقنية والعلوم التطبيقية - المصنعة': 'University of Technology and Applied Sciences – Al Musannah',
        'منصة مشاريع الطلاب - UTAS': 'Student Projects Platform - UTAS',
        '© 2026 منصة مشاريع الطلاب - جامعة التقنية والعلوم التطبيقية بالمصنعة': '© 2026 Student Projects Platform – University of Technology and Applied Sciences, Al Musannah',
        'الرئيسية': 'Home',
        'تسجيل الدخول': 'Log in',
        'حساب جديد': 'Sign up',
        'تسجيل خروج': 'Log out',
        'لوحة التحكم': 'Dashboard',
        'لوحة الأدمن': 'Admin panel',
        'جارٍ التحميل...': 'Loading...',
        'جارٍ التنفيذ...': 'Working...',
        'السابق': 'Previous',
        'التالي': 'Next',
        'لا توجد صورة': 'No image',
        'حدث خطأ غير متوقع': 'An unexpected error occurred',
        'تعذر الاتصال بالسيرفر. تأكد من تشغيل Apache و MySQL في XAMPP وأن الموقع مفتوح من http://localhost/...': 'Could not reach the server. Make sure Apache and MySQL are running in XAMPP and the site is opened from http://localhost/...',
        'الموقع مفتوح كملف مباشر. افتحه عبر XAMPP من الرابط: http://localhost/utas-platform/': 'The site was opened as a local file. Open it through XAMPP at: http://localhost/utas-platform/',

        /* الأسعار والتصنيفات */
        'السعر عند التواصل': 'Price on request',
        'طعام ومشروبات': 'Food & Drinks',
        'منتجات يدوية': 'Handmade Products',
        'طباعة وتصميم': 'Printing & Design',
        'تصوير': 'Photography',
        'هدايا': 'Gifts',
        'خدمات أخرى': 'Other Services',

        /* الأدوار والحالات */
        'طالب': 'Student',
        'صاحب مشروع': 'Project owner',
        'مدير': 'Admin',
        'نشط': 'Active',
        'مخفي': 'Hidden',
        'مخفي من الإدارة': 'Hidden by admin',

        /* الصفحة الرئيسية */
        'اكتشف مشاريع زملائك الطلابية': "Discover your fellow students' projects",
        'مكان واحد يجمع جميع المشاريع والخدمات التي يقدمها طلاب الجامعة': 'One place for all the projects and services offered by university students',
        'جميع التصنيفات': 'All categories',
        'لا توجد نتائج مطابقة لبحثك.': 'No results match your search.',
        'ابحث عن مشروع أو خدمة...': 'Search for a project or service...',
        'عرض التفاصيل': 'View details',
        'تعرض الآن منتجات مشروع واحد فقط.': 'You are now viewing products from one project only.',
        'عرض كل المنتجات': 'Show all products',

        /* تسجيل الدخول والتسجيل */
        'مرحباً بك مجدداً، أدخل بياناتك للمتابعة': 'Welcome back, enter your details to continue',
        'البريد الإلكتروني': 'Email',
        'كلمة المرور': 'Password',
        'أدخل كلمة المرور': 'Enter your password',
        'ليس لديك حساب؟': "Don't have an account?",
        'أنشئ حساباً جديداً': 'Create a new account',
        'أدخل البريد الإلكتروني وكلمة المرور': 'Enter your email and password',
        'جارٍ الدخول...': 'Logging in...',
        'البريد الإلكتروني أو كلمة المرور غير صحيحة': 'Incorrect email or password',
        'محاولات كثيرة خاطئة. حاول مرة أخرى بعد 10 دقائق': 'Too many failed attempts. Try again in 10 minutes.',
        'إنشاء حساب جديد': 'Create a New Account',
        'انضم إلى منصة مشاريع الطلاب وابدأ بعرض مشروعك': 'Join the Student Projects Platform and start showcasing your project',
        'الاسم الكامل': 'Full name',
        'أدخل اسمك الكامل': 'Enter your full name',
        'البريد الإلكتروني الجامعي': 'University email',
        'نوع الحساب': 'Account type',
        '-- اختر نوع الحساب --': '-- Select account type --',
        'طالب (أتصفح مشاريع الزملاء)': "Student (I browse my classmates' projects)",
        'صاحب مشروع (أعرض منتجاتي وخدماتي)': 'Project owner (I list my products and services)',
        '8 أحرف على الأقل': 'At least 8 characters',
        'تأكيد كلمة المرور': 'Confirm password',
        'أعد إدخال كلمة المرور': 'Re-enter your password',
        'إنشاء الحساب': 'Create account',
        'لديك حساب بالفعل؟': 'Already have an account?',
        'جارٍ إنشاء الحساب...': 'Creating account...',
        'الاسم الكامل يجب ألا يقل عن 3 أحرف': 'Full name must be at least 3 characters',
        'أدخل بريدك الجامعي': 'Enter your university email',
        'اختر نوع الحساب': 'Choose the account type',
        'كلمة المرور يجب ألا تقل عن 8 أحرف': 'Password must be at least 8 characters',
        'كلمتا المرور غير متطابقتين': 'Passwords do not match',

        /* صفحة المنتج والتواصل */
        'تفاصيل المنتج': 'Product Details',
        'الوصف': 'Description',
        'معلومات المشروع والتواصل': 'Project & contact information',
        'المشروع': 'Project',
        'صاحب المشروع': 'Project owner',
        'البريد': 'Email',
        'الهاتف': 'Phone',
        'كل منتجات هذا المشروع': "All of this project's products",
        'بيانات التواصل تظهر للمستخدمين المسجلين فقط.': 'Contact details are visible to logged-in users only.',
        'سجّل الدخول': 'Log in',
        'أو': 'or',
        'أنشئ حساباً': 'Create an account',
        'تواصل عبر واتساب': 'Chat on WhatsApp',
        'تواصل عبر البريد': 'Send an email',
        'فتح Gmail': 'Open Gmail',
        'اتصال هاتفي': 'Call',
        'العودة للرئيسية': 'Back to home',
        'رابط المنتج غير صحيح': 'Invalid product link',
        'لا يوجد وصف.': 'No description.',
        'هذا المنتج مخفي من الإدارة ولا يظهر للزوار، وأنت تراه لأنك المالك أو الأدمن.': 'This product is hidden by the admin and is not visible to visitors; you can see it because you are the owner or an admin.',
        'المنتج غير موجود أو تم إخفاؤه.': 'Product not found or it has been hidden.',

        /* لوحة صاحب المشروع */
        'مرحباً بك 👋': 'Welcome 👋',
        'هنا يمكنك إدارة مشاريعك ومنتجاتك': 'Manage your projects and products here',
        'مشاريعي': 'My projects',
        'المنتجات المنشورة': 'Published products',
        'منتجات مخفية من الإدارة': 'Products hidden by admin',
        '+ إضافة مشروع': '+ Add project',
        'منتجاتي وخدماتي': 'My products & services',
        '+ إضافة منتج جديد': '+ Add new product',
        'الصورة': 'Image',
        'اسم المنتج': 'Product name',
        'السعر': 'Price',
        'الحالة': 'Status',
        'ما عندك أي مشروع بعد.': "You don't have any projects yet.",
        'أنشئ مشروعك الأول': 'Create your first project',
        'ثم أضف منتجاتك.': 'then add your products.',
        'لا توجد منتجات بعد.': 'No products yet.',
        'تعديل': 'Edit',
        'حذف': 'Delete',

        /* نموذج المشروع */
        'بيانات المشروع': 'Project Details',
        'إضافة مشروع': 'Add project',
        'إضافة مشروع جديد': 'Add New Project',
        'تعديل المشروع': 'Edit project',
        'هذه البيانات تظهر لمن يتصفح منتجاتك (بيانات التواصل للمسجلين فقط)': 'This information is shown to people browsing your products (contact details are visible to logged-in users only)',
        'اسم المشروع': 'Project name',
        'مثال: مطبخ أم سعيد': "Example: Umm Saeed's Kitchen",
        'وصف المشروع': 'Project description',
        'نبذة عن مشروعك وما تقدمه...': 'About your project and what you offer...',
        'البريد الإلكتروني للتواصل': 'Contact email',
        'سيظهر هذا البريد للمستخدمين المسجلين. يمكنك استبداله ببريد غير جامعي.': 'This email is shown to logged-in users. You can replace it with a non-university email.',
        'رقم الهاتف (اختياري)': 'Phone number (optional)',
        'يُستخدم للاتصال وللمحادثة عبر واتساب. أدخل رقماً عُمانياً من 8 أرقام، أو رقماً دولياً يبدأ بـ + ورمز الدولة.': 'Used for calls and WhatsApp chat. Enter an Omani 8-digit number, or an international number starting with + and the country code.',
        'حفظ المشروع': 'Save project',
        'المشروع غير موجود': 'Project not found',
        'تم إخفاء هذا المشروع من قبل الإدارة ولا يمكن تعديله': 'This project was hidden by the admin and cannot be edited',
        'جارٍ الحفظ...': 'Saving...',

        /* نموذج المنتج */
        'إضافة منتج': 'Add product',
        'إضافة منتج جديد': 'Add New Product',
        'إضافة منتج أو خدمة جديدة': 'Add a New Product or Service',
        'املأ البيانات التالية لعرض منتجك للطلاب': 'Fill in the details below to show your product to students',
        'اسم المنتج أو الخدمة': 'Product or service name',
        'مثال: وجبة أرز باللحم': 'Example: Rice with meat meal',
        'التصنيف': 'Category',
        '-- اختر التصنيف --': '-- Select category --',
        'السعر (ريال عماني)': 'Price (OMR)',
        'مثال: 3 أو 2 - 5': 'Example: 3 or 2 - 5',
        'رقم واحد أو نطاق (من - إلى). اتركه فارغاً ليظهر "السعر عند التواصل"': 'A single number or a range (from - to). Leave empty to show "Price on request"',
        'وصف المنتج': 'Product description',
        'اكتب وصفاً تفصيلياً للمنتج أو الخدمة...': 'Write a detailed description of the product or service...',
        'صور المنتج': 'Product images',
        'JPG أو PNG أو WEBP، حتى 5 صور وبحجم أقصاه 5 ميجابايت للصورة (اختياري)': 'JPG, PNG or WEBP, up to 5 images, max 5 MB each (optional)',
        'نشر المنتج': 'Publish product',
        'إلغاء': 'Cancel',
        'حذف الصورة': 'Delete image',
        'حذف هذه الصورة؟': 'Delete this image?',
        'لازم تنشئ مشروعاً أولاً قبل إضافة منتج.': 'You need to create a project before adding a product.',
        'إنشاء مشروع': 'Create project',
        'تعديل المنتج': 'Edit product',
        'عدّل البيانات ثم احفظ التغييرات': 'Edit the details then save the changes',
        'حفظ التعديلات': 'Save changes',
        'لا يمكنك تعديل هذا المنتج': 'You cannot edit this product',
        'اكتب اسم المنتج': 'Enter the product name',
        'اختر التصنيف': 'Choose a category',
        'اكتب وصفاً للمنتج': 'Write a product description',
        'اختر المشروع': 'Choose a project',

        /* لوحة الأدمن */
        'لوحة تحكم الأدمن': 'Admin Dashboard',
        'هنا يمكنك إدارة المستخدمين والمشاريع والمنتجات': 'Manage users, projects and products here',
        'المستخدمون': 'Users',
        'المشاريع': 'Projects',
        'المنتجات': 'Products',
        'المنتج': 'Product',
        'عناصر مخفية': 'Hidden items',
        'إدارة المستخدمين': 'User Management',
        'ابحث عن مستخدم...': 'Search for a user...',
        'ابحث...': 'Search...',
        'كل الأدوار': 'All roles',
        'الاسم': 'Name',
        'الدور': 'Role',
        'تاريخ التسجيل': 'Registration date',
        'إجراءات': 'Actions',
        'إدارة المحتوى': 'Content Management',
        'كل الحالات': 'All statuses',
        'التواصل': 'Contact',
        'عرض': 'View',
        'محمي': 'Protected',
        'إخفاء': 'Hide',
        'إظهار': 'Show',
        'لا يوجد مستخدمون مطابقون.': 'No matching users.',
        'لا توجد منتجات.': 'No products.',
        'لا توجد مشاريع.': 'No projects.',

        /* رسائل السيرفر */
        'خطأ في السيرفر': 'Server error',
        'حدث خطأ في السيرفر': 'A server error occurred',
        'بيانات الطلب غير صالحة': 'Invalid request data',
        'يجب تسجيل الدخول أولاً': 'You must log in first',
        'ليس لديك صلاحية لتنفيذ هذا الإجراء': 'You do not have permission to perform this action',
        'حجم الملفات المرفوعة أكبر من الحد المسموح في السيرفر (post_max_size). قلّل حجم الصور أو عددها': 'The uploaded files exceed the server limit (post_max_size). Reduce the size or number of images',
        'حجم الصورة أكبر من الحد المسموح في السيرفر (upload_max_filesize)': 'The image exceeds the server limit (upload_max_filesize)',
        'فشل رفع الصورة، حاول مرة أخرى': 'Image upload failed, please try again',
        'مسموح فقط بصور JPG أو PNG أو WEBP': 'Only JPG, PNG or WEBP images are allowed',
        'تعذر حفظ الصورة على السيرفر': 'Could not save the image on the server',
        'النوع يجب أن يكون businesses أو listings': 'Type must be businesses or listings',
        'النوع يجب أن يكون business أو listing': 'Type must be business or listing',
        'الحالة يجب أن تكون active أو removed': 'Status must be active or removed',
        'المستخدم غير موجود': 'User not found',
        'لا يمكن حذف حسابات الأدمن': 'Admin accounts cannot be deleted',
        'العنصر غير موجود': 'Item not found',
        'الاسم الكامل يجب أن يكون بين 3 و100 حرف': 'Full name must be between 3 and 100 characters',
        'البريد الإلكتروني غير صالح': 'Invalid email address',
        'مسموح فقط بالبريد الجامعي (utas.edu.om)': 'Only university email addresses are allowed (utas.edu.om)',
        'كلمة المرور يجب أن تكون 8 أحرف على الأقل وألا تتجاوز 72 بايتاً (حوالي 36 حرفاً عربياً)': 'Password must be at least 8 characters and no more than 72 bytes (about 36 Arabic characters)',
        'البيانات المدخلة غير صحيحة': 'The data entered is invalid',
        'هذا البريد مسجّل مسبقاً': 'This email is already registered',
        'البريد مسجّل مسبقاً': 'Email already registered',
        'اسم المشروع يجب أن يكون بين 2 و100 حرف': 'Project name must be between 2 and 100 characters',
        'الوصف يجب ألا يتجاوز 2000 حرف': 'Description must not exceed 2000 characters',
        'الوصف يجب ألا يتجاوز 3000 حرف': 'Description must not exceed 3000 characters',
        'البريد الإلكتروني للتواصل غير صالح': 'Contact email is invalid',
        'رقم الهاتف غير صالح (من 8 إلى 15 رقماً)': 'Invalid phone number (8 to 15 digits)',
        'تم إخفاء هذا المشروع من قبل الإدارة': 'This project was hidden by the admin',
        'تم إخفاء هذا المنتج من قبل الإدارة': 'This product was hidden by the admin',
        'المنتج غير موجود': 'Product not found',
        'الصورة غير موجودة': 'Image not found',
        'اسم المنتج يجب أن يكون بين 2 و120 حرف': 'Product name must be between 2 and 120 characters',
        'السعر غير صالح. اكتب رقماً مثل 3 أو نطاقاً مثل 2 - 5': 'Invalid price. Enter a number like 3 or a range like 2 - 5',
        'اختر تصنيفاً صحيحاً': 'Choose a valid category',
        'اختر مشروعاً صحيحاً': 'Choose a valid project'
    };

    /* ---------- أنماط للنصوص ذات الأجزاء المتغيرة ---------- */
    // كل عنصر: [تعبير نمطي، دالة تعيد النص الإنجليزي]. الدالة تستقبل (match, tr)
    const PATTERNS = [
        [/^مرحباً بك، ([\s\S]+) 👋$/, function (m) { return 'Welcome, ' + m[1] + ' 👋'; }],
        [/^صفحة (\d+) من (\d+)$/, function (m) { return 'Page ' + m[1] + ' of ' + m[2]; }],
        [/^(\d[\d.,\s-]*) ريال عماني$/, function (m) { return m[1] + ' OMR'; }],
        [/^(\d[\d.,\s-]*) ريال$/, function (m) { return m[1] + ' OMR'; }],
        [/^([\s\S]*) - منصة مشاريع الطلاب$/, function (m, tr) { return tr(m[1]) + ' - Student Projects Platform'; }],
        [/^([\s\S]*?)\s*— (\d+) منتج$/, function (m) { return (m[1] ? m[1] + ' — ' : '— ') + m[2] + ' product(s)'; }],
        [/^خطأ في السيرفر: ([\s\S]*)$/, function (m) { return 'Server error: ' + m[1]; }],
        [/^الطريقة غير مسموحة\. استخدم (\w+)\.$/, function (m) { return 'Method not allowed. Use ' + m[1] + '.'; }],
        [/^استجابة غير متوقعة من السيرفر\. تأكد أن PHP يعمل وأن المجلد api موجود \(الحالة (\d+)\)$/,
            function (m) { return 'Unexpected response from the server. Make sure PHP is running and the api folder exists (status ' + m[1] + ')'; }],
        [/^حجم كل صورة يجب ألا يتجاوز (\d+) ميجابايت$/, function (m) { return 'Each image must not exceed ' + m[1] + ' MB'; }],
        [/^الحد الأقصى (\d+) صور لكل منتج \(لديك حالياً (\d+)\)$/, function (m) { return 'Maximum ' + m[1] + ' images per product (you currently have ' + m[2] + ')'; }],
        [/^الحد الأقصى (\d+) صور لكل منتج$/, function (m) { return 'Maximum ' + m[1] + ' images per product'; }],
        [/^الحد الأقصى (\d+) صور$/, function (m) { return 'Maximum ' + m[1] + ' images'; }],
        [/^الصورة "([\s\S]*)" ليست JPG أو PNG أو WEBP$/, function (m) { return 'The image "' + m[1] + '" is not JPG, PNG or WEBP'; }],
        [/^الصورة "([\s\S]*)" أكبر من 5 ميجابايت$/, function (m) { return 'The image "' + m[1] + '" is larger than 5 MB'; }],
        /* رسائل التأكيد (confirm) */
        [/^حذف المستخدم "([\s\S]*)" مع كل مشاريعه ومنتجاته وصوره نهائياً؟$/,
            function (m) { return 'Permanently delete user "' + m[1] + '" with all their projects, products and images?'; }],
        [/^حذف "([\s\S]*)" نهائياً؟ \(لإخفائه مؤقتاً استخدم زر الإخفاء\)$/,
            function (m) { return 'Permanently delete "' + m[1] + '"? (To hide it temporarily, use the Hide button)'; }],
        [/^سيتم حذف المشروع "([\s\S]*)" مع كل منتجاته وصوره نهائياً\. هل أنت متأكد؟$/,
            function (m) { return 'The project "' + m[1] + '" will be permanently deleted with all its products and images. Are you sure?'; }],
        [/^حذف المنتج "([\s\S]*)" نهائياً؟$/, function (m) { return 'Permanently delete the product "' + m[1] + '"?'; }]
    ];

    /* ---------- الترجمة ---------- */
    function tr(s) {
        if (lang !== 'en' || typeof s !== 'string') return s;
        const parts = s.match(/^(\s*)([\s\S]*?)(\s*)$/);
        const core = parts[2].replace(/\s+/g, ' ');
        if (!core) return s;
        let out;
        if (Object.prototype.hasOwnProperty.call(EN, core)) {
            out = EN[core];
        } else if (core.charAt(core.length - 1) === ':' && Object.prototype.hasOwnProperty.call(EN, core.slice(0, -1))) {
            out = EN[core.slice(0, -1)] + ':'; // عناوين مثل "المشروع:"
        } else {
            for (let i = 0; i < PATTERNS.length; i++) {
                const m = PATTERNS[i][0].exec(parts[2]);
                if (m) { out = PATTERNS[i][1](m, tr); break; }
            }
        }
        return out === undefined ? s : parts[1] + out + parts[3];
    }

    const ATTRS = ['placeholder', 'title', 'alt', 'aria-label'];
    const SKIP_TAGS = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1 };

    function textNode(n) {
        const p = n.parentElement;
        if (p && (SKIP_TAGS[p.tagName] || p.closest('[data-no-i18n]'))) return;
        const t = tr(n.nodeValue);
        if (t !== n.nodeValue) n.nodeValue = t;
    }

    function attrsOf(el) {
        ATTRS.forEach(function (a) {
            if (el.hasAttribute && el.hasAttribute(a)) {
                const v = el.getAttribute(a), t = tr(v);
                if (t !== v) el.setAttribute(a, t);
            }
        });
    }

    function translateTree(root) {
        if (root.nodeType === 3) { textNode(root); return; }
        if (root.nodeType !== 1) return;
        attrsOf(root);
        root.querySelectorAll('[placeholder],[title],[alt],[aria-label]').forEach(attrsOf);
        const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        let n;
        while ((n = w.nextNode())) textNode(n);
    }

    if (lang === 'en') {
        translateTree(document.documentElement);
        new MutationObserver(function (list) {
            list.forEach(function (m) {
                if (m.type === 'childList') m.addedNodes.forEach(translateTree);
                else if (m.type === 'characterData') textNode(m.target);
                else if (m.type === 'attributes') attrsOf(m.target);
            });
        }).observe(document.documentElement, {
            childList: true, subtree: true, characterData: true,
            attributes: true, attributeFilter: ATTRS
        });

        // رسائل confirm/alert خارج الصفحة
        const nativeConfirm = window.confirm.bind(window);
        const nativeAlert = window.alert.bind(window);
        window.confirm = function (m) { return nativeConfirm(tr(m)); };
        window.alert = function (m) { return nativeAlert(tr(m)); };
    }

    window.I18n = { lang: function () { return lang; }, set: setLang, tr: tr };
})();
