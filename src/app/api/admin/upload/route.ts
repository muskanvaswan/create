import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedRequest } from "@/lib/auth";
import { writeFile } from "@/lib/content-store";

export async function POST(req: NextRequest) {
  if (!isAuthenticatedRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const safeName =
    file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-+/, "") ||
    "file";
  const name = `${Date.now()}-${safeName}`;
  await writeFile(
    `public/assets/uploads/${name}`,
    Buffer.from(await file.arrayBuffer()),
    `admin: upload "${name}"`,
  );

  return NextResponse.json({
    path: `/assets/uploads/${name}`,
    isImage: file.type.startsWith("image/"),
  });
}
