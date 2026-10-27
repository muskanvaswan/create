/**
 * Shrinks photos before they're uploaded into a note. Phone photos run
 * 3–12 MB, over Vercel's 4.5 MB request body limit and far more than a note
 * needs, and iPhone HEIC photos only display in Safari — so large or HEIC
 * images are downscaled and re-encoded in the browser first.
 */

const MAX_EDGE = 2400;
// Under this, an image is already web-sized and is uploaded untouched.
const MAX_UNTOUCHED_BYTES = 1_500_000;
// GIFs would lose their animation and SVGs their vectors; leave them alone.
const RESIZABLE = /^image\/(jpeg|png|webp|heic|heif|avif)$/;

export function isHeic(file: File): boolean {
  return /^image\/hei[cf]/.test(file.type) || /\.hei[cf]$/i.test(file.name);
}

export function isImage(file: File): boolean {
  return file.type.startsWith("image/") || isHeic(file);
}

export async function prepareImage(file: File): Promise<File> {
  const heic = isHeic(file);
  if (!heic && (!RESIZABLE.test(file.type) || file.size <= MAX_UNTOUCHED_BYTES)) {
    return file;
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    if (heic) {
      throw new Error(
        "This browser can't open HEIC photos. Use Safari, or export it as JPEG",
      );
    }
    return file;
  }

  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  // PNGs may be transparent, so they go to WebP (browsers that can't encode
  // it fall back to PNG); everything else becomes JPEG.
  const type = file.type === "image/png" ? "image/webp" : "image/jpeg";
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, type, 0.85),
  );
  if (!blob || (!heic && blob.size >= file.size)) return file;

  const extension = blob.type.slice("image/".length).replace("jpeg", "jpg");
  const name = `${file.name.replace(/\.[^.]*$/, "") || "image"}.${extension}`;
  return new File([blob], name, { type: blob.type });
}
