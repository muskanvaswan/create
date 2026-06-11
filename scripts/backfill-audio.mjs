// One-off backfill: generate listen-button audio for posts saved before
// TTS-on-save existed. Run with `node scripts/backfill-audio.mjs`.
// Mirrors src/lib/tts.ts, which handles ongoing generation on save.
import fs from "fs";
import { join } from "path";
import matter from "gray-matter";
import { Communicate } from "edge-tts-universal";
import { remark } from "remark";
import strip from "strip-markdown";

const VOICE = "en-US-AvaMultilingualNeural";
const HIDDEN_FOLDERS = ["Drafts"];
const postsDirectory = join(process.cwd(), "_posts");
const audioDirectory = join(process.cwd(), "data", "audio");

fs.mkdirSync(audioDirectory, { recursive: true });

for (const file of fs.readdirSync(postsDirectory)) {
  if (!file.endsWith(".md")) continue;
  const slug = file.replace(/\.md$/, "");
  const target = join(audioDirectory, `${slug}.mp3`);
  if (fs.existsSync(target)) {
    console.log(`skip ${slug} (audio exists)`);
    continue;
  }

  const { data, content } = matter(
    fs.readFileSync(join(postsDirectory, file), "utf8"),
  );
  if (HIDDEN_FOLDERS.includes(data.folder ?? "Notes")) {
    console.log(`skip ${slug} (hidden folder)`);
    continue;
  }

  const body = String(await remark().use(strip).process(content))
    .replace(/\s+/g, " ")
    .trim();
  const text = body ? `${data.title}. ${body}` : data.title;

  const communicate = new Communicate(text, { voice: VOICE });
  const chunks = [];
  for await (const chunk of communicate.stream()) {
    if (chunk.type === "audio" && chunk.data) {
      chunks.push(Buffer.from(chunk.data));
    }
  }
  fs.writeFileSync(target, Buffer.concat(chunks));
  console.log(`generated ${slug} (${Buffer.concat(chunks).length} bytes)`);
}
