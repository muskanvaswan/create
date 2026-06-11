import fs from "fs";
import { join } from "path";
import { Communicate } from "edge-tts-universal";
import { remark } from "remark";
import strip from "strip-markdown";
import { HIDDEN_FOLDERS } from "@/lib/api";
import { deleteFile, readFile, writeFile } from "@/lib/content-store";

const AUDIO_DIR = "data/audio";

// Microsoft Edge "Read Aloud" neural voice; swap for any voice from
// `Communicate`'s voice list if the tone doesn't fit.
const VOICE = "en-US-AvaMultilingualNeural";

function audioFile(slug: string): string {
  return `${AUDIO_DIR}/${slug}.mp3`;
}

/**
 * Build-time check used by the public pages to decide whether to show a
 * listen button; audio files are committed to the repo, so they're on disk
 * during the build.
 */
export function audioExists(slug: string): boolean {
  return fs.existsSync(join(process.cwd(), audioFile(slug)));
}

/** Runtime read for the audio API route, served from the content store. */
export function readAudio(slug: string): Promise<Buffer | null> {
  return readFile(audioFile(slug));
}

export async function deleteAudio(slug: string): Promise<void> {
  await deleteFile(audioFile(slug), `admin: delete audio "${slug}"`);
}

async function markdownToPlainText(markdown: string): Promise<string> {
  const result = await remark().use(strip).process(markdown);
  return String(result).replace(/\s+/g, " ").trim();
}

export async function generateAudio({
  slug,
  title,
  content,
}: {
  slug: string;
  title: string;
  content: string;
}): Promise<void> {
  const body = await markdownToPlainText(content);
  const text = body ? `${title}. ${body}` : title;

  const communicate = new Communicate(text, { voice: VOICE });
  const chunks: Buffer[] = [];
  for await (const chunk of communicate.stream()) {
    if (chunk.type === "audio" && chunk.data) {
      chunks.push(Buffer.from(chunk.data));
    }
  }

  await writeFile(
    audioFile(slug),
    Buffer.concat(chunks),
    `admin: update audio "${slug}"`,
  );
}

/**
 * Regenerate audio after a note is saved, or remove it when the note moves
 * into an admin-only folder. Synthesis goes through Microsoft's unofficial
 * Edge TTS endpoint, so failures are logged rather than thrown — a save
 * must never fail because text-to-speech is down.
 */
export async function syncNoteAudio(note: {
  slug: string;
  title: string;
  folder: string;
  content: string;
}): Promise<void> {
  try {
    if (HIDDEN_FOLDERS.includes(note.folder)) {
      await deleteAudio(note.slug);
    } else {
      await generateAudio(note);
    }
  } catch (error) {
    console.error(`Audio generation failed for "${note.slug}":`, error);
  }
}
