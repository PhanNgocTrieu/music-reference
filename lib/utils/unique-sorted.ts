/** Pure, no `fs` dependency — safe to import from both server and client code. */
export function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
}
