---
layout: default
title: FAQ
description: Frequently asked questions about Instagram Unfollow Tracker
permalink: /faq/
---

# FAQ - Instagram Unfollow Tracker

## Privacy & Security

### Is it safe? Where do my data go?
**100% safe and private.** All processing happens locally in your browser. Your Instagram data never leaves your device - nothing is sent to any server or stored anywhere.

### Do I need my Instagram login/password?
**No, absolutely not.** You only need the ZIP file from Instagram's official Data Download feature (JSON format). No login credentials required.

### What data does the app access?
The app only processes the "Followers and Following" section from your Instagram data export. It doesn't access posts, messages, photos, or any other personal content.

## Functionality

### What do "Not following back" and "Not followed back" mean?
- **Not following back** — accounts you follow who do not follow you back (pending/permanent requests are excluded from this check)
- **Not followed back** — accounts that follow you, but you do not follow them
- **Mutuals** — accounts that follow each other
- **Close friends** — accounts marked as close friends in Instagram

### Why are some accounts missing?
Instagram may split followers into multiple files (`followers_1.json`, `followers_2.json`, etc.). The app automatically merges these files when found. If your archive structure is unusual, ensure you:
- Selected JSON format when downloading
- Chose only the "Followers and Following" section
- Downloaded "All time" data range

### What file formats are supported?
- **Input**: Instagram Data Download ZIP files (JSON format)
- **Output**: Currently display only, CSV export planned for v0.2

## Technical

### Can I use it offline?
**Yes!** After the page loads, the app works completely without internet. All computation is client-side using your browser's processing power.

### Does it work on mobile?
**Yes, the UI is fully responsive.** However, for large archives (10k+ accounts), desktop is more convenient due to better performance and screen space.

### What browsers are supported?
Modern browsers with JavaScript enabled:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### How many accounts can it handle?
The app is optimized for:
- **Up to 50,000 total accounts** (following + followers)
- **Parse time**: Under 2 seconds on modern devices
- **Search/filter**: Under 100ms for 10,000 items

## Comparison

### Why is this better than paid services?
- **Privacy**: 100% local processing, no data collection
- **Transparency**: Open source, you can see exactly what it does
- **No login required**: Uses official Instagram data export
- **Free**: No subscriptions or hidden costs
- **Customizable**: Modify the code for your needs
- **Offline**: Works without internet connection

### How does it compare to Instagram's built-in features?
Instagram doesn't provide unfollow tracking features. This tool fills that gap using your own exported data, giving you insights Instagram doesn't offer.

## Troubleshooting

### The app shows "No data found" - what should I do?
1. Ensure you downloaded JSON format (not HTML)
2. Check that you selected "Followers and Following" section
3. Verify the ZIP contains files like `connections/followers_and_following/following.json`
4. Try the "Load sample" button to test the app functionality

### My download is taking too long to process
- Large archives (20k+ accounts) may take 5-10 seconds to process
- Close other browser tabs to free up memory
- Use desktop browser for better performance

### The counts don't match what I see in Instagram
This is normal and expected:
- Instagram's live data changes constantly
- The export is a snapshot from when you requested it
- Some accounts may have been deleted or made private since the export
- The app shows the state at the time of your data export

## Development & Support

### How to contribute or report a bug?
- **Issues**: [GitHub Issues](https://github.com/ignromanov/instagram-unfollow-tracker/issues)
- **Pull Requests**: See [CONTRIBUTING.md](../CONTRIBUTING.md)
- **Security**: For security matters, see [SECURITY.md](../SECURITY.md)

### Can I modify the code for my needs?
**Absolutely!** The project is open source (MIT license). You can:
- Fork the repository
- Modify the code
- Deploy your own version
- Contribute improvements back

### Is there a roadmap for new features?
Yes! See [Project Roadmap](roadmap/) for planned features including CSV export, PWA support, and multi-language UI.

## Advanced Usage

### Can I compare data from different time periods?
Currently, the app analyzes one export at a time. Future versions (v1.0+) will support multiple data imports and historical tracking.

### How accurate are the results?
Results are 100% accurate based on your Instagram data export. The app shows the exact state of your followers/following at the time you downloaded the data.

### Can I export my results?
CSV export functionality is planned for v0.2. You'll be able to save filtered results to CSV files for external analysis.

### Does the app work with private accounts?
Yes, the app works with any Instagram account type (public, private, business). It only processes the follower/following data from your export.

## Technical Questions

### Why does the app need JavaScript?
The app processes your Instagram data entirely in your browser using JavaScript. This ensures your data never leaves your device and provides the best privacy protection.

### Can I run this offline?
Yes! After the initial page load, the app works completely offline. You can even save the page for offline use.

### What if Instagram changes their data format?
The app is designed to handle various Instagram export formats. If Instagram changes their format, we'll update the app to support the new format.

### Is my data stored anywhere?
No, your Instagram data is never stored. It's processed in memory and disappears when you close the browser tab.

## Community & Support

### How can I contribute to the project?
- **Code contributions**: See [CONTRIBUTING.md](../CONTRIBUTING.md)
- **Bug reports**: [GitHub Issues](https://github.com/ignromanov/instagram-unfollow-tracker/issues)
- **Feature requests**: [GitHub Discussions](https://github.com/ignromanov/instagram-unfollow-tracker/discussions)
- **Documentation**: Help improve guides and add examples

### Is there a community or forum?
Yes! Join our [GitHub Discussions](https://github.com/ignromanov/instagram-unfollow-tracker/discussions) for:
- Feature discussions
- User support
- Community tips and tricks
- Development updates

### How often is the app updated?
Updates are released regularly based on community feedback and development progress. Check the [roadmap](roadmap/) for upcoming features.

### Can I suggest new features?
Absolutely! We welcome feature suggestions. Please use [GitHub Discussions](https://github.com/ignromanov/instagram-unfollow-tracker/discussions) to share your ideas.
