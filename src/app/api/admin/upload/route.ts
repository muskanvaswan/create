import fs from "fs";
import { join } from "path";
import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedRequest } from "@/lib/auth";

const uploadsDir = join(process.cwd(), "public", "assets", "uploads");

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
  fs.mkdirSync(uploadsDir, { recursive: true });
  fs.writeFileSync(join(uploadsDir, name), Buffer.from(await file.arrayBuffer()));

  return NextResponse.json({
    path: `/assets/uploads/${name}`,
    isImage: file.type.startsWith("image/"),
  });
}
