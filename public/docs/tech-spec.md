---
layout: default
title: Technical Specs
description: Technical details and architecture
permalink: /docs/tech-spec/
---

# Technical Specification - Instagram Unfollow Tracker

## 1. Project Overview

### Goal
A privacy-focused, local web application that analyzes Instagram Data Download (ZIP) files to provide insights into follower relationships without requiring Instagram authentication or sending data to external servers.

### Core Features
- **Unfollow tracking**: Identify users you follow who don't follow back
- **Follower analysis**: Find users who follow you but you don't follow back
- **Smart badges**: Categorize accounts (mutuals, close friends, restricted, etc.)
- **Real-time search**: Fast, debounced search with Map-based indexing
- **Advanced filtering**: Multiple filter combinations with Select All/Clear All
- **Direct profile links**: Click to open Instagram profiles in new tabs

### Privacy Principles
- **100% local processing**: All data processing happens in the browser
- **No data collection**: No analytics, tracking, or data transmission
- **No authentication**: Uses official Instagram data export only
- **Open source**: Full transparency and community auditability

## 2. Technical Architecture

### Frontend Stack
- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Strict mode enabled for type safety
- **Vite**: Fast build tool and development server
- **Mantine UI**: Modern, accessible component library
- **Zustand**: Lightweight state management with persistence

### Performance Optimizations
- **Virtualization**: `@tanstack/react-virtual` for lists 50+ items
- **Debounced search**: 300ms debounce with Map-based O(1) lookup
- **Memoization**: `useMemo` for expensive calculations
- **Single-pass algorithms**: Efficient data processing
- **Conditional rendering**: Optimized re-renders

### Testing & Quality
- **Vitest**: Fast unit testing framework
- **React Testing Library**: Component testing utilities
- **98% test coverage**: 151 tests covering all core functionality
- **TypeScript strict mode**: Compile-time error prevention
- **ESLint**: Code quality and consistency

## 3. Data Structure & Processing

### Input Format
Instagram Data Download ZIP files containing JSON data:

```
connections/followers_and_following/
├── following.json          # Accounts you follow
├── followers_1.json        # Your followers (may be split)
├── followers_2.json        # Additional follower files
├── close_friends.json      # Close friends list (optional)
├── pending_follow_requests.json  # Pending requests (optional)
├── recently_unfollowed_profiles.json  # Recently unfollowed (optional)
└── restricted_profiles.json  # Restricted accounts (optional)
```

### Data Schema
```typescript
interface InstagramExportEntry {
  title: string;
  string_list_data: InstagramListItem[];
  media_list_data: unknown[];
}

interface InstagramListItem {
  href: string;        // Profile URL
  value: string;       // Username
  timestamp?: number;  // Optional timestamp
}
```

### Core Calculations
- **Set A**: Usernames you follow (from `following.json`)
- **Set B**: Usernames who follow you (from all `followers_*.json`)
- **Not following back**: A − B (excluding pending/restricted)
- **Not followed back**: B − A
- **Mutuals**: A ∩ B
- **Badge assignment**: Based on presence in different lists

## 4. User Interface Design

### Layout Structure
- **Header**: App title, theme toggle, instructions button
- **Upload area**: Drag & drop ZIP upload with visual feedback
- **Filter controls**: Badge filters with Select All/Clear All
- **Search bar**: Real-time search with debouncing
- **Results area**: Virtualized list with account cards
- **Statistics**: Count badges and summary information

### Responsive Design
- **Desktop**: Full feature set with optimal performance
- **Tablet**: Adapted layout with touch-friendly interactions
- **Mobile**: Simplified interface with essential features

### Accessibility Features
- **ARIA labels**: Screen reader support
- **Keyboard navigation**: Full keyboard accessibility
- **High contrast**: Support for high contrast themes
- **Focus management**: Clear focus indicators

## 5. State Management

### Zustand Store Structure
```typescript
interface AppState {
  // Upload state
  uploadStatus: 'idle' | 'loading' | 'success' | 'error';
  uploadError: string | null;
  
  // Data state
  accounts: AccountBadges[];
  filterCounts: Record<BadgeType, number>;
  
  // UI state
  selectedFilters: BadgeType[];
  searchQuery: string;
  sortBy: 'username' | 'date';
  sortOrder: 'asc' | 'desc';
}
```

### Persistence
- **LocalStorage**: Filter preferences and UI state
- **SessionStorage**: Temporary data during processing
- **No server storage**: All data remains local

## 6. Performance Specifications

### Processing Targets
- **Parse time**: < 2 seconds for 50,000 total accounts
- **Search response**: < 100ms for 10,000 items
- **Filter updates**: < 50ms for any filter combination
- **Memory usage**: < 100MB for large datasets

### Optimization Strategies
- **Lazy loading**: Components loaded on demand
- **Virtual scrolling**: Only render visible items
- **Debounced search**: Reduce search frequency
- **Memoized calculations**: Cache expensive operations
- **Efficient data structures**: Map-based lookups

## 7. Error Handling

### Error Categories
- **Upload errors**: Invalid ZIP, missing files, corrupted data
- **Parse errors**: Malformed JSON, unexpected schema
- **Runtime errors**: Memory limits, browser compatibility
- **User errors**: Wrong file format, incomplete data

### Error Recovery
- **Graceful degradation**: Partial data processing when possible
- **Clear error messages**: User-friendly error descriptions
- **Retry mechanisms**: Allow users to retry failed operations
- **Fallback options**: Sample data for testing

## 8. Browser Compatibility

### Supported Browsers
- **Chrome**: 90+ (recommended)
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

### Required Features
- **ES2020 support**: Modern JavaScript features
- **File API**: ZIP file processing
- **LocalStorage**: State persistence
- **CSS Grid/Flexbox**: Modern layout support

## 9. Security Considerations

### Client-Side Security
- **Input validation**: Sanitize all user inputs
- **XSS prevention**: No dynamic HTML injection
- **CSRF protection**: Not applicable (no server)
- **Content Security Policy**: Strict CSP headers

### Data Privacy
- **No data transmission**: All processing local
- **No tracking**: No analytics or cookies
- **No logging**: No user behavior logging
- **Secure defaults**: Privacy-first configuration

## 10. Deployment & Distribution

### GitHub Pages Deployment
- **Automatic CI/CD**: GitHub Actions workflow
- **Static hosting**: No server required
- **Custom domain**: Optional custom domain support
- **HTTPS**: Automatic SSL certificate

### Build Process
```bash
npm run build    # TypeScript compilation + Vite build
npm run test     # Run test suite
npm run preview  # Local preview of production build
```

### Environment Configuration
- **Development**: Hot reload, source maps, dev tools
- **Production**: Minified, optimized, no dev tools
- **Testing**: Mock data, isolated test environment

## 11. Development Workflow

### Code Organization
```
src/
├── components/     # React components
├── hooks/         # Custom React hooks
├── lib/           # Core business logic
├── core/          # Data processing and types
├── data/          # Static data and constants
├── types/         # TypeScript type definitions
└── ui/            # Main application component
```

### Testing Strategy
- **Unit tests**: Individual function testing
- **Component tests**: React component testing
- **Integration tests**: Full workflow testing
- **E2E tests**: User journey testing (planned)

### Code Quality
- **TypeScript strict**: Compile-time error prevention
- **ESLint**: Code style and quality rules
- **Prettier**: Code formatting consistency
- **Husky**: Pre-commit hooks for quality gates

## 12. Future Technical Considerations

### Scalability
- **Web Workers**: Move heavy processing to background threads
- **IndexedDB**: Client-side database for large datasets
- **Streaming**: Process large files in chunks
- **Caching**: Intelligent caching strategies

### Advanced Features
- **PWA**: Progressive Web App capabilities
- **Offline support**: Service worker implementation
- **Push notifications**: Update notifications
- **Background sync**: Offline data synchronization

### Performance Monitoring
- **Web Vitals**: Core web vitals tracking
- **Performance API**: Browser performance metrics
- **Memory profiling**: Memory usage optimization
- **Bundle analysis**: Bundle size optimization

---

*This technical specification is a living document that evolves with the project. It serves as the foundation for development decisions and architectural choices.*
