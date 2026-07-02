export type LanguageCode = 'en' | 'ua' | 'it' | 'es' | 'fr' | 'de' | 'ru';

export interface TranslationDictionary {
    'name': string;
    'errors.error': string;
    'sidebar.profile': string;
    'sidebar.feed': string;
    'sidebar.messenger': string;
    'sidebar.calls': string;
    'sidebar.friends': string;
    'sidebar.groups': string;
    'sidebar.photos': string;
    'sidebar.albums': string;
    'sidebar.articles': string;
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

    // ── Profile page ───────────────────────────────────────────────────────────
    'page.profile.learn.more': string;
    'page.profile.add.friend': string;

    // ── Home page ───────────────────────────────────────────────────────────
    'page.home.new.story': string;
    'page.home.story.published': string;
    'page.home.story.publish.error': string;
    'page.home.view.story': string;
    'page.home.my.stories': string;
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
    'page.home.photos.empty': string;
    'page.home.photos.upload.error': string;
    'page.home.photos.showAll': string;
    'page.home.albums.empty': string;
    'page.home.friends.empty': string;
    'page.home.friends.add': string;
    'page.home.friends.user': string;

    // ── Home page ───────────────────────────────────────────────────────────
    'page.settings.general': string;
    'page.settings.cancel': string;
    'page.settings.save': string;
    'page.settings.games.apps': string;
    'page.settings.menu.settings': string;
    'page.settings.setup.menu.items': string;
    'page.settings.section.account': string;
    'page.settings.section.notifications': string;
    'page.settings.section.security': string;
    'page.settings.section.privacy': string;
    'page.settings.section.apps': string;
    'page.settings.section.blacklist': string;
    'page.settings.section.voices': string;
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

    // ── Add account page ──────────────────────────────────────────────────────
    'page.account.add.title': string;
    'page.account.add.subtitle': string;
    'page.account.add.back': string;
    'page.account.add.submit': string;
    'page.account.add.error': string;
    'page.account.more': string;

    // ── Shared auth ──────────────────────────────────────────────────────────
    'page.auth.back-to-login': string;

    // ── Avatar uploader ───────────────────────────────────────────────────────
    'avatar.uploader.title.upload': string;
    'avatar.uploader.title.profileCrop': string;
    'avatar.uploader.title.thumbnailCrop': string;
    'avatar.uploader.title.complete': string;
    'avatar.uploader.close': string;
    'avatar.uploader.dropzone.help': string;
    'avatar.uploader.dropzone.formats': string;
    'avatar.uploader.dropzone.select': string;
    'avatar.uploader.dropzone.footer': string;
    'avatar.uploader.validation.tooLarge': string;
    'avatar.uploader.validation.unsupportedFormat': string;
    'avatar.uploader.validation.minSize': string;
    'avatar.uploader.validation.readFailed': string;
    'avatar.uploader.profileCrop.description': string;
    'avatar.uploader.profileCrop.rotateLeft': string;
    'avatar.uploader.profileCrop.rotateRight': string;
    'avatar.uploader.profileCrop.saveAndContinue': string;
    'avatar.uploader.saving': string;
    'avatar.uploader.back': string;
    'avatar.uploader.thumbnailCrop.description': string;
    'avatar.uploader.save': string;
    'avatar.uploader.complete.avatarAlt': string;
    'avatar.uploader.complete.thumbnailAlt': string;
    'avatar.uploader.complete.publishPost': string;
    'avatar.uploader.complete.continue': string;

    // ── Login page ───────────────────────────────────────────────────────────
    'page.auth.login': string;
    'page.auth.registration': string;
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

    // ── Stories module ───────────────────────────────────────────────────────
    'stories.viewer.reply.placeholder': string;
    'stories.viewer.reply.sent': string;
    'stories.viewer.like.sent': string;
    'stories.viewer.redirect.link': string;
    'stories.viewer.redirect.output': string;
    'stories.viewer.redirect.cancel': string;
    'stories.viewer.redirect.follow': string;
    'stories.editor.tap.to.edit': string;
    'stories.editor.enter.text': string;
    'stories.editor.drag.drop.photo': string;
    'stories.editor.select.file': string;
    'stories.editor.select.background': string;
    'stories.editor.hint.double.click': string;
    'stories.editor.menu.text': string;
    'stories.editor.menu.photo': string;
    'stories.editor.menu.stickers': string;
    'stories.editor.menu.paintbrush': string;
    'stories.editor.menu.background': string;
    'stories.editor.menu.filters': string;
    'stories.editor.menu.color': string;
    'stories.editor.menu.link': string;
    'stories.editor.audience.everyone': string;
    'stories.editor.audience.friends': string;
    'stories.editor.audience.close': string;
    'stories.editor.time.shown': string;
    'stories.editor.hour': string;
    'stories.editor.hours': string;
    'stories.editor.tag.ad': string;
    'stories.editor.bring.forward': string;
    'stories.editor.send.backward': string;
    'stories.editor.publish': string;
    'stories.editor.slide.info': string;
    'stories.editor.bg.desc': string;
    'stories.editor.bg.title': string;
    'stories.editor.bg.color': string;
    'stories.editor.cc.title': string;
    'stories.editor.cc.contrast': string;
    'stories.editor.cc.warmth': string;
    'stories.editor.cc.saturation': string;
    'stories.editor.cc.sharpness': string;
    'stories.editor.cc.noise': string;
    'stories.editor.cc.vignette': string;
    'stories.editor.pb.title': string;
    'stories.editor.pb.desc': string;
    'stories.editor.pb.clear': string;
    'stories.editor.pb.fixed': string;
    'stories.editor.stickers.title': string;
    'stories.editor.stickers.add.link': string;
    'stories.editor.stickers.add': string;
    'stories.editor.text.title': string;
    'stories.editor.text.fallback': string;
    'stories.editor.text.content': string;
    'stories.editor.text.style': string;
    'stories.editor.text.size': string;
    'stories.editor.text.color': string;
    'stories.editor.text.fill.none': string;
    'stories.editor.text.fill.filled': string;
    'stories.editor.text.fill.outline': string;
    'stories.editor.filters.title': string;
    'stories.editor.link.title': string;
    'stories.editor.link.style.label': string;
    'stories.editor.link.style.pill.desc': string;
    'stories.editor.link.style.card.desc': string;
    'stories.editor.link.caption.label': string;
    'stories.editor.link.optional': string;
    'stories.editor.link.caption.placeholder': string;
    'stories.editor.link.preview.label': string;
    'stories.editor.link.add': string;
    'stories.viewer.delete': string;
    'stories.viewer.delete.error': string;
    'stories.viewer.reply.error': string;
    'stories.viewer.like.error': string;
    'stories.viewer.mute': string;
    'stories.viewer.unmute': string;
    // ── Friends page ──────────────────────────────────────────────────────────
    'page.friends.tabs.all': string;
    'page.friends.tabs.incoming': string;
    'page.friends.tabs.outgoing': string;
    'page.friends.find': string;
    'page.friends.search.placeholder': string;
    'page.friends.empty.noFriends': string;
    'page.friends.empty.findPrompt': string;
    'page.friends.section.friends': string;
    'page.friends.label.friend': string;
    'page.friends.action.remove': string;
    'page.friends.empty.incoming': string;
    'page.friends.empty.incoming.desc': string;
    'page.friends.section.incoming': string;
    'page.friends.action.accept': string;
    'page.friends.action.reject': string;
    'page.friends.empty.outgoing': string;
    'page.friends.empty.outgoing.desc': string;
    'page.friends.section.outgoing': string;
    'page.friends.label.sent': string;
    'page.friends.action.cancel': string;
    'page.friends.section.suggestions': string;
    'page.friends.empty.suggestions': string;
    'page.friends.action.add': string;
    'page.friends.sidebar.title': string;
    'page.friends.sidebar.find': string;
    'page.friends.suggestion.mutual': string;
    // ── Photos module ───────────────────────────────────────────────────────
    'page.photos.title': string;
    'page.albums.title': string;
    'page.photos.photos': string;
    'page.photos.albums': string;
    'page.photos.album': string;
    'page.photos.upload.photo': string;
    'page.photos.cancel': string;
    'page.photos.move': string;
    'page.photos.archive': string;
    'page.photo.archive': string;
    'page.photos.empty.photo': string;
    'page.photos.share': string;
    'page.photos.pin': string;
    'page.photos.delete': string;
    'page.photos.chose.some': string;
    'page.photos.download': string;
    'photos.page.all.users': string;
    'photos.photos.add': string;
    'photos.album.create': string;
    'photos.album.edit': string;
    'photos.album.edit.title': string;
    'photos.album.title': string;
    'photos.album.title.placeholder': string;
    'photos.album.description': string;
    'photos.album.description.placeholder': string;
    'photos.album.privacy.title': string;
    'photos.album.privacy.viewers': string;
    'photos.album.privacy.commenters': string;
    'photos.upload.title': string;
    'photos.upload.none': string;
    'photos.upload.add': string;
    'photos.album.no': string;
    'photos.album.empty': string;
    'photos.photos.photo.count': string;
    'photos.album.move.to.album': string;
    'photos.album.create.success': string;
    'photos.album.create.error': string;
    'photos.album.updated': string;
    'photos.album.delete': string;
    'photos.album.delete.confirm': string;
    'photos.album.delete.success': string;
    'photos.album.delete.error': string;
    'photos.album.photos.empty': string;
    'photos.album.loading': string;
    'photos.delete.confirm': string;
    'photos.delete.success': string;
    'photos.delete.error': string;
    'photos.move.success': string;
    'photos.move.error': string;
    'photos.setcover.success': string;
    'photos.setcover.error': string;
    'photos.comments.loading': string;
    'photos.comments.album': string;
    'photos.comments.photo': string;
    'photos.photos.loading': string;
    'photos.comments.empty': string;
    'photos.comment.placeholder': string;
    'photos.album.privacy.change': string;
    'photos.cover.pick': string;

    // ── Settings – Account section ────────────────────────────────────────────
    'page.settings.account.theme': string;
    'page.settings.account.theme.system': string;
    'page.settings.account.accounts': string;
    'page.settings.account.manage': string;
    'page.settings.account.profile': string;
    'page.settings.account.profile.show.posts': string;
    'page.settings.account.profile.disable.comments': string;
    'page.settings.account.profile.accessibility': string;
    'page.settings.account.content': string;
    'page.settings.account.content.autoplay': string;
    'page.settings.account.content.auto.gif': string;
    'page.settings.account.content.suggest.stickers': string;
    'page.settings.account.content.show.interesting': string;
    'page.settings.account.content.translate.posts': string;
    'page.settings.account.content.feed.order': string;
    'page.settings.account.content.feed.order.value': string;
    'page.settings.account.content.comments.sort': string;
    'page.settings.account.content.comments.sort.value': string;
    'page.settings.account.profanity.filter': string;
    'page.settings.account.profanity.disabled': string;
    'page.settings.account.profanity.change': string;

    // ── Settings – Security section ───────────────────────────────────────────
    'page.settings.security.title': string;
    'page.settings.security.password': string;
    'page.settings.security.password.changed': string;
    'page.settings.security.password.change': string;
    'page.settings.security.2fa': string;
    'page.settings.security.2fa.status': string;
    'page.settings.security.2fa.connect': string;
    'page.settings.security.sessions': string;
    'page.settings.security.sessions.terminate': string;
    'page.settings.security.login.history': string;
    'page.settings.security.login.history.show': string;

    // ── Settings – Privacy section ────────────────────────────────────────────
    'page.settings.privacy.title': string;
    'page.settings.privacy.banner.title': string;
    'page.settings.privacy.banner.desc': string;
    'page.settings.privacy.banner.more': string;
    'page.settings.privacy.item.main.info': string;
    'page.settings.privacy.item.birthday': string;
    'page.settings.privacy.item.saved.photos': string;
    'page.settings.privacy.item.groups': string;
    'page.settings.privacy.item.audio': string;
    'page.settings.privacy.item.video': string;
    'page.settings.privacy.item.gifts': string;
    'page.settings.privacy.item.friends': string;
    'page.settings.privacy.value.all': string;
    'page.settings.privacy.value.only.me': string;
    'page.settings.privacy.value.all.friends': string;

    // ── Settings – Notifications section ─────────────────────────────────────
    'page.settings.notif.site.title': string;
    'page.settings.notif.instant': string;
    'page.settings.notif.sound': string;
    'page.settings.notif.show.text': string;
    'page.settings.notif.browser': string;
    'page.settings.notif.browser.desc': string;
    'page.settings.notif.browser.disabled': string;
    'page.settings.notif.types.title': string;
    'page.settings.notif.types.desc': string;
    'page.settings.notif.for.all': string;
    'page.settings.notif.apply.all': string;
    'page.settings.notif.freq.instant': string;
    'page.settings.notif.freq.daily': string;
    'page.settings.notif.freq.weekly': string;
    'page.settings.notif.freq.off': string;
    'page.settings.notif.type.messages': string;
    'page.settings.notif.type.messages.desc': string;
    'page.settings.notif.type.mentions': string;
    'page.settings.notif.type.mentions.desc': string;
    'page.settings.notif.type.likes': string;
    'page.settings.notif.type.likes.desc': string;
    'page.settings.notif.type.shares': string;
    'page.settings.notif.type.shares.desc': string;
    'page.settings.notif.type.comments': string;
    'page.settings.notif.type.comments.desc': string;
    'page.settings.notif.type.friends': string;
    'page.settings.notif.type.friends.desc': string;
    'page.settings.notif.type.groups': string;
    'page.settings.notif.type.groups.desc': string;

    // ── Settings – Blacklist section ──────────────────────────────────────────
    'page.settings.blacklist.title': string;
    'page.settings.blacklist.add': string;
    'page.settings.blacklist.search': string;
    'page.settings.blacklist.empty.title': string;
    'page.settings.blacklist.empty.desc': string;

    // ── Settings – Apps section ───────────────────────────────────────────────
    'page.settings.apps.title': string;
    'page.settings.apps.connected': string;
    'page.settings.apps.connected.none': string;
    'page.settings.apps.games': string;
    'page.settings.apps.games.manage': string;

    // ── Settings – Voices section ─────────────────────────────────────────────
    'page.settings.voices.balance.title': string;
    'page.settings.voices.desc.1': string;
    'page.settings.voices.desc.2': string;
    'page.settings.voices.desc.2.link': string;
    'page.settings.voices.account': string;
    'page.settings.voices.balance': string;
    'page.settings.voices.balance.value': string;
    'page.settings.voices.payment': string;
    'page.settings.voices.payment.show': string;
    'page.settings.voices.topup': string;
    'page.settings.voices.topup.btn': string;
    'page.settings.voices.partners': string;
    'page.settings.voices.promo': string;
    'page.settings.voices.support': string;
    'page.settings.voices.support.link': string;
    'page.settings.voices.subscriptions': string;
    'page.settings.voices.music.sub': string;
    'page.settings.voices.music.sub.btn': string;
    'photos.bulk.delete.success': string;
    'photos.delete.confirm.title': string;
    'photos.bulk.delete.confirm': string;
    'photos.selected.count': string;
    'photos.selected.none': string;

    // ── Cover editor ──────────────────────────────────────────────────────────
    'cover.modal.title.edit': string;
    'cover.modal.title.add': string;
    'cover.modal.preview': string;
    'cover.modal.cancel': string;
    'cover.modal.set': string;
    'cover.modal.hint': string;
    'cover.modal.close': string;
    'cover.load.error': string;
    'cover.crop.loading': string;
    'cover.crop.label.mobile': string;
    'cover.crop.label.desktop': string;
    'cover.crop.legend.mobile': string;
    'cover.crop.legend.desktop': string;
    'cover.preview.title': string;
    'cover.preview.hint': string;
    'cover.preview.return': string;
    'cover.preview.set': string;
    'cover.preview.tab.desktop': string;
    'cover.preview.tab.mobile': string;
    'cover.upload.title': string;
    'cover.upload.desc': string;
    'cover.upload.btn': string;
    'cover.upload.hint': string;

    // ── Notifications ─────────────────────────────────────────────────────────
    'notif.page.title': string;
    'notif.mark.all.read': string;
    'notif.settings': string;
    'notif.empty.category': string;
    'notif.empty.list': string;
    'notif.load.more': string;
    'notif.show.all': string;
    'notif.loading': string;
    'notif.no.more': string;
    'notif.action.mark.read': string;
    'notif.action.mark.unread': string;
    'notif.action.menu': string;

    'notif.section.profile': string;
    'notif.section.groups': string;
    'notif.section.feedback': string;
    'notif.section.friends': string;
    'notif.section.services': string;
    'notif.section.communication': string;
    'notif.section.account': string;

    'notif.time.now': string;
    /** Use .replace('{n}', n) */
    'notif.time.minutes': string;
    /** Use .replace('{n}', n) */
    'notif.time.hours': string;
    'notif.time.yesterday': string;
    /** Use .replace('{n}', n) */
    'notif.time.days': string;

    /** Use .replace('{name}', name) */
    'notif.type.friendRequestReceived': string;
    /** Use .replace('{name}', name) */
    'notif.type.friendRequestAccepted': string;
    /** Use .replace('{name}', name) */
    'notif.type.storyPublished': string;
    /** Use .replace('{name}', name).replace('{title}', title) */
    'notif.type.storyPublishedTitled': string;
    /** Use .replace('{name}', name) */
    'notif.type.storyLike': string;
    /** Use .replace('{name}', name) */
    'notif.type.storyComment': string;
    /** Use .replace('{name}', name) */
    'notif.type.storyReply': string;
    /** Use .replace('{name}', name) */
    'notif.type.mention': string;
    /** Use .replace('{name}', name) */
    'notif.type.message': string;
    'notif.type.newLogin': string;
    'notif.type.accountSecurity.title': string;
    'notif.type.accountSecurity.desc': string;
    'notif.type.service': string;
    'notif.type.default': string;
    'notif.someone': string;

    // ── Messenger module ──────────────────────────────────────────────────────
    'messenger.chatMenu.markUnread': string;
    'messenger.chatMenu.pin': string;
    'messenger.chatMenu.unpin': string;
    'messenger.chatMenu.archive': string;
    'messenger.chatMenu.mute': string;
    'messenger.chatMenu.mute.1h': string;
    'messenger.chatMenu.mute.8h': string;
    'messenger.chatMenu.mute.1w': string;
    'messenger.chatMenu.mute.forever': string;
    'messenger.chatMenu.deleteChat': string;
    'messenger.chatMenu.clearHistory': string;
    'messenger.chatMenu.leaveChat': string;
    'messenger.chatMenu.toast.markedUnread': string;
    'messenger.chatMenu.toast.pinned': string;
    'messenger.chatMenu.toast.archived': string;
    'messenger.chatMenu.toast.muted': string;
    'messenger.chatMenu.toast.deleted': string;
    'messenger.chatMenu.toast.cleared': string;
    'messenger.chatMenu.toast.left': string;
    'messenger.attach.photo': string;
    'messenger.attach.video': string;
    'messenger.attach.music': string;
    'messenger.attach.service': string;
    'messenger.attach.file': string;
    'messenger.attach.map': string;
    'messenger.attach.poll': string;
    'messenger.attach.comingSoon.service': string;
    'messenger.attach.comingSoon.map': string;
    'messenger.attach.comingSoon.poll': string;
    'messenger.msgMenu.reply': string;
    'messenger.msgMenu.forward': string;
    'messenger.msgMenu.forward.toSaved': string;
    'messenger.msgMenu.forward.pickChat': string;
    'messenger.msgMenu.pin': string;
    'messenger.msgMenu.unpin': string;
    'messenger.msgMenu.markImportant': string;
    'messenger.msgMenu.unmarkImportant': string;
    'messenger.msgMenu.copyText': string;
    'messenger.msgMenu.edit': string;
    'messenger.msgMenu.delete': string;
    'messenger.msgMenu.select': string;
    'messenger.msgMenu.toast.copied': string;
    'messenger.msgMenu.toast.forwardedToSaved': string;
    'messenger.msgMenu.toast.markedImportant': string;
    'messenger.msgMenu.toast.unmarkedImportant': string;
    'messenger.msgMenu.toast.editComingSoon': string;
    'messenger.msgMenu.toast.selected': string;
    'messenger.favorites.name': string;
    'messenger.favorites.defaultPreview': string;
    'messenger.info.call': string;
    'messenger.info.call.audio': string;
    'messenger.info.call.video': string;
    'messenger.info.mute.on': string;
    'messenger.info.mute.off': string;
    'messenger.info.more': string;
    'messenger.info.more.mentionSettings': string;
    'messenger.info.stickers': string;
    'messenger.info.members': string;
    'messenger.info.members.add': string;
    'messenger.info.members.search': string;
    'messenger.info.link.title': string;
    'messenger.info.link.tab.link': string;
    'messenger.info.link.tab.qr': string;
    'messenger.info.link.showRecent': string;
    'messenger.info.link.revoke': string;
    'messenger.info.link.revokeQr': string;
    'messenger.info.link.copy': string;
    'messenger.info.link.share': string;
    'messenger.info.link.download': string;
    'messenger.info.settings.title': string;
    'messenger.info.settings.name': string;
    'messenger.info.settings.description': string;
    'messenger.info.settings.save': string;
    'messenger.info.settings.perm.invite': string;
    'messenger.info.settings.perm.editInfo': string;
    'messenger.info.settings.perm.pinned': string;
    'messenger.info.settings.perm.mentionAll': string;
    'messenger.info.settings.perm.viewLink': string;
    'messenger.info.settings.perm.startCalls': string;
    'messenger.info.settings.perm.admins': string;
    'messenger.info.settings.perm.theme': string;
    'messenger.info.settings.perm.everyone': string;
    'messenger.info.settings.perm.ownerOnly': string;
    'messenger.info.toast.pinnedChat': string;
    'messenger.info.toast.archived': string;
    'messenger.info.toast.markedUnread': string;
    'messenger.info.toast.deleted': string;
    'messenger.info.toast.cleared': string;
    'messenger.info.toast.left': string;
    'messenger.info.toast.linkCopied': string;
    'messenger.info.toast.linkRevoked': string;
    'messenger.info.toast.qrRevoked': string;
    'messenger.info.toast.qrDownloaded': string;
    'messenger.info.toast.settingsSaved': string;
    'messenger.info.toast.stickersComingSoon': string;
    'messenger.info.toast.addMembersComingSoon': string;
    'messenger.info.toast.permComingSoon': string;
}