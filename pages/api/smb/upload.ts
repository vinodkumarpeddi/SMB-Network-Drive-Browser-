import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs";
import path from "path";
import { writeFileToShare, isAuthError } from "@/lib/smb-client";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const destPath = (req.query.path as string) || "/";

  try {
    const form = formidable({ maxFileSize: 500 * 1024 * 1024 });
    const [, files] = await form.parse(req);

    const uploadedFile = files.file?.[0];
    if (!uploadedFile) {
      return res.status(400).json({ error: "No file provided." });
    }

    const fileData = fs.readFileSync(uploadedFile.filepath);
    const fileName = uploadedFile.originalFilename || "unnamed";

    // Build destination path
    const cleanDest = destPath.replace(/^\/+|\/+$/g, "");
    const fullPath = cleanDest ? `${cleanDest}/${fileName}` : fileName;

    await writeFileToShare(fullPath, fileData);

    // Clean up temp file
    fs.unlinkSync(uploadedFile.filepath);

    return res.status(201).json({
      success: true,
      message: "File uploaded successfully.",
      filePath: `/${fullPath}`,
    });
  } catch (error: any) {
    if (isAuthError(error)) {
      return res
        .status(401)
        .json({ error: "Authentication failed. Please check your credentials." });
    }
    console.error("Upload error:", error);
    return res.status(500).json({ error: "Failed to upload file." });
  }
}
