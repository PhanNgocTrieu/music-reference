import { importGenre } from "../../lib/importers/musicbrainz";

export interface ImportGenrePayload {
    tag: string;
}

export async function handleImportGenre(data: ImportGenrePayload): Promise<void> {
    await importGenre(data.tag, (msg) => console.log(msg));
}
