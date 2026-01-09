import JSZip from 'jszip';
import type {
  FileDiscovery,
  FileExpectation,
  InstagramExportEntry,
  ParsedAll,
  ParseResult,
  ParseWarning,
  RawItem,
} from '@/core/types';

// === File Expectations Definition ===
// Describes all files we look for in Instagram export

interface FileSpec {
  name: string;
  description: string;
  required: boolean;
  fileNames: string[];
  propCandidates?: string[];
}

const FILE_SPECS: FileSpec[] = [
  {
    name: 'following.json',
    description: 'Accounts you follow — required for unfollower detection',
    required: true,
    fileNames: ['following.json'],
    propCandidates: ['relationships_following'],
  },
  {
    name: 'followers_*.json',
    description: 'Accounts that follow you — required for mutual detection',
    required: true,
    fileNames: ['followers_1.json', 'followers_2.json', 'followers_3.json'],
    propCandidates: ['relationships_followers'],
  },
  {
    name: 'pending_follow_requests.json',
    description: 'Outgoing follow requests still pending',
    required: false,
    fileNames: ['pending_follow_requests.json'],
    propCandidates: ['relationships_follow_requests_sent'],
  },
  {
    name: 'restricted_profiles.json',
    description: 'Accounts you have restricted',
    required: false,
    fileNames: ['restricted_profiles.json'],
    propCandidates: ['relationships_restricted_users'],
  },
  {
    name: 'close_friends.json',
    description: 'Your close friends list',
    required: false,
    fileNames: ['close_friends.json', 'friends.json'],
    propCandidates: ['relationships_close_friends'],
  },
  {
    name: 'recently_unfollowed.json',
    description: 'Accounts you recently unfollowed',
    required: false,
    fileNames: [
      'recently_unfollowed_profiles.json',
      'recently_unfollowed.json',
      'unfollowed_profiles.json',
    ],
    propCandidates: ['relationships_unfollowed_users'],
  },
  {
    name: 'dismissed_suggestions.json',
    description: 'Suggested accounts you dismissed',
    required: false,
    fileNames: ['removed_suggestions.json', 'dismissed_suggestions.json'],
    propCandidates: ['relationships_dismissed_suggested_users'],
  },
];

// === Utility Functions ===

const normalize = (username: string | undefined | null): string | null => {
  if (!username) return null;
  const trimmed = username.trim().toLowerCase();
  return trimmed.length ? trimmed : null;
};

function escapeRegExp(literal: string): string {
  return literal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const extractUsernames = (entries: InstagramExportEntry[]): string[] => {
  const usernames: string[] = [];
  for (const entry of entries) {
    const item = entry.string_list_data?.[0];
    // Instagram changed format: username can be in item.value (old) or entry.title (new)
    const norm = normalize(item?.value) ?? normalize(entry.title);
    if (norm) usernames.push(norm);
  }
  return Array.from(new Set(usernames));
};

export async function parseFollowingJson(jsonText: string): Promise<string[]> {
  const data = JSON.parse(jsonText) as
    | { relationships_following?: InstagramExportEntry[] }
    | InstagramExportEntry[];
  if (Array.isArray(data)) {
    return extractUsernames(data);
  }
  if (!data.relationships_following)
    throw new Error('Invalid following.json: missing relationships_following');
  return extractUsernames(data.relationships_following);
}

export async function parseFollowersJson(jsonText: string): Promise<string[]> {
  const data = JSON.parse(jsonText) as
    | InstagramExportEntry[]
    | { relationships_followers?: InstagramExportEntry[] };
  if (Array.isArray(data)) return extractUsernames(data);
  if (
    Array.isArray(
      (data as { relationships_followers?: InstagramExportEntry[] }).relationships_followers
    )
  )
    return extractUsernames(
      (data as { relationships_followers: InstagramExportEntry[] }).relationships_followers
    );
  throw new Error('Invalid followers json format');
}

function listToRaw(entries: InstagramExportEntry[] | undefined): RawItem[] {
  const result: RawItem[] = [];
  if (!entries) return result;
  const seen = new Set<string>();
  for (const e of entries) {
    const item = e.string_list_data?.[0];
    // Instagram changed format: username can be in item.value (old) or entry.title (new)
    const username = normalize(item?.value) ?? normalize(e.title);
    if (!username || seen.has(username)) continue;
    seen.add(username);
    result.push({ username, href: item?.href, timestamp: item?.timestamp });
  }
  return result;
}

function listToMap(entries: InstagramExportEntry[] | undefined): Map<string, number> {
  const m = new Map<string, number>();
  if (!entries) return m;
  for (const e of entries) {
    const item = e.string_list_data?.[0];
    // Instagram changed format: username can be in item.value (old) or entry.title (new)
    const u = normalize(item?.value) ?? normalize(e.title);
    if (!u) continue;
    if (!m.has(u)) m.set(u, item?.timestamp ?? 0);
  }
  return m;
}

// === Export Discovery ===

interface ZipAnalysis {
  hasHtmlFiles: boolean;
  hasJsonFiles: boolean;
  hasConnections: boolean;
  hasFollowersFolder: boolean;
  basePath: string | undefined;
  topLevelFolders: string[];
}

function analyzeZipStructure(allFiles: string[]): ZipAnalysis {
  const hasHtmlFiles = allFiles.some(f => f.endsWith('.html'));
  const hasJsonFiles = allFiles.some(f => f.endsWith('.json'));
  const hasConnections = allFiles.some(f => f.includes('connections/'));
  const hasFollowersFolder = allFiles.some(f => f.includes('followers_and_following'));

  // Determine base path
  let basePath: string | undefined;
  if (allFiles.some(f => f.startsWith('connections/followers_and_following/'))) {
    basePath = 'connections/followers_and_following';
  } else if (allFiles.some(f => f.startsWith('followers_and_following/'))) {
    basePath = 'followers_and_following';
  }

  const topLevelFolders = [
    ...new Set(allFiles.map(f => f.split('/')[0]).filter((f): f is string => Boolean(f))),
  ].slice(0, 5);

  return {
    hasHtmlFiles,
    hasJsonFiles,
    hasConnections,
    hasFollowersFolder,
    basePath,
    topLevelFolders,
  };
}

function createCriticalError(analysis: ZipAnalysis): ParseWarning {
  if (analysis.hasHtmlFiles && !analysis.hasJsonFiles) {
    return {
      code: 'HTML_FORMAT',
      message: 'Wrong format: You uploaded HTML format, but JSON is required.',
      severity: 'error',
      fix: 'Re-request your data from Instagram and select JSON format instead of HTML. Go to Settings → Meta Accounts Center → Your information and permissions → Download your information → Select JSON format.',
    };
  }

  if (!analysis.hasConnections && !analysis.hasFollowersFolder) {
    return {
      code: 'NOT_INSTAGRAM_EXPORT',
      message: "This doesn't appear to be an Instagram data export.",
      severity: 'error',
      fix: `Found folders: ${analysis.topLevelFolders.join(', ') || 'none'}. Please download your data from Instagram Settings → Download Your Data → Select JSON format → Include "Followers and following".`,
    };
  }

  if (analysis.hasConnections && !analysis.hasFollowersFolder) {
    return {
      code: 'INCOMPLETE_EXPORT',
      message: 'The export is missing the followers_and_following folder.',
      severity: 'error',
      fix: 'Re-request your data and make sure to select "Followers and following" option in the data types.',
    };
  }

  return {
    code: 'NO_DATA_FILES',
    message: 'Could not find following.json or followers files.',
    severity: 'error',
    fix: `Expected files under ${analysis.basePath || 'connections/followers_and_following'}. Found top-level: ${analysis.topLevelFolders.join(', ') || 'none'}.`,
  };
}

// === Main Parser ===

export async function parseInstagramZipFile(file: File): Promise<ParseResult> {
  const zip = await JSZip.loadAsync(file);
  const allFiles = Object.keys(zip.files ?? {});
  const analysis = analyzeZipStructure(allFiles);

  const warnings: ParseWarning[] = [];
  const fileExpectations: FileExpectation[] = [];

  // Determine format
  const format: FileDiscovery['format'] = analysis.hasJsonFiles
    ? 'json'
    : analysis.hasHtmlFiles
      ? 'html'
      : 'unknown';

  // Check if this is an Instagram export
  const isInstagramExport = analysis.hasConnections || analysis.hasFollowersFolder;

  // If not a valid Instagram export, return early with error
  if (!isInstagramExport || format === 'html') {
    const error = createCriticalError(analysis);
    warnings.push(error);

    // Create empty expectations for all files
    for (const spec of FILE_SPECS) {
      fileExpectations.push({
        name: spec.name,
        description: spec.description,
        required: spec.required,
        found: false,
      });
    }

    return {
      data: createEmptyParsedAll(),
      warnings,
      discovery: {
        format,
        isInstagramExport,
        basePath: analysis.basePath,
        files: fileExpectations,
      },
      hasMinimalData: false,
    };
  }

  // Try common paths
  const baseCandidates = ['connections/followers_and_following', 'followers_and_following'];

  const readJsonFromZip = async (
    patterns: string[]
  ): Promise<{ data: unknown; path: string } | null> => {
    for (const p of patterns) {
      const f = zip.file(new RegExp('^' + escapeRegExp(p) + '$', 'i'))[0];
      if (f) {
        try {
          const text = await f.async('text');
          return { data: JSON.parse(text), path: f.name };
        } catch {
          return null;
        }
      }
    }
    return null;
  };

  // === Parse Following ===
  const followingFilePatterns = baseCandidates
    .map(b => `${b}/following.json`)
    .concat(['following.json']);
  const followingResult = await readJsonFromZip(followingFilePatterns);
  let followingRaw: RawItem[] = [];
  let followingFound = false;
  let followingPath: string | undefined;

  if (followingResult) {
    followingFound = true;
    followingPath = followingResult.path;
    const entries = Array.isArray(followingResult.data)
      ? followingResult.data
      : (followingResult.data as { relationships_following?: RawItem[] })?.relationships_following;
    followingRaw = listToRaw(entries);
  }

  const followingUsers = followingRaw.map(r => r.username);
  const followingTimestamps = new Map(
    followingRaw.map(r => [r.username, r.timestamp ?? 0] as const)
  );

  const followingSpec = FILE_SPECS[0]!;
  fileExpectations.push({
    name: 'following.json',
    description: followingSpec.description,
    required: true,
    found: followingFound,
    itemCount: followingUsers.length,
    foundPath: followingPath,
  });

  if (!followingFound) {
    warnings.push({
      code: 'MISSING_FOLLOWING',
      message: 'following.json not found — cannot detect who you follow.',
      severity: 'warning',
      fix: 'Make sure your Instagram export includes "Followers and following" data. Re-request if needed.',
    });
  } else if (followingUsers.length === 0) {
    warnings.push({
      code: 'EMPTY_FOLLOWING',
      message: 'following.json is empty or contains no valid accounts.',
      severity: 'info',
    });
  }

  // === Parse Followers ===
  const followersGlobs = baseCandidates
    .map(b => `${b}/followers_.*\\.json`)
    .concat(['followers_.*\\.json']);
  const followersRaw: RawItem[] = [];
  const followersSeen = new Set<string>();
  const followersFilesByName = new Map<string, JSZip.JSZipObject>();
  const foundFollowerPaths: string[] = [];

  for (const g of followersGlobs) {
    const regex = new RegExp('^' + g + '$', 'i');
    for (const f of zip.file(regex)) {
      if (!followersFilesByName.has(f.name)) {
        followersFilesByName.set(f.name, f);
        foundFollowerPaths.push(f.name);
      }
    }
  }

  if (followersFilesByName.size === 0) {
    for (const f of zip.file(/followers_\d+\.json$/i)) {
      if (!followersFilesByName.has(f.name)) {
        followersFilesByName.set(f.name, f);
        foundFollowerPaths.push(f.name);
      }
    }
  }

  for (const f of followersFilesByName.values()) {
    if (!f) continue;
    const text = await f.async('text');
    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      continue;
    }
    const entries = Array.isArray(json)
      ? json
      : (json as { relationships_followers?: InstagramExportEntry[] })?.relationships_followers;
    const items = listToRaw(entries);
    for (const it of items) {
      if (followersSeen.has(it.username)) continue;
      followersSeen.add(it.username);
      followersRaw.push(it);
    }
  }

  const followersUsers = followersRaw.map(r => r.username);
  const followersTimestamps = new Map(
    followersRaw.map(r => [r.username, r.timestamp ?? 0] as const)
  );

  const followersFound = followersFilesByName.size > 0;
  const followersSpec = FILE_SPECS[1]!;
  fileExpectations.push({
    name: 'followers_*.json',
    description: followersSpec.description,
    required: true,
    found: followersFound,
    itemCount: followersUsers.length,
    foundPath: foundFollowerPaths[0],
  });

  if (!followersFound) {
    warnings.push({
      code: 'MISSING_FOLLOWERS',
      message: 'followers_*.json files not found — cannot detect who follows you.',
      severity: 'warning',
      fix: 'Make sure your Instagram export includes "Followers and following" data. Re-request if needed.',
    });
  } else if (followersUsers.length === 0) {
    warnings.push({
      code: 'EMPTY_FOLLOWERS',
      message: 'Followers files are empty or contain no valid accounts.',
      severity: 'info',
    });
  }

  // === Parse Optional Files ===
  const readFirstExistingJsonFromZip = async (
    fileNames: string[]
  ): Promise<{ data: unknown; path: string } | null> => {
    for (const name of fileNames) {
      const result = await readJsonFromZip(baseCandidates.map(b => `${b}/${name}`).concat([name]));
      if (result) return result;
    }
    return null;
  };

  const readListMapFlexible = async (
    spec: FileSpec
  ): Promise<{ map: Map<string, number>; found: boolean; path?: string; count: number }> => {
    const result = await readFirstExistingJsonFromZip(spec.fileNames);
    if (!result) return { map: new Map(), found: false, count: 0 };

    const entries = Array.isArray(result.data)
      ? result.data
      : (spec.propCandidates
          ?.map(p => (result.data as Record<string, unknown>)?.[p])
          .find(e => Array.isArray(e)) as InstagramExportEntry[] | undefined);

    const map = listToMap(entries);
    return { map, found: true, path: result.path, count: map.size };
  };

  // Parse all optional files
  const optionalSpecs = FILE_SPECS.slice(2); // Skip following and followers
  const optionalResults = await Promise.all(optionalSpecs.map(spec => readListMapFlexible(spec)));

  // Default result for missing optional files
  const emptyResult = { map: new Map<string, number>(), found: false, count: 0 };
  const pendingResult = optionalResults[0] ?? emptyResult;
  const restrictedResult = optionalResults[1] ?? emptyResult;
  const closeFriendsResult = optionalResults[2] ?? emptyResult;
  const unfollowedResult = optionalResults[3] ?? emptyResult;
  const dismissedResult = optionalResults[4] ?? emptyResult;

  // We don't have permanentRequests in FILE_SPECS, parse it separately
  const permanentResult = await readListMapFlexible({
    name: 'permanent_follow_requests.json',
    description: 'Follow requests that were declined or blocked',
    required: false,
    fileNames: ['recent_follow_requests.json', 'permanent_follow_requests.json'],
    propCandidates: [
      'relationships_permanent_follow_requests',
      'relationships_follow_requests_permanent',
    ],
  });

  // Add optional file expectations
  for (let i = 0; i < optionalSpecs.length; i++) {
    const spec = optionalSpecs[i]!;
    const result = optionalResults[i]!;
    fileExpectations.push({
      name: spec.name,
      description: spec.description,
      required: false,
      found: result.found,
      itemCount: result.count,
      foundPath: result.path,
    });
  }

  // Determine if we have minimal data
  const hasMinimalData = followingUsers.length > 0 || followersUsers.length > 0;

  if (!hasMinimalData) {
    warnings.push(createCriticalError(analysis));
  }

  // Create discovery object
  const discovery: FileDiscovery = {
    format,
    isInstagramExport: true,
    basePath: analysis.basePath,
    files: fileExpectations,
  };

  return {
    data: {
      following: new Set(followingUsers),
      followers: new Set(followersUsers),
      pendingSent: pendingResult.map,
      permanentRequests: permanentResult.map,
      restricted: restrictedResult.map,
      closeFriends: closeFriendsResult.map,
      unfollowed: unfollowedResult.map,
      dismissedSuggestions: dismissedResult.map,
      followingTimestamps,
      followersTimestamps,
    },
    warnings,
    discovery,
    hasMinimalData,
  };
}

function createEmptyParsedAll(): ParsedAll {
  return {
    following: new Set(),
    followers: new Set(),
    pendingSent: new Map(),
    permanentRequests: new Map(),
    restricted: new Map(),
    closeFriends: new Map(),
    unfollowed: new Map(),
    dismissedSuggestions: new Map(),
    followingTimestamps: new Map(),
    followersTimestamps: new Map(),
  };
}

// === Legacy Support ===
// Keep the old function signature for backward compatibility

/**
 * @deprecated Use parseInstagramZipFile which returns ParseResult
 */
export async function parseInstagramZipFileThrows(file: File): Promise<ParsedAll> {
  const result = await parseInstagramZipFile(file);

  if (!result.hasMinimalData) {
    const error = result.warnings.find(w => w.severity === 'error');
    throw new Error(error?.message ?? 'Could not parse Instagram data');
  }

  return result.data;
}
