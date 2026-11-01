import { importQueue } from "../workers";

const tag = process.argv[2];
if (!tag) {
  console.error("Usage: pnpm import:enqueue <tag>");
  console.error("Example: pnpm import:enqueue hymn");
  process.exit(1);
}

await importQueue.add("import:genre", { tag });
console.log(`Enqueued import:genre job for tag: ${tag}`);
process.exit(0);
