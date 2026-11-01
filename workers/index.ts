import IORedis from "ioredis";
import { Queue, Worker } from "bullmq";
import { handleImportGenre, type ImportGenrePayload } from "./handlers/import";

const connection = new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", {
	maxRetriesPerRequest: null,
});

export const QUEUES = {
	import: "import",
	indexing: "indexing",
} as const;

export const importQueue = new Queue<ImportGenrePayload>(QUEUES.import, { connection });
export const indexingQueue = new Queue(QUEUES.indexing, { connection });

if (process.env.NODE_ENV !== "test") {
	const worker = new Worker<ImportGenrePayload>(
		QUEUES.import,
		async (job) => {
			if (job.name === "import:genre") return handleImportGenre(job.data);
			throw new Error(`Unknown job: ${job.name}`);
		},
		{ connection, concurrency: 1 }
	);

	worker.on("completed", (job) => console.log(`[worker] ${job.name} done`));
	worker.on("failed", (job, err) =>
		console.error(`[worker] ${job?.name} failed: ${err.message}`)
	);

	console.log("[worker] Import worker started. Press Ctrl+C to stop.");
}
