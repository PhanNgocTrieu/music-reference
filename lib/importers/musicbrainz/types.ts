export interface MBArtist {
  id: string;
  name: string;
  "sort-name": string;
  type?: "Person" | "Group" | "Orchestra" | "Choir" | "Character" | "Other";
  disambiguation?: string;
  country?: string;
  "life-span"?: { begin?: string; end?: string; ended?: boolean };
}

export interface MBReleaseGroup {
  id: string;
  title: string;
  "primary-type"?: string;
  "secondary-types"?: string[];
  "first-release-date"?: string;
  "artist-credit": Array<{ name?: string; artist: MBArtist; joinphrase?: string }>;
}

export interface MBTrack {
  id: string;
  number: string;
  position: number;
  title: string;
  length?: number;
}

export interface MBRelease {
  id: string;
  title: string;
  status?: string;
  date?: string;
  country?: string;
  "label-info"?: Array<{ "catalog-number"?: string; label?: { id: string; name: string } }>;
  media?: Array<{ format?: string; "track-count"?: number; tracks?: MBTrack[] }>;
}

export interface MBBrowseArtistsResult {
  "artist-count": number;
  "artist-offset": number;
  artists: MBArtist[];
}

export interface MBBrowseReleaseGroupsResult {
  "release-group-count": number;
  "release-group-offset": number;
  "release-groups": MBReleaseGroup[];
}

export interface MBBrowseReleasesResult {
  "release-count": number;
  "release-offset": number;
  releases: MBRelease[];
}
