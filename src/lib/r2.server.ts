import { AwsClient } from "aws4fetch";

const KEY_PREFIX = "result-cards/";

export type R2Config = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicBaseUrl: string | null;
};

export function readR2Config(): R2Config {
  const accountId = (process.env["R2_ACCOUNT_ID"] || process.env["VITE_R2_ACCOUNT_ID"])?.trim();
  const accessKeyId = (process.env["R2_ACCESS_KEY_ID"] || process.env["VITE_R2_ACCESS_KEY_ID"])?.trim();
  const secretAccessKey = (process.env["R2_SECRET_ACCESS_KEY"] || process.env["VITE_R2_SECRET_ACCESS_KEY"])?.trim();
  const rawBucket = (process.env["R2_BUCKET"] || process.env["VITE_R2_BUCKET"])?.trim() || "";

  // Extract bucket name if user specified bucket/folder (e.g. ks2026/result-cards/)
  const bucket = rawBucket.split("/")[0].trim();

  if (
    !accountId ||
    !accessKeyId ||
    !secretAccessKey ||
    !bucket ||
    accountId.includes("your_") ||
    accessKeyId.includes("your_")
  ) {
    console.error("[R2 Config Check Failed]", {
      hasAccountId: !!accountId,
      hasAccessKeyId: !!accessKeyId,
      hasSecretAccessKey: !!secretAccessKey,
      bucket,
    });
    throw new Error("Cloudflare R2 is not configured yet.");
  }

  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucket,
    publicBaseUrl: normalizePublicBaseUrl(process.env["R2_PUBLIC_BASE_URL"]),
  };
}

/** Only accept a real http(s) base URL; placeholders like "n/a" are ignored. */
function normalizePublicBaseUrl(value: string | undefined) {
  const trimmed = value?.trim();
  if (!trimmed || !/^https?:\/\//i.test(trimmed)) return null;
  return trimmed.replace(/\/+$/, "");
}

export function buildObjectKey(extension: string, baseName?: string) {
  if (baseName) {
    const safe = sanitizeFileName(baseName);
    return `${KEY_PREFIX}${safe}.${extension}`;
  }
  return `${KEY_PREFIX}${crypto.randomUUID()}.${extension}`;
}

function sanitizeFileName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

/**
 * Presigns an R2 (S3-compatible) PUT URL so the browser uploads the compressed
 * image straight to R2 — the file never passes through our backend.
 */
export async function signR2Put(objectKey: string, contentType: string, expiresIn = 900) {
  const cfg = readR2Config();
  const client = new AwsClient({
    accessKeyId: cfg.accessKeyId,
    secretAccessKey: cfg.secretAccessKey,
    service: "s3",
    region: "auto",
  });

  const endpoint = `https://${cfg.accountId}.r2.cloudflarestorage.com/${cfg.bucket}/${objectKey}`;
  const url = new URL(endpoint);
  url.searchParams.set("X-Amz-Expires", String(expiresIn));

  const signed = await client.sign(url.toString(), {
    method: "PUT",
    headers: { "Content-Type": contentType },
    aws: { signQuery: true },
  });

  return {
    uploadUrl: signed.url,
    objectKey,
    contentType,
    expiresIn,
    publicUrl: cfg.publicBaseUrl ? `${cfg.publicBaseUrl}/${objectKey}` : null,
  };
}

/**
 * Server-side upload straight to R2 (fallback when the browser cannot PUT
 * directly because of bucket CORS restrictions).
 */
export async function putR2Object(objectKey: string, body: ArrayBuffer, contentType: string) {
  const cfg = readR2Config();
  const client = new AwsClient({
    accessKeyId: cfg.accessKeyId,
    secretAccessKey: cfg.secretAccessKey,
    service: "s3",
    region: "auto",
  });

  const endpoint = `https://${cfg.accountId}.r2.cloudflarestorage.com/${cfg.bucket}/${objectKey}`;
  const res = await client.fetch(endpoint, {
    method: "PUT",
    body,
    headers: { "Content-Type": contentType },
  });

  if (!res.ok) {
    throw new Error(`R2 PUT failed [${res.status}]: ${await res.text()}`);
  }

  return {
    objectKey,
    publicUrl: cfg.publicBaseUrl ? `${cfg.publicBaseUrl}/${objectKey}` : null,
  };
}
