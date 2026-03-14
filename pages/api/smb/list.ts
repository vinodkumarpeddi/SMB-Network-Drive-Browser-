import type { NextApiRequest, NextApiResponse } from "next";
import { listDirectory, isAuthError, isNotFoundError } from "@/lib/smb-client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const path = (req.query.path as string) || "/";

  try {
    const entries = await listDirectory(path);
    return res.status(200).json(entries);
  } catch (error: any) {
    if (isAuthError(error)) {
      return res
        .status(401)
        .json({ error: "Authentication failed. Please check your credentials." });
    }
    if (isNotFoundError(error)) {
      return res.status(404).json({ error: "Path not found." });
    }
    console.error("List error:", error);
    return res.status(500).json({ error: "Failed to list directory." });
  }
}
