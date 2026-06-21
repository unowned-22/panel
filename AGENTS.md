# AGENTS.md — Unowned Architecture Guide

> This document describes the project architecture for developers and AI agents. Read it before making any changes.

---

## Technology Stack

| Layer               | Tool                                         |
| ------------------- |----------------------------------------------|
| Framework           | React 19 + TypeScript (strict)               |
| Build Tool          | Vite                                         |
| Styling             | Tailwind CSS v4                              |
| Routing             | React Router v7                              |
| Server State        | TanStack React Query                         |
| Client State        | Zustand (persist middleware)                 |
| UI Components       | shadcn/ui (Radix UI)                         |
| i18n                | Custom provider (`TranslationProvider`)      |
| HTTP                | Custom `ApiClient` (`src/lib/api-client.ts`) |
| Forms               | Native controlled components                 |
| Meta Tags           | react-helmet-async                           |
| Toast Notifications | sonner + shadcn/ui toaster                   |

---

## Directory Structure

```text
src/
├── App.tsx                    # Root: provider tree + BrowserRouter
├── main.tsx                   # createRoot, style imports
│
├── routing/                   # Top-level routing
│   ├── app-routing.tsx        # Loading bar + AppRoutingSetup
│   └── app-routing-setup.tsx  # <Routes> with RequireAuth and layouts
│
├── auth/                      # Everything related to authentication
│   ├── auth-model.ts          # Types: AuthModel, UserModel, UUID
│   ├── auth.store.ts          # Zustand store (tokens, activeAccountId, user)
│   ├── auth-actions.ts        # All auth API operations (login, logout, register…)
│   ├── auth-routing.tsx       # <Routes> for /auth/*
│   ├── require-auth.tsx       # Guard: redirect to /auth/login if no token exists
│   ├── use-auth.ts            # Hook: combines store + authActions
│   └── pages/                 # Pages: login, registration, verify-email…
│
├── me/                        # Current user feature module
│   ├── pages/                 # home, settings, account, add-account, feed
│   └── components/
│       ├── avatar-editor/     # Full wizard: upload → crop → thumbnail
│       ├── cover-editor/      # Cover image cropping modal
│       └── settings/          # SettingsModal + UI elements
│
├── profile/                   # External profile feature module
│   └── pages/profile.tsx
│
├── layouts/
│   ├── auth/layout.tsx        # Wrapper for /auth/* pages
│   ├── error/layout.tsx       # Wrapper for error pages
│   └── main/                  # Main layout: TopBar + Sidebar + <Outlet>
│       ├── layout.tsx
│       ├── top-bar.tsx        # Avatar, account menu, language switcher, logout
│       ├── sidebar.tsx        # Navigation (icons + labels)
│       ├── sidebar-nav-item.tsx
│       └── types.ts           # NavItem, NavConfig
│
├── context/                   # React Context — context definition only
│   ├── account-context.ts     # Account, AccountContextValue, COLORS, STORAGE_KEY
│   ├── settings-context.ts    # NavItemKey, NavItemDef, ALL_NAV_ITEMS, DEFAULT_VISIBLE
│   ├── stories-context.ts     # StoryItem, StoryUser, StoriesContextValue
│   └── translation-context.ts # Language, dictionaries, TranslationContextType
│
├── provider/                  # Providers — logic + data for contexts
│   ├── account-provider.tsx   # Multi-account management + auth store sync
│   ├── settings-provider.tsx  # Nav item visibility + API sync
│   ├── stories-provider.tsx   # Mock stories data (TODO: API)
│   ├── translation-provider.tsx # Language: localStorage + API preferences
│   └── tooltips-provider.tsx  # TooltipProvider (Radix) with delayDuration=0
│
├── hooks/                     # Thin hooks wrapping contexts
│   ├── use-account.ts         # useAccount() + getInitials()
│   ├── use-settings.ts        # useSettings()
│   ├── use-stories.ts         # useStories()
│   ├── use-toast.ts           # shadcn toast()
│   └── use-translation.ts     # useTranslation() → { t, language, setLanguage }
│
├── lib/                       # Utilities without React
│   ├── api-client.ts          # ApiClient class + singleton apiClient
│   ├── query-client.ts        # Configured QueryClient
│   ├── user-preferences.ts    # fetch/save UserPreferences (nav_config + language)
│   ├── helpers.ts             # toAbsoluteUrl()
│   └── utils.ts               # cn() (clsx + tailwind-merge)
│
├── errors/                    # 404 and other error pages
│   ├── error-404.tsx
│   └── error-routing.tsx
│
├── i18n/                      # Translations
│   ├── types.ts               # Language, TranslationDictionary
│   ├── en.ts, ru.ts, ua.ts…   # Dictionaries (7 languages)
│   └── de.ts, es.ts, fr.ts, it.ts
│
├── components/
│   ├── common/                # Reusable project components
│   │   └── screen-loader.tsx
│   └── ui/                    # shadcn/ui (DO NOT EDIT MANUALLY)
│
└── styles/
    └── index.css              # Tailwind + theme CSS variables
```

---

## Core Patterns

### 1. Context / Provider / Hook Trio

Every feature follows the same pattern:

```text
context/foo-context.ts      → createContext() + types + constants
provider/foo-provider.tsx   → logic, state, useEffect → <FooContext.Provider>
hooks/use-foo.ts            → useContext(FooContext) with guard
```

Never place business logic directly inside a Context file. Context files only define the structure.

### 2. Auth Store — Single Source of Truth for Sessions

`auth.store.ts` (Zustand + persist) stores:

* `tokens: Record<accountId, AuthModel>` — tokens for all accounts
* `activeAccountId: string | null` — currently active account
* `user: UserModel | undefined` — profile of the active account (not persisted)

All token operations must go through `useAuthStore.getState()` or `useAuthStore(selector)`.

### 3. ApiClient — Single Instance

`src/lib/api-client.ts` exports the singleton `apiClient`. Use it everywhere. It automatically:

* Adds `Authorization: Bearer` from the active account
* Refreshes tokens on HTTP 401 while deduplicating concurrent refresh requests
* Redirects to `/auth/login` if authorization ultimately fails

```ts
// Correct
import { apiClient } from '@/lib/api-client';

const data = await apiClient.get<{ data: Foo }>('/foo');

// Incorrect
fetch('/foo') // never use directly
```

### 4. API Responses

All API responses are wrapped in `{ data: T }`.

```ts
const res = await apiClient.get<{ data: UserModel }>('/users/me');
const user = res.data; // UserModel
```

### 5. Multi-Account Support

* Each account has an `id` in the format `acc_<base36>` or `acc_migrated`
* Account switching = `useAuthStore.getState().setActiveAccountId(id)` + `window.location.href`
* `AccountProvider` stores visual account data in localStorage (`un_accounts_v1`)
* Auth store persists as `unowned_auth_v2` (includes migration from v1)

### 6. Translations

```ts
const { t } = useTranslation();

t('page.home.edit.profile');
```

All translation keys are typed via `keyof TranslationDictionary`.

When adding a new key, add it to all 7 dictionaries (`en`, `ru`, `ua`, `it`, `es`, `fr`, `de`).

### 7. UserPreferences (nav_config + language)

Both values are synchronized through `src/lib/user-preferences.ts`.

Built-in request deduplication ensures that both providers (Settings and Translation) can call `fetchUserPreferences()`, while only a single HTTP request is sent per session.

Call `clearPreferencesCache()` on logout.

---

## Known Technical Debt

| Location                         | Issue                                                                                                |
| -------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `provider/tooltips-provider.tsx` | Unnecessary `'use client'` directive (Next.js artifact) — remove                                     |
| `layouts/main/sidebar.tsx`       | Duplicates `ICON_MAP`, `LABEL_KEY`, and `TO` from `settings-context.ts` — should use `ALL_NAV_ITEMS` |
| `me/pages/account.tsx`           | `console.table(accounts)` debug code — remove before release                                         |
| `provider/stories-provider.tsx`  | Hardcoded mock data — should be replaced with API integration                                        |
| `me/pages/home.tsx`              | ~250 lines; should be split into `<ProfileCard>`, `<CoverSection>`, and `<AvatarSection>`            |
| `lib/api-client.ts`              | Duplicated 401 retry logic between `request()` and `requestFormData()`                               |

---

## Adding a New Feature

1. **New route** — add a `<Route>` in `src/routing/app-routing-setup.tsx`
2. **New page** — create a file in `src/<feature>/pages/`
3. **New API call** — create `src/<feature>/<feature>-actions.ts` and use `apiClient`
4. **New global state** — add a context + provider + hook following Pattern #1
5. **New i18n key** — add it to all dictionaries in `src/i18n/*.ts` and to `TranslationDictionary`
6. **New navigation item** — add it to `ALL_NAV_ITEMS` and `DEFAULT_VISIBLE` in `settings-context.ts`, then update `ICON_MAP` and `ORDERED_KEYS` in `sidebar.tsx`

---

## Environment Variables

| Variable        | Required | Description                               |
| --------------- | -------- | ----------------------------------------- |
| `VITE_API_URL`  | ✅        | Backend base URL (without trailing slash) |
| `VITE_BASE_URL` | ❌        | Application base path (defaults to `/`)   |

Example `.env.local`:

```env
VITE_API_URL=https://api.example.com
VITE_BASE_URL=/
```

---

## Running the Project

```bash
npm install
npm run dev        # Development server
npm run build      # Production build
npm run preview    # Preview production build
npm run lint       # ESLint checks
```

---

## Important Restrictions

* **Do not use** `fetch()` directly — always use `apiClient`
* **Do not edit** files in `src/components/ui/` manually — these are managed by shadcn/ui and updated via CLI
* **Do not add** business logic to files in `src/context/` — only types and `createContext()`
* **Do not forget** to add translations to all 7 languages simultaneously
* **Do not use** `window.localStorage` directly for user preferences — use `user-preferences.ts`
