# Release Template for GitHub Releases

Use this template when creating a new GitHub Release. Copy the relevant sections and customize for your specific release.

---

## Version X.Y.Z - [Release Name]

**Release Date:** YYYY-MM-DD

[Brief 1-2 sentence overview of the release]

## 🎉 Highlights

[3-5 bullet points of the most important changes users will care about]

- 🚀 **Performance** - [describe major performance improvement]
- ✨ **New Feature** - [describe exciting new feature]
- 🎨 **UI/UX** - [describe UI improvements]
- 🐛 **Bug Fixes** - [describe major bug fixes]
- 📚 **Documentation** - [describe doc improvements]

## ✨ New Features

**[Feature Category 1]**

- Feature description with user benefit
- Another feature in this category

**[Feature Category 2]**

- Feature description
- Another feature

## 🔧 Improvements

- Improvement 1 with user impact
- Improvement 2 with user impact
- Performance enhancement with metrics if applicable

## 🐛 Bug Fixes

- Fixed [issue description] (#issue-number)
- Resolved [problem description] (#issue-number)
- Corrected [bug description] (#issue-number)

## 📚 Documentation

- Updated [doc name] with [changes]
- Added [new guide/tutorial]
- Improved [existing doc]

## ⚠️ Breaking Changes

[If applicable - list any breaking changes with migration instructions]

- **Breaking change 1**: Description and how to migrate
- **Breaking change 2**: Description and how to migrate

## 🔮 What's Next

[Brief preview of what's coming in the next release - link to roadmap]

See our [Roadmap](../docs/roadmap.md) for more details.

## 📦 Installation

**Online (Recommended):**
Visit [safeunfollow.app](https://safeunfollow.app)

**Local Development:**

```bash
git clone https://github.com/ignromanov/safe-unfollow.git
cd safe-unfollow
npm install
npm run dev
```

## 🤝 Contributors

Thank you to everyone who contributed to this release!

[Use GitHub's auto-generated release notes contributor list or manually list key contributors]

## 📊 Stats

[Optional - include interesting project stats]

- **Total commits:** X
- **Contributors:** Y
- **Files changed:** Z
- **Lines added/removed:** +A / -B
- **Test coverage:** X%
- **Performance improvement:** X% faster

## 🔗 Links

- **[Full Changelog](../CHANGELOG.md#XYZ)**
- **[Migration Guide](../docs/migration-guide.md)** (if applicable)
- **[Documentation](../README.md#documentation)**
- **[Report Issues](https://github.com/ignromanov/safe-unfollow/issues)**

---

## Example Release Notes

### Example: Minor Version (v1.1.0)

```markdown
# v1.1.0 - Enhanced Export Features

**Release Date:** 2025-11-15

This release focuses on data export capabilities and improved parsing.

## 🎉 Highlights

- 📊 **CSV Export** - Export your filtered results to CSV for external analysis
- 📂 **Enhanced Parsing** - Support for blocked accounts and favorites
- ⚡ **Performance** - 20% faster upload processing
- 🐛 **Bug Fixes** - Resolved 5 community-reported issues

## ✨ New Features

**Data Export**

- Export filtered accounts to CSV with customizable columns
- Batch export for multiple filter combinations
- Export progress indicator for large datasets

**Enhanced Data Parsing**

- Parse and display blocked accounts from Instagram data export
- Support for favorites/close friends list
- Improved error messages for malformed data files

## 🔧 Improvements

- Upload processing is now 20% faster for files >100k accounts
- Better mobile touch interactions for filter chips
- Improved keyboard navigation with shortcuts (Ctrl+K for search)

## 🐛 Bug Fixes

- Fixed search not working for accounts with special characters (#42)
- Resolved virtual scroll jump on filter change (#38)
- Corrected badge counts when using multiple filters (#45)

## 📚 Documentation

- Added CSV export guide to user documentation
- Updated FAQ with export-related questions
- Improved troubleshooting guide with new common issues

## 🔮 What's Next

v1.2 will bring advanced UI features including saved views, custom filter combinations, and connection insights. See our [Roadmap](../docs/roadmap.md) for details.
```

### Example: Patch Version (v1.0.1)

```markdown
# v1.0.1 - Bug Fixes

**Release Date:** 2025-10-16

Quick patch release fixing critical bugs reported in v1.0.0.

## 🐛 Bug Fixes

- Fixed IndexedDB migration failing on Safari (#52)
- Resolved dark mode flicker on initial load (#51)
- Corrected filter count showing incorrect numbers (#50)

## 🔧 Improvements

- Better error messages for unsupported browsers
- Improved loading performance on slower connections

## 📚 Documentation

- Updated troubleshooting guide with Safari-specific solutions
- Added browser compatibility table to README
```

---

## Release Checklist

Before publishing a release, ensure:

- [ ] All tests pass (`npm test`)
- [ ] Build succeeds (`npm run build`)
- [ ] Version bumped in `package.json`
- [ ] `CHANGELOG.md` updated with release date
- [ ] `RELEASE_NOTES.md` created (for major/minor versions)
- [ ] Documentation updated to reflect new features
- [ ] Migration guide written (if breaking changes)
- [ ] GitHub Release draft created using this template
- [ ] Release notes reviewed for clarity and accuracy
- [ ] Tag created with format `vX.Y.Z`
- [ ] Assets attached to release (if applicable)

---

## Tips for Great Release Notes

### Do's ✅

- **Focus on user benefits** - Explain "what this means for you"
- **Use emojis sparingly** - Make sections scannable
- **Include metrics** - "75x faster" is better than "much faster"
- **Link to issues** - Give credit and provide context
- **Show gratitude** - Thank contributors and community

### Don'ts ❌

- **Don't use jargon** - Avoid technical terms unless necessary
- **Don't be vague** - "Various improvements" tells users nothing
- **Don't skip breaking changes** - Always document migrations
- **Don't forget links** - Link to docs, issues, and guides
- **Don't rush** - Take time to write clear, helpful notes

---

**Remember:** Release notes are often the first thing users see. Make them count!
