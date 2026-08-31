import fs from "fs";
import path from "path";
import os from "os";
import crypto from "crypto";

// Use OS temp dir on Vercel/Serverless or local private_uploads
function getUploadDir(): string {
  try {
    const localDir = path.join(process.cwd(), "private_uploads");
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    return localDir;
  } catch {
    // Serverless fallback (/tmp is writable on AWS Lambda / Vercel)
    const tmpDir = path.join(os.tmpdir(), "elder_uploads");
    try {
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }
    } catch (e) {
      console.warn("Failed to create tmpDir, will use base64 storage:", e);
    }
    return tmpDir;
  }
}

const SECRET = process.env.NEXTAUTH_SECRET || "default-secret-for-signing-urls";

export interface UploadResult {
  success: boolean;
  filePath: string;
  fileName: string;
  error?: string;
}

/**
 * Saves a file buffer to private storage or base64 fallback
 */
export async function savePrivateFile(
  buffer: Buffer,
  originalName: string,
  mimeType: string = "image/png"
): Promise<UploadResult> {
  try {
    const ext = path.extname(originalName).toLowerCase() || ".png";
    const uniqueName = `${crypto.randomBytes(16).toString("hex")}${ext}`;
    const uploadDir = getUploadDir();
    const filePath = path.join(uploadDir, uniqueName);

    try {
      await fs.promises.writeFile(filePath, buffer);
      return {
        success: true,
        filePath,
        fileName: uniqueName,
      };
    } catch (fsErr) {
      // If filesystem write fails on serverless, store as self-contained base64 data URL
      console.warn("Filesystem write failed, falling back to data URL:", fsErr);
      const base64Data = `data:${mimeType};base64,${buffer.toString("base64")}`;
      return {
        success: true,
        filePath: base64Data,
        fileName: base64Data,
      };
    }
  } catch (error: any) {
    console.error("Error saving file to storage:", error);
    return {
      success: false,
      filePath: "",
      fileName: "",
      error: error.message,
    };
  }
}

/**
 * Deletes a file from private storage
 */
export async function deletePrivateFile(fileName: string): Promise<boolean> {
  if (fileName.startsWith("data:")) return true;
  try {
    const uploadDir = getUploadDir();
    const filePath = path.join(uploadDir, fileName);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error deleting file ${fileName}:`, error);
    return false;
  }
}

/**
 * Generates a temporary signed URL for a file
 */
export function generateSignedUrl(fileName: string, expiresInSeconds: number = 300): string {
  if (fileName.startsWith("data:")) {
    return fileName;
  }

  const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const payload = JSON.stringify({ fileName, exp: expiresAt });
  
  const base64Payload = Buffer.from(payload).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SECRET)
    .update(base64Payload)
    .digest("base64url");

  const token = `${base64Payload}.${signature}`;
  
  const siteUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  return `${siteUrl}/api/uploads/view?token=${token}`;
}

/**
 * Verifies a signed token and returns the local file path if valid
 */
export function verifySignedToken(token: string): string | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [base64Payload, signature] = parts;
    
    const expectedSignature = crypto
      .createHmac("sha256", SECRET)
      .update(base64Payload)
      .digest("base64url");

    if (signature !== expectedSignature) {
      console.warn("Invalid signature in upload token");
      return null;
    }

    const payloadStr = Buffer.from(base64Payload, "base64url").toString("utf8");
    const { fileName, exp } = JSON.parse(payloadStr);

    if (Date.now() / 1000 > exp) {
      console.warn("Signed token has expired");
      return null;
    }

    const uploadDir = getUploadDir();
    const safePath = path.join(uploadDir, fileName);
    
    if (!safePath.startsWith(uploadDir)) {
      console.warn("Directory traversal attempt blocked");
      return null;
    }

    if (!fs.existsSync(safePath)) {
      console.warn(`File ${fileName} not found on disk`);
      return null;
    }

    return safePath;
  } catch (error) {
    console.error("Error verifying signed token:", error);
    return null;
  }
}
