# Instagram Unfollow Tracker

![Privacy: 100% local](https://img.shields.io/badge/Privacy-100%25%20local-success)
![License: MIT](https://img.shields.io/badge/License-MIT-blue)
![Open Source](https://img.shields.io/badge/Open%20Source-Yes-informational)
![Free](https://img.shields.io/badge/Free-Forever-green)
![Coverage: 98%](https://img.shields.io/badge/Coverage-98%25-brightgreen)
![Tests: 151 passed](https://img.shields.io/badge/Tests-151%20passed-success)

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-06B6D4?logo=tailwindcss&logoColor=white)

**Find out who unfollowed you on Instagram** — analyze your Instagram Data Download ZIP locally to discover mutuals, non-mutuals, and connection patterns. No login, no servers, no tracking.

## 🎯 What it does

Upload your Instagram data export and instantly see:

- **Who unfollowed you** — accounts that stopped following you
- **Who you follow but doesn't follow back** — one-way connections
- **Mutual followers** — accounts you both follow
- **Connection patterns** — understand your Instagram network

All processing happens **100% locally** in your browser. Your data never leaves your device.

## ✨ Key Features

- 🔍 **Find unfollowers** — see exactly who stopped following you
- 🔄 **Mutual analysis** — discover who follows you back vs. one-way connections
- 🏷️ **Smart badges** — Following, Followers, Mutuals, Not following back, Not followed back, Pending, Restricted, Close friends, Unfollowed, Dismissed
- 🔎 **Lightning-fast search** — trigram/prefix indexes for instant results (even with 1M+ accounts)
- ⚡ **Optimized for scale** — handles millions of accounts with <5MB memory usage
- 📱 **Responsive design** — works perfectly on desktop and mobile
- 🌙 **Dark mode** — comfortable viewing in any lighting
- 💾 **Smart caching** — instant reload with IndexedDB persistence
- 📊 **Sample data** — try it without uploading your own data

## 🚀 Why choose this over paid tools?

| Feature             | Instagram Unfollow Tracker | Paid Apps (Unfollowgram, etc.) |
| ------------------- | -------------------------- | ------------------------------ |
| **Price**           | 💰 Free forever            | 💸 $5-10/month                 |
| **Privacy**         | 🔒 100% local (no upload)  | ⚠️ Upload to cloud servers     |
| **Instagram Login** | ✅ Not required            | ❌ Required (risky!)           |
| **Account Limit**   | ✅ Unlimited (1M+ tested)  | ⚠️ 10k-100k max                |
| **Data Processing** | ⚡ 5ms (1M accounts)       | 🐌 150ms+                      |
| **Offline Mode**    | ✅ Works offline           | ❌ Requires internet           |
| **Open Source**     | ✅ MIT license             | ❌ Closed source               |
| **Ads/Tracking**    | ✅ None                    | ⚠️ Usually present             |
| **Platform**        | 🌐 Web (all devices)       | 📱 Mobile apps usually         |

### Why This Matters

- **🔒 100% Private** — all processing happens locally in your browser (IndexedDB)
- **💰 Completely Free** — no subscriptions, no hidden costs, no limits
- **🔓 Open Source** — transparent code you can audit and customize
- **⚡ Fast & Offline** — works without internet, 75x faster filtering than competitors
- **🛡️ No Account Risk** — no Instagram login required, respects platform rules
- **🎯 Accurate Results** — clear mutual/non-mutual detection without gimmicks
- **📈 Scales to millions** — handles 1M+ accounts with ease (vs 100k limit in paid apps)

## 🚀 Quick Start

### Try it online

Visit the live demo: **[ignromanov.github.io/instagram-unfollow-tracker](https://ignromanov.github.io/instagram-unfollow-tracker)**

### Run locally

```bash
git clone https://github.com/ignromanov/instagram-unfollow-tracker.git
cd instagram-unfollow-tracker
npm install
npm run dev
```

Open the app and click **"Upload ZIP"** to load your Instagram Data Download, or **"Load sample"** to try the built-in demo data.

## 📥 How to get your Instagram data

### Quick Steps:

1. Go to [Meta Accounts Center](https://accountscenter.instagram.com/)
2. Navigate to **Your information and permissions** → **Download your information**
3. Select:
   - **Some of your information**
   - **Section**: Followers and Following
   - **Format**: JSON
   - **Date range**: All time
4. Download the ZIP file and upload it in the app

📖 **Detailed step-by-step guide**: Click the "❓ Help" button in the app for complete instructions with screenshots

## 🔒 Privacy & Security

- **100% Local Processing** — your data never leaves your device
- **No Data Collection** — we don't collect, send, or store any of your information
- **No Instagram Login** — works with your data export only
- **Open Source** — you can audit the code yourself

## ⚡ Performance

Built to handle massive datasets with cutting-edge optimization:

| Metric               | 10k accounts | 100k accounts | 1M accounts |
| -------------------- | ------------ | ------------- | ----------- |
| **Storage**          | ~100 KB      | ~1 MB         | ~5 MB       |
| **Filter Speed**     | <1ms         | ~2ms          | ~5ms        |
| **Search (indexed)** | <1ms         | <1ms          | ~1ms        |
| **Memory Usage**     | ~500 KB      | ~2 MB         | ~5 MB       |

**Technology Stack:**

- **IndexedDB v2** — columnar storage for 40x space reduction
- **FastBitSet.js** — 32x faster filtering with bitwise operations
- **TanStack Virtual** — renders only visible items (60 FPS scrolling)
- **Web Workers** — background processing keeps UI responsive
- **Trigram/Prefix Indexes** — O(1) search instead of O(n) linear scan

📖 **Deep dive:** [IndexedDB Architecture](INDEXEDDB_ARCHITECTURE.md)

## 🧪 Quality & Reliability

- **98% Test Coverage** — thoroughly tested codebase
- **151 Tests Passed** — comprehensive test suite covering all features
- **TypeScript** — type-safe development with full type checking
- **Modern Stack** — React 18, Vite, shadcn/ui, Tailwind CSS
- **Code Quality** — ESLint, Husky git hooks, automated quality checks

## ❓ FAQ

**Q: Is it safe to use?**  
A: Yes! All processing happens locally in your browser. Nothing is uploaded to any server.

**Q: Do I need my Instagram password?**  
A: No. You only need the ZIP file from Instagram Data Download.

**Q: What does "Not following back" mean?**  
A: Accounts you follow who don't follow you back (excluding pending/restricted accounts).

**Q: Can I use it offline?**  
A: Yes! After the page loads, the app works completely offline.

**Q: Does it work on mobile?**  
A: Yes, the interface is fully responsive and works on all devices.

📖 **More questions?** See [FAQ](docs/faq.md) or [Troubleshooting Guide](docs/troubleshooting.md)

## 🤝 Contributing

Contributions are welcome! Whether it's:

- 🐛 Bug reports
- 💡 Feature requests
- 🔧 Code improvements
- 📖 Documentation updates

See [CONTRIBUTING.md](CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for guidelines.

## 📚 Documentation

- **[User Guide](docs/user-guide.md)** - Complete step-by-step tutorial
- **[FAQ](docs/faq.md)** - Common questions and answers
- **[Troubleshooting](docs/troubleshooting.md)** - Problem-solving guide
- **[Data Download Guide](docs/instagram-export.md)** - How to get your Instagram data
- **[Accessibility](docs/accessibility.md)** - Accessibility features and support
- **[Privacy Policy](docs/privacy.md)** - Data handling principles
- **[Roadmap](docs/roadmap.md)** - Future features
- **[Technical Specs](docs/tech-spec.md)** - Technical details

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

**Disclaimer**: This project is not affiliated with Instagram/Meta. Use your data export in accordance with platform rules.

---

## 💖 Support Me

⭐ **Found this useful?** Star the repo and share it with others looking for a free Instagram unfollow tracker!

<p align="left">
  <a href="https://www.buymeacoffee.com/ignromanov" target="_blank">
    <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" >
  </a>
</p>
