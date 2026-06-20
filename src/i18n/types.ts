export type Language = 'en' | 'ua' | 'it' | 'es' | 'fr' | 'de' | 'ru';

export interface TranslationDictionary {
    'name': string;
    'sidebar.profile': string;
    'sidebar.feed': string;
    'sidebar.messenger': string;
    'sidebar.calls': string;
    'sidebar.friends': string;
    'sidebar.groups': string;
    'sidebar.photos': string;
    'sidebar.clips': string;
    'sidebar.video': string;
    'sidebar.music': string;
    'sidebar.games': string;
    'sidebar.stickers': string;
    'sidebar.market': string;
    'sidebar.services': string;
    'sidebar.voices': string;
    'sidebar.bookmarks': string;
    'sidebar.help': string;
    'topbar.menu.your.accounts': string;
    'topbar.menu.mine.accounts': string;
    'topbar.menu.settings': string;
    'topbar.menu.logout': string;
    'topbar.menu.account.delete': string;
    'page.auth.login': string;
    'page.auth.registration': string;

    // ── Home page ───────────────────────────────────────────────────────────
    'page.home.new.story': string;
    'page.home.open.photo': string;
    'page.home.change.cover': string;
    'page.home.upload.image': string;
    'page.home.change.photo': string;
    'page.home.delete.photo': string;
    'page.home.about.text': string;
    'page.home.edit.profile': string;
    'page.home.analytics': string;
    'page.home.more': string;
    'page.home.my.questions': string;
    'page.home.my.wishlist': string;
    'page.home.memories': string;

    // ── Home page ───────────────────────────────────────────────────────────
    'page.settings.general': string;
    'page.settings.cancel': string;
    'page.settings.save': string;
    'page.settings.games.apps': string;
    'page.settings.menu.settings': string;
    'page.settings.setup.menu.items': string;
    'page.settings.section.account': string;
    'page.settings.modal.setup.items': string;

    // ── Account page ──────────────────────────────────────────────────────────
    'page.account.back': string;
    'page.account.manage.accounts': string;
    'page.account.manage.account.add': string;
    'page.account.manage.account.confirm': string;
    'page.account.manage.account.switch': string;
    'page.account.manage.account.active': string;
    'page.account.manage.accounts.desc': string;
    'page.account.manage.accounts.security': string;
    'page.account.manage.accounts.security.desc': string;
    'page.account.manage.accounts.notifications': string;
    'page.account.manage.accounts.notifications.desc': string;

    // ── Shared auth ──────────────────────────────────────────────────────────
    'page.auth.back-to-login': string;

    // ── Login page ───────────────────────────────────────────────────────────
    'page.auth.login.subtitle': string;
    'page.auth.login.password': string;
    'page.auth.login.forgot-password': string;
    'page.auth.login.submit': string;
    'page.auth.login.no-account': string;

    // ── Registration page ─────────────────────────────────────────────────────
    'page.auth.registration.subtitle': string;
    'page.auth.registration.full-name': string;
    'page.auth.registration.username': string;
    'page.auth.registration.phone': string;
    'page.auth.registration.password': string;
    'page.auth.registration.confirm-password': string;
    'page.auth.registration.fill-all-fields': string;
    'page.auth.registration.passwords-mismatch': string;
    'page.auth.registration.password-too-short': string;
    'page.auth.registration.submit': string;
    'page.auth.registration.have-account': string;

    // ── Forgot password page ──────────────────────────────────────────────────
    'page.auth.forgot-password.title': string;
    'page.auth.forgot-password.subtitle': string;
    /** Use .replace('{email}', email) in component */
    'page.auth.forgot-password.submitted-message': string;
    'page.auth.forgot-password.no-email': string;
    'page.auth.forgot-password.try-again': string;
    'page.auth.forgot-password.sending': string;
    'page.auth.forgot-password.send-link': string;

    // ── Reset password page ───────────────────────────────────────────────────
    'page.auth.reset-password.title': string;
    'page.auth.reset-password.subtitle': string;
    'page.auth.reset-password.new-password': string;
    'page.auth.reset-password.confirm-password': string;
    'page.auth.reset-password.error-min-length': string;
    'page.auth.reset-password.error-mismatch': string;
    'page.auth.reset-password.error-invalid-link': string;
    'page.auth.reset-password.saving': string;
    'page.auth.reset-password.submit': string;

    // ── Verify email page ─────────────────────────────────────────────────────
    'page.auth.verify-email.title': string;
    'page.auth.verify-email.loading': string;
    'page.auth.verify-email.pending-title': string;
    /** Use .replace('{email}', email) in component */
    'page.auth.verify-email.sent-message': string;
    'page.auth.verify-email.token-missing': string;
    'page.auth.verify-email.no-email-toast': string;
    'page.auth.verify-email.sending': string;
    /** Use .replace('{seconds}', String(cooldown)) in component */
    'page.auth.verify-email.resend-cooldown': string;
    'page.auth.verify-email.resend': string;
    'page.auth.verify-email.go-to-login': string;
    'page.auth.verify-email.success-title': string;
    'page.auth.verify-email.success-message': string;
    'page.auth.verify-email.login': string;
    'page.auth.verify-email.error-title': string;
    'page.auth.verify-email.error-default': string;
    'page.auth.verify-email.sent-toast-title': string;
    /** Use .replace('{email}', email) in component */
    'page.auth.verify-email.sent-toast-desc': string;
    'page.auth.verify-email.error-send-failed': string;
    'page.auth.verify-email.to-login': string;

    // ── 404 page ──────────────────────────────────────────────────
    'page.error.404': string;
    'page.error.return': string;
    'page.error.lost.page': string;
    'page.error.page.missing': string;
}