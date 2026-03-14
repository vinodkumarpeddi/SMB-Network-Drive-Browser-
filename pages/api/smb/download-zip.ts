import type { NextApiRequest, NextApiResponse } from "next";
import archiver from "archiver";
import path from "path";
import {
  readFileFromShare,
  isAuthError,
  isNotFoundError,
} from "@/lib/smb-client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { paths } = req.body;
  if (!Array.isArray(paths) || paths.length === 0) {
    return res.status(400).json({ error: "Paths array is required." });
  }

  try {
    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="archive.zip"'
    );
    res.setHeader("Transfer-Encoding", "chunked");

    const archive = archiver("zip", { zlib: { level: 5 } });

    archive.on("error", (err) => {
      console.error("Archive error:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to create archive." });
      }
    });

    archive.pipe(res);

    for (const filePath of paths) {
      try {
        const content = await readFileFromShare(filePath);
        const fileName = path.basename(filePath);
        archive.append(content, { name: fileName });
      } catch (fileError: any) {
        if (isAuthError(fileError)) {
          if (!res.headersSent) {
            return res.status(401).json({
              error: "Authentication failed. Please check your credentials.",
            });
          }
          return;
        }
        if (isNotFoundError(fileError)) {
          // Skip files that don't exist
          console.warn(`File not found, skipping: ${filePath}`);
          continue;
        }
        throw fileError;
      }
    }

    await archive.finalize();
  } catch (error: any) {
    if (isAuthError(error)) {
      if (!res.headersSent) {
        return res.status(401).json({
          error: "Authentication failed. Please check your credentials.",
        });
      }
    }
    if (!res.headersSent) {
      console.error("ZIP download error:", error);
      return res.status(500).json({ error: "Failed to create ZIP archive." });
    }
  }
}
