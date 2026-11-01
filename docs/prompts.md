# Prompts

Start a session with:

> Read skills.md, CLAUDE.md and docs/architecture.md. Then do the task below.

## Adding or changing songs

> Add a song to data/songs.json with [title / author / performed by / url / sheet url / key / genres]. Make sure it validates against the schema in lib/data/songs.ts, and that the url is a link-out, never embedded lyric text.

## Search/filter work

> Change SongsExplorer (components/song/SongsExplorer.tsx) to [describe the change]. Keep it client-side only — there is no API to call.

## UI work

> Read docs/ui-design.md. [Describe the page or component change.] Keep it mobile-first and accessible.

## Useful general prompts

- "Review the last change against the rules in skills.md and list any violations."
- "Write a test for lib/data/songs.ts covering [edge case]."
- "Before coding, give me two options for [problem] with trade-offs."
