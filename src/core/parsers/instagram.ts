import JSZip from 'jszip';
import type { InstagramExportEntry, ParsedAll, RawItem } from '@/core/types';

const normalize = (username: string | undefined | null): string | null => {
  if (!username) return null;
  const trimmed = username.trim().toLowerCase();
  return trimmed.length ? trimmed : null;
};

const extractUsernames = (entries: InstagramExportEntry[]): string[] => {
  const usernames: string[] = [];
  for (const entry of entries) {
    const item = entry.string_list_data?.[0];
    const norm = normalize(item?.value);
    if (norm) usernames.push(norm);
  }
  return Array.from(new Set(usernames));
};

export async function parseFollowingJson(jsonText: string): Promise<string[]> {
  const data = JSON.parse(jsonText) as { relationships_following?: InstagramExportEntry[] } | InstagramExportEntry[];
  if (Array.isArray(data)) {
    return extractUsernames(data);
  }
  if (!data.relationships_following) throw new Error('Invalid following.json: missing relationships_following');
  return extractUsernames(data.relationships_following);
}

export async function parseFollowersJson(jsonText: string): Promise<string[]> {
  const data = JSON.parse(jsonText) as InstagramExportEntry[] | { relationships_followers?: InstagramExportEntry[] };
  if (Array.isArray(data)) return extractUsernames(data);
  if (Array.isArray((data as any).relationships_followers)) return extractUsernames((data as any).relationships_followers);
  // Some archives name followers as followers_1.json with array root
  throw new Error('Invalid followers json format');
}


function listToRaw(entries: InstagramExportEntry[] | undefined): RawItem[] {
  const result: RawItem[] = [];
  if (!entries) return result;
  const seen = new Set<string>();
  for (const e of entries) {
    const item = e.string_list_data?.[0];
    const username = normalize(item?.value);
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
    const u = normalize(item?.value);
    if (!u) continue;
    if (!m.has(u)) m.set(u, item?.timestamp ?? 0);
  }
  return m;
}


export async function parseInstagramZipFile(file: File): Promise<ParsedAll> {
  const zip = await JSZip.loadAsync(file);

  // Try common paths
  const baseCandidates = ['connections/followers_and_following', 'followers_and_following'];

  const readJsonFromZip = async (patterns: string[]): Promise<any | null> => {
    for (const p of patterns) {
      const f = zip.file(new RegExp('^' + escapeRegExp(p) + '$', 'i'))[0];
      if (f) {
        try {
          const text = await f.async('text');
          return JSON.parse(text);
        } catch {
          return null;
        }
      }
    }
    return null;
  };

  // Following with timestamps
  const followingFilePatterns = baseCandidates.map((b) => `${b}/following.json`).concat(['following.json']);
  const followingJson = await readJsonFromZip(followingFilePatterns);
  let followingRaw: RawItem[] = [];
  if (followingJson) {
    const entries = Array.isArray(followingJson) ? followingJson : followingJson?.relationships_following;
    followingRaw = listToRaw(entries);
  }
  const followingUsers = followingRaw.map(r => r.username);
  const followingTimestamps = new Map(followingRaw.map(r => [r.username, r.timestamp ?? 0] as const));

  // Followers with timestamps
  const followersGlobs = baseCandidates.map((b) => `${b}/followers_.*\\.json`).concat(['followers_.*\\.json']);
  const followersRaw: RawItem[] = [];
  const followersSeen = new Set<string>();
  const followersFilesByName = new Map<string, any>();
  for (const g of followersGlobs) {
    const regex = new RegExp('^' + g + '$', 'i');
    for (const f of zip.file(regex)) {
      if (!followersFilesByName.has(f.name)) followersFilesByName.set(f.name, f);
    }
  }
  if (followersFilesByName.size === 0) {
    for (const f of zip.file(/followers_\d+\.json$/i)) {
      if (!followersFilesByName.has(f.name)) followersFilesByName.set(f.name, f);
    }
  }
  for (const f of followersFilesByName.values()) {
    if (!f) continue;
    const text = await f.async('text');
    let json: any; try { json = JSON.parse(text); } catch { continue; }
    const entries = Array.isArray(json) ? json : json?.relationships_followers;
    const items = listToRaw(entries);
    for (const it of items) {
      if (followersSeen.has(it.username)) continue;
      followersSeen.add(it.username);
      followersRaw.push(it);
    }
  }
  const followersUsers = followersRaw.map(r => r.username);
  const followersTimestamps = new Map(followersRaw.map(r => [r.username, r.timestamp ?? 0] as const));

  if (followingUsers.length === 0 && followersUsers.length === 0) {
    throw new Error('Could not find required files in ZIP. Expected following.json and followers_*.json under connections/followers_and_following/.');
  }

  // Other lists
  const readFirstExistingJsonFromZip = async (fileNames: string[]): Promise<any | null> => {
    for (const name of fileNames) {
      const json = await readJsonFromZip(baseCandidates.map((b) => `${b}/${name}`).concat([name]));
      if (json) return json;
    }
    return null;
  };

  const readListMapFlexible = async (fileNames: string[], propCandidates: string[]): Promise<Map<string, number>> => {
    const json = await readFirstExistingJsonFromZip(fileNames);
    if (!json) return new Map();
    const entries = Array.isArray(json) ? json : (propCandidates.map((p) => (json as any)?.[p]).find((e) => Array.isArray(e)) as any[] | undefined);
    return listToMap(entries as any);
  };

  const [pendingSent, permanentRequests, restricted, closeFriends, unfollowed, dismissedSuggestions] = await Promise.all([
    readListMapFlexible(['pending_follow_requests.json'], ['relationships_follow_requests_sent']),
    readListMapFlexible(['recent_follow_requests.json', 'permanent_follow_requests.json'], ['relationships_permanent_follow_requests', 'relationships_follow_requests_permanent']),
    readListMapFlexible(['restricted_profiles.json'], ['relationships_restricted_users']),
    readListMapFlexible(['close_friends.json', 'friends.json'], ['relationships_close_friends']),
    readListMapFlexible(['recently_unfollowed_profiles.json', 'recently_unfollowed.json', 'unfollowed_profiles.json'], ['relationships_unfollowed_users']),
    readListMapFlexible(['removed_suggestions.json', 'dismissed_suggestions.json'], ['relationships_dismissed_suggested_users']),
  ]);

  return {
    following: new Set(followingUsers),
    followers: new Set(followersUsers),
    pendingSent,
    permanentRequests,
    restricted,
    closeFriends,
    unfollowed,
    dismissedSuggestions,
    followingTimestamps,
    followersTimestamps,
  };
}

function escapeRegExp(literal: string): string {
  return literal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

