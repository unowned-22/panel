import type { TranslationDictionary } from './types';

export const ua: TranslationDictionary = {
    'name': 'Unowned',
    'sidebar.profile': 'Профіль',
    'sidebar.feed': 'Стрічка',
    'sidebar.messenger': 'Месенджер',
    'sidebar.calls': 'Дзвінки',
    'sidebar.friends': 'Друзі',
    'sidebar.groups': 'Спільноти',
    'sidebar.photos': 'Фото',
    'sidebar.clips': 'Кліпи',
    'sidebar.video': 'Відео',
    'sidebar.music': 'Музика',
    'sidebar.games': 'Ігри',
    'sidebar.stickers': 'Стікери',
    'sidebar.market': 'Маркет',
    'sidebar.services': 'Сервіси',
    'sidebar.voices': 'Голоси',
    'sidebar.bookmarks': 'Збережене',
    'sidebar.help': 'Допомога',
    'topbar.menu.your.accounts': 'Ваші акаунти',
    'topbar.menu.mine.accounts': 'Мої акаунти',
    'topbar.menu.settings': 'Налаштування',
    'topbar.menu.logout': 'Вийти',
    'topbar.menu.account.delete': 'Видалити акаунт',

    // ── Profile page ───────────────────────────────────────────────────────
    'page.profile.learn.more': 'Докладніше',
    'page.profile.add.friend': 'Додати в друзі',

    // ── Home page ──────────────────────────────────────────────────────────
    'page.home.new.story': 'Створити історію',
    'page.home.story.published': 'Опубліковано',
    'page.home.view.story': 'Переглянути історію',
    'page.home.my.stories': 'Мої історії',
    'page.home.story.publish.error': 'Не вдалося опублікувати історію. Спробуйте ще раз.',
    'page.home.open.photo': 'Відкрити зображення',
    'page.home.change.cover': 'Змінити обкладинку',
    'page.home.upload.image': 'Завантажити зображення',
    'page.home.change.photo': 'Змінити зображення',
    'page.home.delete.photo': 'Видалити зображення',
    'page.home.about.text': 'Вкажіть інформацію про себе',
    'page.home.edit.profile': 'Редагувати профіль',
    'page.home.analytics': 'Аналітика',
    'page.home.more': 'Ще',
    'page.home.my.questions': 'Мої запитання',
    'page.home.my.wishlist': 'Мої бажання',
    'page.home.memories': 'Спогади',

    // ── Account page ──────────────────────────────────────────────────────────
    'page.account.back': 'Назад',
    'page.account.manage.account.add': 'Додати акаунт',
    'page.account.manage.account.confirm': 'Підтвердити',
    'page.account.manage.account.switch': 'Перемкнутися',
    'page.account.manage.account.active': 'Активний',
    'page.account.manage.accounts': 'Керування акаунтами',
    'page.account.manage.accounts.desc': 'Додавайте, перемикайтеся та видаляйте облікові записи',
    'page.account.manage.accounts.security': 'Безпека',
    'page.account.manage.accounts.security.desc': 'Усі акаунти зберігаються локально у вашому браузері. Дані не надсилаються на сервер.',
    'page.account.manage.accounts.notifications': 'Сповіщення',
    'page.account.manage.accounts.notifications.desc': 'Сповіщення та налаштування зберігаються окремо для кожного акаунта.',

    // ── Add account page ──────────────────────────────────────────────────────
    'page.account.add.title': 'Додати акаунт',
    'page.account.add.subtitle': 'Увійдіть в інший акаунт, щоб перемикатися між ними',
    'page.account.add.back': 'Назад до акаунтів',
    'page.account.add.submit': 'Додати акаунт',
    'page.account.add.error': 'Не вдалося додати акаунт. Перевірте дані для входу.',

    // ── Settings page ──────────────────────────────────────────────────────────
    'page.settings.general': 'Загальне',
    'page.settings.cancel': 'Скасувати',
    'page.settings.save': 'Зберегти',
    'page.settings.games.apps': 'Ігри та застосунки',
    'page.settings.menu.settings': 'Меню сайту',
    'page.settings.setup.menu.items': 'Налаштувати пункти меню',
    'page.settings.section.account': 'Акаунт і зовнішній вигляд',
    'page.settings.modal.setup.items': 'Налаштування пунктів меню',

    // ── Shared auth ──────────────────────────────────────────────────────────
    'page.auth.back-to-login': '← Повернутися до входу',

    // ── Login page ───────────────────────────────────────────────────────────
    'page.auth.login': 'Логін',
    'page.auth.registration': 'Зареєструватися',
    'page.auth.login.subtitle': 'Раді вас бачити',
    'page.auth.login.password': 'Пароль',
    'page.auth.login.forgot-password': 'Забули пароль?',
    'page.auth.login.submit': 'Увійти',
    'page.auth.login.no-account': 'Немає акаунту? {link}',

    // ── Registration page ─────────────────────────────────────────────────────
    'page.auth.registration.subtitle': 'Створіть акаунт, щоб спілкуватися',
    'page.auth.registration.full-name': "Ім'я та прізвище",
    'page.auth.registration.username': "Ім'я користувача",
    'page.auth.registration.phone': 'Номер телефону',
    'page.auth.registration.password': 'Пароль',
    'page.auth.registration.confirm-password': 'Повторіть пароль',
    'page.auth.registration.fill-all-fields': 'Заповніть усі поля',
    'page.auth.registration.passwords-mismatch': 'Паролі не збігаються',
    'page.auth.registration.password-too-short': 'Пароль має бути не менше 8 символів',
    'page.auth.registration.submit': 'Створити акаунт',
    'page.auth.registration.have-account': 'Вже є акаунт?',

    // ── Forgot password page ──────────────────────────────────────────────────
    'page.auth.forgot-password.title': 'Відновлення пароля',
    'page.auth.forgot-password.subtitle': 'Введіть email — ми надішлемо посилання для скидання',
    'page.auth.forgot-password.submitted-message':
        'Якщо акаунт з адресою {email} існує, на нього надійде лист із посиланням для скидання пароля.',
    'page.auth.forgot-password.no-email': 'Не отримали лист? Перевірте папку «Спам» або',
    'page.auth.forgot-password.try-again': 'спробуйте ще раз',
    'page.auth.forgot-password.sending': 'Надсилання…',
    'page.auth.forgot-password.send-link': 'Надіслати посилання',

    // ── Reset password page ───────────────────────────────────────────────────
    'page.auth.reset-password.title': 'Новий пароль',
    'page.auth.reset-password.subtitle': 'Придумайте надійний пароль для вашого акаунту',
    'page.auth.reset-password.new-password': 'Новий пароль',
    'page.auth.reset-password.confirm-password': 'Підтвердіть пароль',
    'page.auth.reset-password.error-min-length': 'Пароль має містити не менше 8 символів.',
    'page.auth.reset-password.error-mismatch': 'Паролі не збігаються.',
    'page.auth.reset-password.error-invalid-link': 'Посилання недійсне або застаріло. Запросіть нове.',
    'page.auth.reset-password.saving': 'Збереження…',
    'page.auth.reset-password.submit': 'Зберегти пароль',

    // ── Verify email page ─────────────────────────────────────────────────────
    'page.auth.verify-email.title': 'Підтвердження email',
    'page.auth.verify-email.loading': 'Перевіряємо токен…',
    'page.auth.verify-email.pending-title': 'Підтвердіть email',
    'page.auth.verify-email.sent-message':
        'Ми надіслали лист на {email}. Перевірте пошту та дотримуйтесь інструкцій.',
    'page.auth.verify-email.token-missing': 'Токен не знайдено в посиланні.',
    'page.auth.verify-email.no-email-toast': 'Email не вказано',
    'page.auth.verify-email.sending': 'Надсилаємо…',
    'page.auth.verify-email.resend-cooldown': 'Надіслати повторно ({seconds}s)',
    'page.auth.verify-email.resend': 'Надіслати повторно',
    'page.auth.verify-email.go-to-login': 'Перейти на сторінку входу',
    'page.auth.verify-email.success-title': 'Email підтверджено!',
    'page.auth.verify-email.success-message': 'Тепер ви можете увійти до акаунту.',
    'page.auth.verify-email.login': 'Увійти',
    'page.auth.verify-email.error-title': 'Не вдалося підтвердити email',
    'page.auth.verify-email.error-default': 'Невірний або застарілий токен.',
    'page.auth.verify-email.sent-toast-title': 'Лист надіслано',
    'page.auth.verify-email.sent-toast-desc': 'Лист надіслано на {email}',
    'page.auth.verify-email.error-send-failed': 'Не вдалося надіслати лист',
    'page.auth.verify-email.to-login': 'На сторінку входу',

    // ── 404 ─────────────────────────────────────────────────────
    'page.error.404': 'Помилка 404',
    'page.error.lost.page': 'Ми не можемо знайти цю сторінку',
    'page.error.return': 'На головну',
    'page.error.page.missing': 'Запитувану сторінку не знайдено&nbsp;',
};