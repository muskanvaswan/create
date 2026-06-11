import fs from "fs";
import { join } from "path";
import { Communicate } from "edge-tts-universal";
import { remark } from "remark";
import strip from "strip-markdown";
import { HIDDEN_FOLDERS } from "@/lib/api";

const audioDirectory = join(process.cwd(), "data", "audio");

// Microsoft Edge "Read Aloud" neural voice; swap for any voice from
// `Communicate`'s voice list if the tone doesn't fit.
const VOICE = "en-US-AvaMultilingualNeural";

export function audioPath(slug: string): string {
  return join(audioDirectory, `${slug}.mp3`);
}

export function audioExists(slug: string): boolean {
  return fs.existsSync(audioPath(slug));
}

export function deleteAudio(slug: string): void {
  fs.rmSync(audioPath(slug), { force: true });
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

  fs.mkdirSync(audioDirectory, { recursive: true });
  fs.writeFileSync(audioPath(slug), Buffer.concat(chunks));
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
      deleteAudio(note.slug);
    } else {
      await generateAudio(note);
    }
  } catch (error) {
    console.error(`Audio generation failed for "${note.slug}":`, error);
  }
}
