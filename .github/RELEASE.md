# Release Notes

## v0.1.0 - Initial Release (January 2025)

### 🎉 What's New

- **Core unfollow tracking** - Find who unfollowed you and who you don't follow back
- **Smart badges** - Categorize accounts (mutuals, close friends, restricted, etc.)
- **Real-time search** - Fast, debounced search with Map-based indexing
- **Advanced filtering** - Multiple filter combinations with Select All/Clear All
- **Direct profile links** - Click to open Instagram profiles in new tabs

### 🎨 User Experience

- **Professional UI/UX** - Modern design with Mantine UI components
- **Drag & drop upload** - Easy ZIP file upload with visual feedback
- **Responsive design** - Works on desktop, tablet, and mobile
- **Dark theme support** - Automatic theme detection
- **Accessibility** - ARIA labels, keyboard navigation, screen reader support

### ⚡ Performance

- **Virtualization** - Efficient rendering for lists 50+ items
- **Optimized search** - 300ms debounce with O(1) lookup performance
- **Memoization** - Cached calculations for smooth interactions
- **Single-pass algorithms** - Fast data processing

### 🔒 Privacy & Security

- **100% local processing** - No data leaves your device
- **No tracking** - No analytics, cookies, or data collection
- **Open source** - Full transparency and community auditability
- **No authentication** - Uses official Instagram data export only

### 🧪 Quality

- **98% test coverage** - 175 tests covering all core functionality
- **TypeScript strict mode** - Full type safety and error prevention
- **Production ready** - GitHub Pages deployment with CI/CD

### 📱 Supported Data

- **Followers and Following** - Core relationship data
- **Close friends** - Instagram close friends list
- **Pending requests** - Accounts with pending follow requests
- **Recently unfollowed** - Accounts that recently unfollowed you
- **Restricted profiles** - Accounts you've restricted

### 🌐 Browser Support

- **Chrome** 90+ (recommended)
- **Firefox** 88+
- **Safari** 14+
- **Edge** 90+

### 📊 Performance Targets

- **Parse time**: < 2 seconds for 50,000 total accounts
- **Search response**: < 100ms for 10,000 items
- **Filter updates**: < 50ms for any filter combination
- **Memory usage**: < 100MB for large datasets

### 🚀 Getting Started

1. Visit [https://instagram-unfollow-tracker.vercel.app](https://instagram-unfollow-tracker.vercel.app)
2. Download your Instagram data from [Meta Accounts Center](https://accountscenter.instagram.com/)
3. Upload your ZIP file to the app
4. Explore your follower relationships!

### 📚 Documentation

- **[User Guide](https://instagram-unfollow-tracker.vercel.app/docs/user-guide)** - Complete step-by-step tutorial
- **[FAQ](https://instagram-unfollow-tracker.vercel.app/docs/faq)** - Common questions and answers
- **[Troubleshooting](https://instagram-unfollow-tracker.vercel.app/docs/troubleshooting)** - Problem-solving guide
- **[Data Download Guide](https://instagram-unfollow-tracker.vercel.app/docs/instagram-export)** - How to get your data
- **[Accessibility](https://instagram-unfollow-tracker.vercel.app/docs/accessibility)** - Accessibility features and support
- **[Privacy Policy](https://instagram-unfollow-tracker.vercel.app/docs/privacy)** - Data handling principles
- **[Roadmap](https://instagram-unfollow-tracker.vercel.app/docs/roadmap)** - Future features

### 🤝 Contributing

- **GitHub**: [https://github.com/ignromanov/instagram-unfollow-tracker](https://github.com/ignromanov/instagram-unfollow-tracker)
- **Issues**: Report bugs and request features
- **Contributing**: See [CONTRIBUTING.md](https://github.com/ignromanov/instagram-unfollow-tracker/blob/master/CONTRIBUTING.md)

### 📄 License

MIT License - Free to use, modify, and distribute

---

**Thank you for using Instagram Unfollow Tracker!** 🎉

This is the first release of our privacy-focused, open-source tool for analyzing Instagram follower relationships. We're committed to maintaining your privacy while providing powerful insights into your social connections.

Have feedback or suggestions? We'd love to hear from you! Open an issue or start a discussion on GitHub.
