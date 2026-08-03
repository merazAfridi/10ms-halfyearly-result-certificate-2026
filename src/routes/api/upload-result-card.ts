import { createFileRoute } from "@tanstack/react-router";

/**
 * Fallback upload path: used only when the browser's direct PUT to R2 is
 * blocked (e.g. the current origin is missing from the bucket's CORS rules).
 * The image is streamed straight to R2 and never stored in the database.
 */
export const Route = createFileRoute("/api/upload-result-card")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const contentType = request.headers.get("content-type") ?? "image/jpeg";
        if (!contentType.startsWith("image/")) {
          return Response.json({ error: "Only image uploads are allowed." }, { status: 400 });
        }

        const body = await request.arrayBuffer();
        if (body.byteLength === 0 || body.byteLength > 7 * 1024 * 1024) {
          return Response.json({ error: "Invalid image size." }, { status: 400 });
        }

        const { buildObjectKey, putR2Object } = await import("@/lib/r2.server");
        const baseName = request.headers.get("x-result-card-filename") ?? undefined;
        const objectKey = buildObjectKey("jpg", baseName);

        try {
          const result = await putR2Object(objectKey, body, contentType);
          return Response.json(result);
        } catch (err) {
          console.error("R2 proxy upload failed", err);
          return Response.json({ error: "Upload failed." }, { status: 502 });
        }
      },
    },
  },
});
