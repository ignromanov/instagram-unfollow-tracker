import type { InstructionsData } from '@/types/instructions';

export const INSTRUCTIONS_DATA: InstructionsData = {
  web: [
    {
      number: 1,
      title: 'Go to Meta Accounts Center',
      description: 'Open the Meta Accounts Center in your browser',
      icon: '1',
      details: 'This is the unified center for all Meta accounts (Instagram, Facebook, etc.)'
    },
    {
      number: 2,
      title: 'Log in to your account',
      description: 'Enter your Instagram credentials to access your account',
      icon: '2',
      details: 'Use the same login details you use for Instagram'
    },
    {
      number: 3,
      title: 'Navigate to Your Information',
      description: 'Click on "Your information and permissions" in the left sidebar',
      icon: '3',
      details: 'This section contains all your account data and download options'
    },
    {
      number: 4,
      title: 'Start Download Process',
      description: 'Click "Download your information" to begin the data request',
      icon: '4',
      details: 'This will take you to the data request configuration page'
    },
    {
      number: 5,
      title: 'Select Information Type',
      description: 'Choose "Some of your information" to customize your download',
      icon: '5',
      details: 'This option allows you to select only the specific data you need instead of downloading everything'
    },
    {
      number: 6,
      title: 'Choose Data Section',
      description: 'Select ONLY "Followers and Following" from the available sections',
      icon: '6',
      details: 'Important: Choose only "Followers and Following" section. Do not select other sections like posts, messages, or profile information - they are not needed for unfollow tracking and will make your download larger and slower'
    },
    {
      number: 7,
      title: 'Select File Format',
      description: 'Choose "JSON" format for the best compatibility',
      icon: '7',
      details: 'JSON format works perfectly with our application for data analysis'
    },
    {
      number: 8,
      title: 'Set Date Range',
      description: 'Select "All time" to get your complete follower history',
      icon: '8',
      details: 'This ensures you have all your followers and following data for accurate tracking'
    },
    {
      number: 9,
      title: 'Submit Your Request',
      description: 'Click "Submit request" to start the data preparation process',
      icon: '9',
      details: 'Instagram will process your request and email you when your data is ready for download'
    }
  ],
  mobile: [],
  notes: [
    {
      title: 'Processing Time',
      content: 'Instagram may take up to 48 hours to prepare your data archive. You\'ll receive an email when it\'s ready.',
      type: 'info',
      icon: '⏰'
    },
    {
      title: 'Required Data Only',
      content: 'Select only "Followers and Following" section for faster processing. This contains all data needed for unfollow tracking.',
      type: 'success',
      icon: '🎯'
    },
    {
      title: 'Download Promptly',
      content: 'The download link expires after several days. Download your archive as soon as you receive the email.',
      type: 'warning',
      icon: '🔗'
    },
    {
      title: 'Keep Data Secure',
      content: 'Your archive contains personal information. Keep it secure and don\'t share it with others.',
      type: 'warning',
      icon: '🛡️'
    }
  ]
};
