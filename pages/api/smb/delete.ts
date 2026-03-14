import type { NextApiRequest, NextApiResponse } from "next";
import {
  deleteFileFromShare,
  isAuthError,
  isAccessDeniedError,
  isNotFoundError,
} from "@/lib/smb-client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const filePath = req.query.path as string;
  if (!filePath) {
    return res.status(400).json({ error: "Path parameter is required." });
  }

  try {
    await deleteFileFromShare(filePath);
    return res.status(200).json({
      success: true,
      message: "File deleted successfully.",
    });
  } catch (error: any) {
    if (isAuthError(error)) {
      return res
        .status(401)
        .json({ error: "Authentication failed. Please check your credentials." });
    }
    if (isAccessDeniedError(error)) {
      return res
        .status(403)
        .json({ error: "Access denied. You don't have permission to delete this file." });
    }
    if (isNotFoundError(error)) {
      return res.status(404).json({ error: "Path not found." });
    }
    console.error("Delete error:", error?.message, error?.code, error);
    return res.status(500).json({ error: "Failed to delete file." });
  }
}
