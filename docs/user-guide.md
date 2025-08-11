---
layout: default
title: User Guide
description: Complete step-by-step tutorial for Instagram Unfollow Tracker
permalink: /user-guide/
---

# User Guide - Instagram Unfollow Tracker

## Getting Started

### What is Instagram Unfollow Tracker?
Instagram Unfollow Tracker is a privacy-focused tool that analyzes your Instagram data export to help you understand your follower relationships. It shows you who unfollowed you, who you follow but doesn't follow back, and provides insights into your Instagram network.

### Key Benefits
- **100% Private**: All processing happens in your browser
- **No Login Required**: Uses official Instagram data export
- **Completely Free**: No subscriptions or hidden costs
- **Open Source**: Transparent and auditable code

## Step-by-Step Tutorial

### Step 1: Download Your Instagram Data
1. Go to [Meta Accounts Center](https://accountscenter.instagram.com/)
2. Navigate to "Your information and permissions" → "Download your information"
3. Select "Some of your information" → "Followers and Following" → "JSON" format
4. Wait for Instagram to prepare your data (up to 48 hours)
5. Download the ZIP file when you receive the email

**📖 Detailed instructions**: See [Instagram Export Guide](instagram-export/)

### Step 2: Upload Your Data
1. Open [Instagram Unfollow Tracker](https://ignromanov.github.io/instagram-unfollow-tracker)
2. Click "Upload ZIP" or drag & drop your ZIP file
3. Wait for processing to complete (usually 1-3 seconds)
4. Your data is now ready for analysis!

### Step 3: Explore Your Results
- **View all accounts**: See your complete follower/following list
- **Use filters**: Click badge filters to see specific account types
- **Search**: Type usernames to find specific accounts
- **Click profiles**: Open Instagram profiles in new tabs

## Understanding the Results

### Account Badges
- **Following**: Accounts you follow
- **Followers**: Accounts that follow you
- **Mutuals**: Accounts that follow each other
- **Not following back**: You follow them, they don't follow you
- **Not followed back**: They follow you, you don't follow them
- **Close friends**: Marked as close friends in Instagram
- **Pending**: Follow requests waiting for approval
- **Restricted**: Accounts you've restricted
- **Unfollowed**: Recently unfollowed accounts

### Statistics
- **Total accounts**: Combined followers and following
- **Filter counts**: Number of accounts in each category
- **Search results**: Number of accounts matching your search

## Advanced Features

### Filtering
- **Single filter**: Click any badge to see only those accounts
- **Multiple filters**: Hold Ctrl/Cmd and click multiple badges
- **Select All**: Click to select all available filters
- **Clear All**: Click to clear all selected filters

### Search
- **Real-time search**: Results update as you type
- **Case insensitive**: Works with any capitalization
- **Partial matches**: Find accounts with partial usernames
- **Clear search**: Click the X to clear search results

### Sorting
- **By username**: Alphabetical order (A-Z or Z-A)
- **By date**: When the account was added (if available)
- **Default**: Original order from Instagram export

## Tips for Best Results

### Data Quality
- **Use recent exports**: Download fresh data for accurate results
- **Complete data**: Select "All time" when downloading
- **JSON format**: Ensure you selected JSON, not HTML

### Performance
- **Close other tabs**: Free up memory for better performance
- **Use desktop**: Better performance for large accounts (10k+ followers)
- **Be patient**: Large exports may take 5-10 seconds to process

### Privacy
- **Keep data secure**: Don't share your ZIP file with others
- **Delete when done**: Remove the ZIP file after analysis
- **Use incognito**: Consider using private browsing mode

## Troubleshooting

### Common Issues
- **"No data found"**: Check that you selected JSON format and "Followers and Following"
- **Slow processing**: Close other browser tabs and use desktop browser
- **Missing accounts**: Instagram may split large follower lists into multiple files

### Getting Help
- **FAQ**: Check [Frequently Asked Questions](faq/)
- **Issues**: Report bugs on [GitHub Issues](https://github.com/ignromanov/instagram-unfollow-tracker/issues)
- **Discussions**: Ask questions in [GitHub Discussions](https://github.com/ignromanov/instagram-unfollow-tracker/discussions)

## Privacy & Security

### Your Data
- **Never leaves your device**: All processing happens in your browser
- **No tracking**: No analytics, cookies, or data collection
- **No servers**: No data is sent to external servers
- **Open source**: You can review the code yourself

### Best Practices
- **Secure storage**: Keep your ZIP file in a secure location
- **Regular cleanup**: Delete old exports when no longer needed
- **Browser security**: Use updated browsers and clear data regularly

**📖 More details**: See [Privacy Policy](privacy/)

## What's Next?

### Upcoming Features
- **CSV Export**: Save filtered results to CSV files (v0.2)
- **PWA Support**: Install as mobile app (v1.0)
- **Multi-language**: English and Russian support (v1.0)

**📖 Full roadmap**: See [Project Roadmap](roadmap/)

### Contributing
- **Report bugs**: Help improve the tool
- **Suggest features**: Share your ideas
- **Contribute code**: Help develop new features

**📖 How to contribute**: See [CONTRIBUTING.md](../CONTRIBUTING.md)

---

*This user guide is designed to help you get the most out of Instagram Unfollow Tracker. For technical details, see [Technical Specification](tech-spec/).*
