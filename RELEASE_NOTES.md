# Instagram Unfollow Tracker v1.5.0 Release Notes

**Release Date:** January 14, 2026

We're excited to announce **v1.5.0** — a major internationalization milestone with 10 languages, full RTL support, and comprehensive error handling!

## 🎉 What's New in 1.5.0

### 🌍 10 Languages with Full i18n

- **Arabic (RTL)** — 10th language with complete right-to-left layout support
- **Dynamic Meta Tags** — localized titles, descriptions, and OG images per language
- **80 Pre-rendered Pages** — SSG for instant load and SEO optimization
- **Browser Detection** — auto-redirects to user's preferred language

| Language         | Code | RTL |
| ---------------- | ---- | --- |
| English          | en   | —   |
| Español          | es   | —   |
| Русский          | ru   | —   |
| Deutsch          | de   | —   |
| Português        | pt   | —   |
| Türkçe           | tr   | —   |
| हिन्दी           | hi   | —   |
| Bahasa Indonesia | id   | —   |
| 日本語           | ja   | —   |
| العربية          | ar   | ✅  |

### 🎨 System Theme Toggle

- **3-way theme** — Light / Dark / System
- **Respects OS preference** — automatic switching with `prefers-color-scheme`
- **Persistent choice** — remembers your preference

### 🛡️ Error Handling

- **ErrorBoundary** — graceful error recovery with user-friendly UI
- **404 Page** — custom not found page
- **RouteErrorPage** — handles routing errors

### 📱 Rescue Plan Banner

- **Progressive disclosure** — collapsible banner with smart timing
- **Affiliate recommendations** — tiered by account size and loss severity

## ⚡ Performance

| Metric             | v1.0.0 | v1.5.0 |
| ------------------ | ------ | ------ |
| Languages          | 1      | 10     |
| Pre-rendered pages | 0      | 80     |
| INP                | 350ms  | 180ms  |
| LCP                | 2.0s   | 1.3s   |
| Test count         | 151    | 1,601  |

## 🚀 Since v1.0.0

### v1.4.0 (Jan 12, 2026)

- Wizard deep links (`/wizard/step/N`)
- Calendar reminder for data download
- GitHub source link in footer

### v1.3.0 (Jan 11, 2026)

- SSG with path-based routing (80 pages)
- Web Worker filtering via Comlink (INP: 350ms → 180ms)
- PWA support with 176 precached entries
- Self-hosted fonts (LCP -400ms)
- Dynamic OG images

### v1.2.0 (Jan 10, 2026)

- 9 languages (ES, RU, DE, PT, TR, HI, ID, JA)
- FAQ section with Schema.org markup
- HowTo section with structured data

### v1.1.0 (Jan 7, 2026)

- Sample data mode (`/sample`)
- Diagnostic error screen
- BuyMeACoffee widget

## 🔧 Technical Highlights

### Architecture

- **URL as Single Source of Truth** — language determined from URL path
- **Centralized Config** — `src/config/languages.ts` for all language constants
- **Full Page Reload** — language switch triggers reload for correct SSG meta

### Code Quality

- **1,601 Tests** — comprehensive test suite (up from 151)
- **98% Coverage** — maintained through all changes
- **TypeScript Strict** — zero `any` types
- **ESLint Strict** — zero warnings

## 📦 New Dependencies

| Package                                | Purpose                  |
| -------------------------------------- | ------------------------ |
| @fontsource-variable/inter             | Self-hosted fonts        |
| @fontsource-variable/plus-jakarta-sans | Self-hosted fonts        |
| comlink                                | Web Worker communication |
| vite-plugin-pwa                        | PWA support              |

## 🔄 Migration from v1.4.x

**No breaking changes!** Simply update and enjoy the new features.

### What to Expect

1. **First load** — may take a moment to cache PWA assets
2. **Language detection** — app will redirect to your browser's language
3. **Theme preference** — defaults to system, remembers your choice

## 🐛 Known Issues

None at this time! If you encounter any issues:

- Check [Troubleshooting Guide](docs/troubleshooting.md)
- Search [existing issues](https://github.com/ignromanov/instagram-unfollow-tracker/issues)
- [Report a new issue](https://github.com/ignromanov/instagram-unfollow-tracker/issues/new/choose)

## 🔮 What's Next

- **JSON vs HTML Quiz** — interactive guide for correct file upload
- **Mobile File Picker UX** — iOS/Android-specific hints
- **Historical Comparison** — compare multiple data exports

See our [Roadmap](docs/roadmap.md) for the full list.

---

## 🚀 Get Started

**Try it now:** [safeunfollow.app](https://safeunfollow.app)

**Source code:** [github.com/ignromanov/instagram-unfollow-tracker](https://github.com/ignromanov/instagram-unfollow-tracker)

**Questions?** Check the [FAQ](docs/faq.md) or [open an issue](https://github.com/ignromanov/instagram-unfollow-tracker/issues)

---

**Remember:** All your data stays on your device. We never collect, store, or transmit your Instagram data. Now in 10 languages! 🌍
