import fs from 'fs';
import path from 'path';
import {
  SUPPORTED_LANGUAGES,
  LOCALE_CODES,
  getLocaleCode,
  createLanguagePrefixRegex,
} from '../src/config/languages.js';

const BASE_URL = 'https://safeunfollow.app';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function loadMetaJson(lang: string, rootDir: string): Record<string, string> {
  try {
    const metaPath = path.join(rootDir, 'src', 'locales', lang, 'meta.json');
    const content = fs.readFileSync(metaPath, 'utf-8');
    return JSON.parse(content);
  } catch {
    // Fallback to English
    const enPath = path.join(rootDir, 'src', 'locales', 'en', 'meta.json');
    const content = fs.readFileSync(enPath, 'utf-8');
    return JSON.parse(content);
  }
}

/**
 * SSG hook to inject localized meta tags, canonical, hreflang for each page
 */
export async function injectLocalizedMeta(
  route: string,
  renderedHTML: string,
  rootDir: string
): Promise<string> {
  // Normalize route for canonical URL
  const canonicalPath = route === '/' ? '' : route.replace(/\/$/, '');
  const canonicalUrl = `${BASE_URL}${canonicalPath || '/'}`;

  // Get base path without language prefix for hreflang
  const langPrefixPattern = createLanguagePrefixRegex();
  const basePath = route.replace(langPrefixPattern, '/') || '/';
  const normalizedBasePath = basePath === '/' ? '' : basePath;

  // Extract language from route
  const langMatch = route.match(langPrefixPattern);
  const currentLang = langMatch ? langMatch[1] : 'en';

  // Load localized meta tags
  const metaTags = loadMetaJson(currentLang, rootDir);
  const escapedTitle = escapeHtml(metaTags.title || 'Instagram Unfollowers');
  const escapedDescription = escapeHtml(metaTags.description || '');
  const escapedKeywords = escapeHtml(metaTags.keywords || '');
  const escapedOgTitle = escapeHtml(metaTags.ogTitle || metaTags.title || '');
  const escapedTwitterDesc = escapeHtml(metaTags.twitterDescription || metaTags.description || '');
  const localeCode = getLocaleCode(currentLang);

  // Generate hreflang links
  const hreflangLinks = SUPPORTED_LANGUAGES.map(lang => {
    const url =
      lang === 'en'
        ? `${BASE_URL}${normalizedBasePath || '/'}`
        : `${BASE_URL}/${lang}${normalizedBasePath}`;
    return `<link rel="alternate" hreflang="${lang}" href="${url}"/>`;
  }).join('\n    ');

  // Add x-default (English)
  const xDefaultUrl = `${BASE_URL}${normalizedBasePath || '/'}`;
  const xDefaultLink = `<link rel="alternate" hreflang="x-default" href="${xDefaultUrl}"/>`;

  // Canonical link
  const canonicalLink = `<link rel="canonical" href="${canonicalUrl}"/>`;

  // Build og:locale:alternate list (excluding current language)
  const alternateLocales = Object.values(LOCALE_CODES)
    .filter(locale => locale !== localeCode)
    .map(locale => `<meta property="og:locale:alternate" content="${locale}"/>`)
    .join('\n    ');

  // SEO tags to inject before </head>
  const seoTags = `
    <!-- SSG SEO: canonical, hreflang, og:locale -->
    ${canonicalLink}
    ${hreflangLinks}
    ${xDefaultLink}
    <meta property="og:locale" content="${localeCode}"/>
    ${alternateLocales}
  `;

  // OG image URL with language parameter
  const ogImageUrl = `${BASE_URL}/api/og?lang=${currentLang}`;

  // Replace all meta tags in HTML
  let html = renderedHTML;

  // 1. Replace <title>
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapedTitle}</title>`);

  // 2. Replace <meta name="description">
  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"/,
    `<meta name="description" content="${escapedDescription}"`
  );

  // 3. Replace <meta name="keywords">
  html = html.replace(
    /<meta\s+name="keywords"\s+content="[^"]*"/,
    `<meta name="keywords" content="${escapedKeywords}"`
  );

  // 4. Replace <meta property="og:title">
  html = html.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"/,
    `<meta property="og:title" content="${escapedOgTitle}"`
  );

  // 5. Replace <meta property="og:description">
  html = html.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"/,
    `<meta property="og:description" content="${escapedDescription}"`
  );

  // 6. Replace <meta property="og:image">
  html = html.replace(
    /<meta\s+property="og:image"\s+content="[^"]*"/,
    `<meta property="og:image" content="${ogImageUrl}"`
  );

  // 7. Replace <meta property="og:url">
  html = html.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"/,
    `<meta property="og:url" content="${canonicalUrl}"`
  );

  // 8. Replace <meta name="twitter:title">
  html = html.replace(
    /<meta\s+name="twitter:title"\s+content="[^"]*"/,
    `<meta name="twitter:title" content="${escapedOgTitle}"`
  );

  // 9. Replace <meta name="twitter:description">
  html = html.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*"/,
    `<meta name="twitter:description" content="${escapedTwitterDesc}"`
  );

  // 10. Replace <meta name="twitter:image">
  html = html.replace(
    /<meta\s+name="twitter:image"\s+content="[^"]*"/,
    `<meta name="twitter:image" content="${ogImageUrl}"`
  );

  // Remove old og:locale and og:locale:alternate (will be added in seoTags)
  html = html.replace(/<meta\s+property="og:locale"\s+content="[^"]*"\s*\/?>\s*/g, '');
  html = html.replace(/<meta\s+property="og:locale:alternate"\s+content="[^"]*"\s*\/?>\s*/g, '');

  // Inject SEO tags before </head>
  return html.replace('</head>', `${seoTags}</head>`);
}
