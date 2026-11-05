#!/usr/bin/env node
// Converts a .xlsx song list into data/song_list_000N.json shards.
//
// Usage: pnpm import:excel <path-to-file.xlsx>
//
// Expected sheet layout (first sheet in the workbook):
//   - Row 1 = headers, column A is ignored, data columns start at B.
//   - One song per row, headers matching the field names in data/data-format.json:
//     slug, eng-title, vi-title, author, genre, performed by, en-url, vi-url, sheet-url, key chord
//   - `genre` can hold multiple values in one cell, comma-separated (e.g. "Praising, Christmas").
//   - `is_bilingual` is derived automatically (both titles present) — you don't need that column.
//   - `slug` can be left blank; it will be generated from the title, but review the warnings this
//     script prints and fix any you don't like directly in the Excel file.
//
// This OVERWRITES every existing data/song_list_*.json — the Excel file becomes the source of
// truth. It never touches data/data-format.json. Run it by hand whenever the spreadsheet changes;
// per CLAUDE.md, imports never run as part of the site itself (no server, no request handlers).

import { existsSync, readdirSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import XLSX from "xlsx";
import { z } from "zod";

const DATA_DIR = path.join(process.cwd(), "data");
const SONGS_PER_FILE = 50;

const REQUIRED_COLUMNS = ["slug", "author", "performed by", "sheet-url", "key chord"];
const KNOWN_COLUMNS = [
  "slug",
  "eng-title",
  "vi-title",
  "is_bilingual",
  "author",
  "genre",
  "performed by",
  "en-url",
  "vi-url",
  "sheet-url",
  "key chord",
];

const songRecordSchema = z
  .object({
    slug: z.string().min(1),
    "eng-title": z.string().optional(),
    "vi-title": z.string().optional(),
    is_bilingual: z.boolean(),
    author: z.string().min(1),
    genre: z.array(z.string()).min(1).max(3),
    "performed by": z.string().min(1),
    "en-url": z.string().url().optional(),
    "vi-url": z.string().url().optional(),
    "sheet-url": z.string().url(),
    "key chord": z.string().min(1),
  })
  .refine((song) => song["eng-title"] || song["vi-title"], {
    message: "needs at least an eng-title or a vi-title",
  })
  .refine((song) => song["en-url"] || song["vi-url"], {
    message: "needs at least an en-url or a vi-url",
  });

function slugify(text) {
  return text
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

const filePath = process.argv[2];
if (!filePath) fail("Usage: pnpm import:excel <path-to-file.xlsx>");
if (!existsSync(filePath)) fail(`File not found: ${filePath}`);

const workbook = XLSX.readFile(filePath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: "" });

if (rows.length < 2) fail("The sheet needs a header row plus at least one song row.");

// Rows from sheet_to_json can be ragged (trailing blank cells dropped) — pad them
// all to the same width before slicing off column A, so columns stay aligned.
const width = Math.max(...rows.map((row) => row.length));
function padRow(row) {
  const padded = row.slice();
  while (padded.length < width) padded.push("");
  return padded;
}

const headerRow = padRow(rows[0]).slice(1).map((h) => String(h).trim());

const missingRequired = REQUIRED_COLUMNS.filter((c) => !headerRow.includes(c));
if (missingRequired.length > 0) {
  fail(`Missing required column(s) in the header row: ${missingRequired.join(", ")}`);
}

const unknownColumns = headerRow.filter((h) => h && !KNOWN_COLUMNS.includes(h));
if (unknownColumns.length > 0) {
  console.warn(`Ignoring unrecognized column(s): ${unknownColumns.join(", ")}`);
}

const songs = [];
const seenSlugs = new Map();
let autoSlugCount = 0;

rows.slice(1).forEach((rawRow, i) => {
  const excelRowNumber = i + 2; // +1 for the header row, +1 for 1-based row numbers
  const row = padRow(rawRow).slice(1);

  if (row.every((cell) => String(cell).trim() === "")) return;

  const raw = {};
  headerRow.forEach((col, idx) => {
    if (col) raw[col] = String(row[idx] ?? "").trim();
  });

  const engTitle = raw["eng-title"] || undefined;
  const viTitle = raw["vi-title"] || undefined;

  let slug = raw.slug;
  if (!slug) {
    slug = slugify(engTitle || viTitle || "");
    autoSlugCount += 1;
    console.warn(`Row ${excelRowNumber}: no slug given, generated "${slug}" from the title.`);
  }

  const genre = (raw.genre || "")
    .split(",")
    .map((g) => g.trim())
    .filter(Boolean);
  if (genre.length > 3) {
    console.warn(`Row ${excelRowNumber} ("${slug}"): more than 3 genres given, keeping the first 3.`);
    genre.length = 3;
  }

  const record = {
    slug,
    ...(engTitle ? { "eng-title": engTitle } : {}),
    ...(viTitle ? { "vi-title": viTitle } : {}),
    is_bilingual: Boolean(engTitle) && Boolean(viTitle),
    author: raw.author || "",
    genre,
    "performed by": raw["performed by"] || "",
    ...(raw["en-url"] ? { "en-url": raw["en-url"] } : {}),
    ...(raw["vi-url"] ? { "vi-url": raw["vi-url"] } : {}),
    "sheet-url": raw["sheet-url"] || "",
    "key chord": raw["key chord"] || "",
  };

  const parsed = songRecordSchema.safeParse(record);
  if (!parsed.success) {
    console.error(`Row ${excelRowNumber} ("${slug}") is invalid:`);
    for (const issue of parsed.error.issues) {
      console.error(`  - ${issue.path.join(".") || "(record)"}: ${issue.message}`);
    }
    process.exit(1);
  }

  if (seenSlugs.has(slug)) {
    fail(`Row ${excelRowNumber}: duplicate slug "${slug}" (already used on row ${seenSlugs.get(slug)}).`);
  }
  seenSlugs.set(slug, excelRowNumber);

  songs.push(parsed.data);
});

if (songs.length === 0) fail("No songs found in the sheet.");

// Overwrite every existing shard — the Excel file is the source of truth.
const existingShards = readdirSync(DATA_DIR).filter((f) => /^song_list_\d+\.json$/.test(f));
for (const file of existingShards) {
  unlinkSync(path.join(DATA_DIR, file));
}

const chunkCount = Math.ceil(songs.length / SONGS_PER_FILE);
for (let i = 0; i < chunkCount; i++) {
  const chunk = songs.slice(i * SONGS_PER_FILE, (i + 1) * SONGS_PER_FILE);
  const fileName = `song_list_${String(i + 1).padStart(4, "0")}.json`;
  writeFileSync(path.join(DATA_DIR, fileName), `${JSON.stringify(chunk, null, 2)}\n`, "utf-8");
  console.log(`Wrote ${chunk.length} songs to data/${fileName}`);
}

console.log(`\nDone: ${songs.length} songs across ${chunkCount} file(s).`);
if (autoSlugCount > 0) {
  console.log(`${autoSlugCount} song(s) got an auto-generated slug — review the warnings above and data/song_list_*.json if you want to adjust them.`);
}
