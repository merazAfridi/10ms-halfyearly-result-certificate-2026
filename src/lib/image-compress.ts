/**
 * On-device image compression.
 *
 * Keeps the original resolution (only capped at a very large maxSize) and
 * binary-searches the highest JPEG quality that lands under the target size,
 * so the result stays visually close to the original.
 */
export type CompressResult = {
  blob: Blob;
  bytes: number;
};

type ImageSource = {
  width: number;
  height: number;
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
  close: () => void;
};

async function loadImageSource(file: File): Promise<ImageSource> {
  if (typeof createImageBitmap === "function") {
    const bitmap = await createImageBitmap(file);
    return {
      width: bitmap.width,
      height: bitmap.height,
      draw: (ctx, w, h) => ctx.drawImage(bitmap, 0, 0, w, h),
      close: () => bitmap.close?.(),
    };
  }

  const url = URL.createObjectURL(file);
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("Could not read the selected image."));
    el.src = url;
  });
  return {
    width: img.naturalWidth,
    height: img.naturalHeight,
    draw: (ctx, w, h) => ctx.drawImage(img, 0, 0, w, h),
    close: () => URL.revokeObjectURL(url),
  };
}

function toBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Image compression failed."))),
      "image/jpeg",
      quality,
    );
  });
}

export async function compressImage(
  file: File,
  {
    maxSize = 4096,
    targetBytes = 280 * 1024,
    minBytes = 200 * 1024,
    minQuality = 0.6,
    maxQuality = 0.95,
  } = {},
): Promise<CompressResult> {
  const source = await loadImageSource(file);

  try {
    const scale = Math.min(1, maxSize / Math.max(source.width, source.height));
    const width = Math.max(1, Math.round(source.width * scale));
    const height = Math.max(1, Math.round(source.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Image compression is not supported on this device.");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    source.draw(ctx, width, height);

    // Best case: highest quality already fits.
    let blob = await toBlob(canvas, maxQuality);

    if (blob.size > targetBytes) {
      let low = minQuality;
      let high = maxQuality;
      let best = await toBlob(canvas, low);

      for (let i = 0; i < 7; i++) {
        const mid = (low + high) / 2;
        const candidate = await toBlob(canvas, mid);
        if (candidate.size <= targetBytes) {
          best = candidate;
          low = mid;
          if (candidate.size >= minBytes) break;
        } else {
          high = mid;
        }
      }

      blob = best;
    }

    return { blob, bytes: blob.size };
  } finally {
    source.close();
  }
}
