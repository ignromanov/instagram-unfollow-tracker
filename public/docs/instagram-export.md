---
layout: default
title: Data Download Guide
description: How to get your Instagram data for analysis
permalink: /docs/instagram-export/
---

# How to Download Your Instagram Data

This guide shows you how to get your Instagram data in the format that Unfollow Radar can process.

## Quick Steps

1. **Go to Meta Accounts Center**: Visit [https://accountscenter.instagram.com/](https://accountscenter.instagram.com/)
2. **Log in** with your Instagram credentials
3. **Navigate to "Your information and permissions"** in the left sidebar
4. **Click "Download your information"**
5. **Configure your download**:
   - Select **"Some of your information"** (not "All of your information")
   - Choose **"Followers and Following"** section only
   - Select **"JSON"** format
   - Set date range to **"All time"**
6. **Submit the request** and wait for Instagram to prepare your data (up to 48 hours)
7. **Download the ZIP file** when you receive the email notification
8. **Upload the ZIP** to Unfollow Radar using the "Upload ZIP" button

## Detailed Instructions

### Step 1: Access Meta Accounts Center
- Go directly to [https://accountscenter.instagram.com/](https://accountscenter.instagram.com/)
- This is the unified center for all Meta accounts (Instagram, Facebook, etc.)
- Log in with your Instagram credentials

### Step 2: Navigate to Data Download
- Look for "Your information and permissions" in the left sidebar
- Click on "Download your information"
- This will take you to the data request configuration page

### Step 3: Select Information Type
- Choose **"Some of your information"** to customize your download
- This option allows you to select only the specific data you need instead of downloading everything

### Step 4: Choose Data Section
- Select **ONLY "Followers and Following"** from the available sections
- **Important**: Do not select other sections like posts, messages, or profile information
- These are not needed for unfollow tracking and will make your download larger and slower

### Step 5: Select File Format
- Choose **"JSON"** format for the best compatibility
- JSON format works perfectly with our application for data analysis

### Step 6: Set Date Range
- Select **"All time"** to get your complete follower history
- This ensures you have all your followers and following data for accurate tracking

### Step 7: Submit Request
- Review your selections and click "Submit request"
- Instagram will process your request and email you when your data is ready for download

### Step 8: Download and Use
- Check your email for the download notification (may take up to 48 hours)
- Download the ZIP file from the provided link
- Upload the ZIP file to Unfollow Radar

## What's Inside the Archive

The app expects files at these paths:
```
connections/followers_and_following/
├── following.json
├── followers_1.json
├── followers_2.json (if you have many followers)
├── close_friends.json (optional)
├── pending_follow_requests.json (optional)
└── recently_unfollowed_profiles.json (optional)
```

### File Structure
- **`following.json`**: Contains the list of accounts you follow
- **`followers_*.json`**: Contains your followers (may be split across multiple files)
- **Optional files**: Additional data like close friends, pending requests, etc.

### If Structure Differs
If your archive has a different structure, the app will try to locate files by name. You can also use the "Load sample" button to test the app with built-in demo data.

## Troubleshooting

### Common Issues
1. **"No data found" error**: Ensure you selected JSON format and "Followers and Following" section
2. **Missing files**: Check that your ZIP contains the expected file structure
3. **Large file size**: Only select "Followers and Following" to keep the download small and fast

### File Size Expectations
- **Followers and Following only**: Usually 1-5 MB
- **All data**: Can be 100+ MB and take much longer to process

### Processing Time
- **Small accounts** (< 1,000 followers): Process in under 1 second
- **Medium accounts** (1,000-10,000 followers): Process in 1-3 seconds  
- **Large accounts** (10,000+ followers): Process in 3-10 seconds

## Privacy Note

Your Instagram data export contains personal information. Keep the ZIP file secure and don't share it with others. The Unfollow Radar app processes this data entirely in your browser - it never leaves your device.
