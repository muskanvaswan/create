import fs from "fs";
import { dirname, join } from "path";

/**
 * File store for runtime content (notes, folders, uploads, audio).
 *
 * With GITHUB_TOKEN and GITHUB_REPO set, files live in the GitHub repo via
 * the Contents API — required on read-only hosts like Vercel, where each
 * write becomes a commit (which also triggers a redeploy of the public
 * pages). Without them, files live on the local filesystem as before.
 *
 * Paths are always repo-relative with forward slashes, e.g. "_posts/foo.md".
 */

const githubRepo = process.env.GITHUB_REPO;
const githubToken = process.env.GITHUB_TOKEN;
const githubBranch = process.env.GITHUB_BRANCH || "main";
// Overridable so tests can point the store at a mock server.
const githubApiBase = process.env.GITHUB_API_URL || "https://api.github.com";

export const usingGitHubStore = Boolean(githubRepo && githubToken);

function contentsUrl(path: string): string {
  const encoded = path.split("/").map(encodeURIComponent).join("/");
  return `${githubApiBase}/repos/${githubRepo}/contents/${encoded}`;
}

function githubHeaders(accept: string): HeadersInit {
  return {
    Accept: accept,
    Authorization: `Bearer ${githubToken}`,
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

async function githubRequest(
  path: string,
  init: RequestInit & { accept?: string } = {},
): Promise<Response> {
  const { accept = "application/vnd.github+json", ...rest } = init;
  return fetch(`${contentsUrl(path)}${rest.method ? "" : `?ref=${githubBranch}`}`, {
    ...rest,
    headers: githubHeaders(accept),
    cache: "no-store",
  });
}

/** Blob sha of an existing file, needed to update or delete it. */
async function githubSha(path: string): Promise<string | null> {
  // The parent listing works for files of any size, unlike a direct GET
  // which fails JSON encoding past 1 MB.
  const dir = path.includes("/") ? path.slice(0, path.lastIndexOf("/")) : "";
  const name = path.slice(path.lastIndexOf("/") + 1);
  const res = await githubRequest(dir);
  if (!res.ok) return null;
  const entries = (await res.json()) as { name: string; sha: string }[];
  return entries.find((entry) => entry.name === name)?.sha ?? null;
}

export async function readFile(path: string): Promise<Buffer | null> {
  if (!usingGitHubStore) {
    const fullPath = join(process.cwd(), path);
    return fs.existsSync(fullPath) ? fs.readFileSync(fullPath) : null;
  }
  const res = await githubRequest(path, { accept: "application/vnd.github.raw+json" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub read of ${path} failed: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

/** File names directly inside a directory; [] when it doesn't exist. */
export async function listDir(path: string): Promise<string[]> {
  if (!usingGitHubStore) {
    const fullPath = join(process.cwd(), path);
    return fs.existsSync(fullPath) ? fs.readdirSync(fullPath) : [];
  }
  const res = await githubRequest(path);
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`GitHub list of ${path} failed: ${res.status}`);
  const entries = (await res.json()) as { name: string; type: string }[];
  return entries.filter((entry) => entry.type === "file").map((entry) => entry.name);
}

export async function writeFile(
  path: string,
  data: Buffer | string,
  message: string,
): Promise<void> {
  if (!usingGitHubStore) {
    const fullPath = join(process.cwd(), path);
    fs.mkdirSync(dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, data);
    return;
  }
  const body = {
    message,
    content: Buffer.from(data).toString("base64"),
    branch: githubBranch,
  };
  // Two attempts: a 409/422 usually means the sha went stale under a
  // concurrent commit, so refetch it once and retry.
  for (let attempt = 0; ; attempt++) {
    const sha = await githubSha(path);
    const res = await githubRequest(path, {
      method: "PUT",
      body: JSON.stringify(sha ? { ...body, sha } : body),
    });
    if (res.ok) return;
    if (attempt > 0 || (res.status !== 409 && res.status !== 422)) {
      throw new Error(`GitHub write of ${path} failed: ${res.status}`);
    }
  }
}

export async function deleteFile(path: string, message: string): Promise<void> {
  if (!usingGitHubStore) {
    fs.rmSync(join(process.cwd(), path), { force: true });
    return;
  }
  const sha = await githubSha(path);
  if (!sha) return;
  const res = await githubRequest(path, {
    method: "DELETE",
    body: JSON.stringify({ message, sha, branch: githubBranch }),
  });
  if (!res.ok && res.status !== 404) {
    throw new Error(`GitHub delete of ${path} failed: ${res.status}`);
  }
}
