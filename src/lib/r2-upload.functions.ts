import { createServerFn } from "@tanstack/react-start";

/**
 * Returns a short-lived pre-signed Cloudflare R2 PUT URL for the result card
 * image. The browser uploads directly to R2; only the resulting path/URL text
 * is later saved in the database.
 */
export const getResultCardUploadUrl = createServerFn({ method: "POST" })
  .inputValidator(
    (input: {
      extension?: string;
      certificateName?: string;
      schoolName?: string;
      className?: string;
    }) => {
      const ext = (input?.extension ?? "jpg").toLowerCase();
      if (!/^[a-z0-9]{1,5}$/.test(ext)) throw new Error("Invalid file extension.");
      return {
        extension: ext,
        certificateName: String(input?.certificateName ?? "").trim(),
        schoolName: String(input?.schoolName ?? "").trim(),
        className: String(input?.className ?? "").trim(),
      };
    },
  )
  .handler(async ({ data }) => {
    const { buildObjectKey, signR2Put } = await import("./r2.server");
    const baseName = [data.certificateName, data.schoolName, data.className]
      .filter(Boolean)
      .join("-");
    const objectKey = buildObjectKey(data.extension, baseName || undefined);
    return signR2Put(objectKey, "image/jpeg");
  });
