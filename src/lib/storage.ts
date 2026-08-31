import fs from "fs";
import path from "path";
import crypto from "crypto";

const UPLOADS_DIR = path.join(process.cwd(), "private_uploads");
const SECRET = process.env.NEXTAUTH_SECRET || "default-secret-for-signing-urls";

// Ensure the private uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export interface UploadResult {
  success: boolean;
  filePath: string;
  fileName: string;
  error?: string;
}

/**
 * Saves a file buffer to private storage
 */
export async function savePrivateFile(
  buffer: Buffer,
  originalName: string
): Promise<UploadResult> {
  try {
    const ext = path.extname(originalName).toLowerCase();
    const uniqueName = `${crypto.randomBytes(16).toString("hex")}${ext}`;
    const filePath = path.join(UPLOADS_DIR, uniqueName);

    await fs.promises.writeFile(filePath, buffer);

    return {
      success: true,
      filePath,
      fileName: uniqueName,
    };
  } catch (error: any) {
    console.error("Error saving file to private storage:", error);
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
  try {
    const filePath = path.join(UPLOADS_DIR, fileName);
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
 * Expires in 5 minutes (300 seconds) by default
 */
export function generateSignedUrl(fileName: string, expiresInSeconds: number = 300): string {
  const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const payload = JSON.stringify({ fileName, exp: expiresAt });
  
  const base64Payload = Buffer.from(payload).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SECRET)
    .update(base64Payload)
    .digest("base64url");

  const token = `${base64Payload}.${signature}`;
  
  // Construct the URL pointing to the API route
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
    
    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", SECRET)
      .update(base64Payload)
      .digest("base64url");

    if (signature !== expectedSignature) {
      console.warn("Invalid signature in upload token");
      return null;
    }

    // Parse and verify expiration
    const payloadStr = Buffer.from(base64Payload, "base64url").toString("utf8");
    const { fileName, exp } = JSON.parse(payloadStr);

    if (Date.now() / 1000 > exp) {
      console.warn("Signed token has expired");
      return null;
    }

    // Return the safe absolute path
    const safePath = path.join(UPLOADS_DIR, fileName);
    
    // Safety check to prevent directory traversal
    if (!safePath.startsWith(UPLOADS_DIR)) {
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
