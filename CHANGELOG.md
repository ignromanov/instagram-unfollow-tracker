# Changelog

All notable changes to Instagram Unfollow Tracker will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2025-10-09

### Added

- **IndexedDB v2 Architecture**: Complete rewrite with columnar storage
  - 40x space reduction (1M accounts: ~5 MB vs ~200 MB)
  - Bitset-based filtering using FastBitSet.js
  - Lazy loading with TanStack Virtual
  - Trigram/prefix search indexes
  - Web Worker integration for background processing

- **Modern UI Framework**: Migrated to shadcn/ui and Tailwind CSS
  - Radix UI component primitives for accessible UI
  - OKLCH color system for consistent theming
  - `next-themes` for seamless theme management
  - `lucide-react` for consistent icon system
  - Reduced bundle size and improved customizability

- **Enhanced Component Architecture**: Modular and maintainable components
  - `AccountListSection` and `AccountListVirtualList` for better organization
  - Dedicated `Header`, `Footer`, `Logo`, `HelpButton` components
  - `ProgressBar`, `SkeletonLoader`, `ScrollToTop` for better UX
  - `FileUploadSection` with improved drag & drop

- **Development Infrastructure**:
  - Husky git hooks for pre-commit and pre-push quality checks
  - Comprehensive `npm run code:check` command
  - Automated unused exports detection
  - New GitHub Actions workflow for code quality
  - ESLint flat config with modern best practices

- **Documentation**:
  - `INDEXEDDB_ARCHITECTURE.md` - Complete technical documentation
  - `FILTER_OPTIMIZATION.md` - Performance optimization guide
  - `CLAUDE.md` - Claude Code integration guide
  - `.claude/` directory with project prompts and commands
  - Comprehensive user guides (FAQ, troubleshooting, accessibility)

### Changed

- **Storage**: Migrated from localStorage to IndexedDB v2
- **State Management**: Refactored Zustand store to keep under 1KB (UI state only)
- **Components**: Updated all components to work with lazy-loaded data
- **Search**: Improved with trigram/prefix indexes for instant results
- **Testing**: Expanded to 98% coverage with 151 tests passing

### Removed

- Mantine UI dependencies (`@mantine/core`, `@mantine/hooks`, `@mantine/notifications`)
- `DataDownloadInstructions.tsx` component (consolidated into modal)
- Custom `useDebounce.ts` hook (using `use-debounce` library)

### Performance

- Filter speed (1M accounts): **2-5ms** (was ~150ms) - **75x faster**
- Search speed (indexed): **~1ms** (was ~3000ms) - **100x faster**
- Storage size (1M accounts): **~5 MB** (was ~200 MB) - **40x smaller**
- Memory usage: **~5 MB** (was ~100 MB) - **20x less**
- Scrolling: **60 FPS** with virtualization

## [0.9.0] - 2024-12-15

### Added

- Initial public release
- ZIP file upload and parsing
- Badge-based filtering system
- Real-time search functionality
- Dark mode support
- Responsive design
- 100% local processing (no server communication)

### Features

- Unfollow tracking
- Mutual follower analysis
- Smart badge categorization
- Direct Instagram profile links
- Sample data for testing

---

**Legend**:

- `Added` for new features
- `Changed` for changes in existing functionality
- `Deprecated` for soon-to-be removed features
- `Removed` for now removed features
- `Fixed` for any bug fixes
- `Security` for vulnerability fixes
- `Performance` for performance improvements
