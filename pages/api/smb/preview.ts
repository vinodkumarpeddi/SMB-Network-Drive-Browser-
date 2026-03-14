import type { NextApiRequest, NextApiResponse } from "next";
import mime from "mime-types";
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
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const filePath = req.query.path as string;
  if (!filePath) {
    return res.status(400).json({ error: "Path parameter is required." });
  }

  try {
    const fileName = path.basename(filePath);
    const contentType = mime.lookup(fileName) || "application/octet-stream";

    const content = await readFileFromShare(filePath);

    res.setHeader("Content-Type", contentType);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${fileName}"`
    );
    return res.status(200).send(content);
  } catch (error: any) {
    if (isAuthError(error)) {
      return res
        .status(401)
        .json({ error: "Authentication failed. Please check your credentials." });
    }
    if (isNotFoundError(error)) {
      return res.status(404).json({ error: "Path not found." });
    }
    console.error("Preview error:", error);
    return res.status(500).json({ error: "Failed to preview file." });
  }
}
