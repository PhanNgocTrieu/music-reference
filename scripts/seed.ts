import { db } from "../lib/db";
import { artists, genres, releaseGroups, releases } from "../lib/db/schema";

async function seed() {
  console.log("Seeding database...");

  // TODO: insert sample data for development
  // Example:
  // await db.insert(genres).values([
  //   { slug: "rock", name: "Rock" },
  //   { slug: "jazz", name: "Jazz" },
  // ]).onConflictDoNothing();

  console.log("Done.");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
