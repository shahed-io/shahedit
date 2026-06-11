// Browser-side background removal using @huggingface/transformers (RMBG-1.4).
// Returns a PNG Blob with transparent background.
import { pipeline, env } from "@huggingface/transformers";

// Use remote models from HF hub (no local files required)
env.allowLocalModels = false;
env.useBrowserCache = true;

const MAX_DIM = 1024;

let segmenterPromise: Promise<any> | null = null;
const getSegmenter = () => {
  if (!segmenterPromise) {
    segmenterPromise = pipeline("image-segmentation", "briaai/RMBG-1.4", {
      // try WebGPU first, fallback handled by transformers.js
      device: "webgpu",
    }).catch(() =>
      pipeline("image-segmentation", "briaai/RMBG-1.4")
    );
  }
  return segmenterPromise;
};

const loadImage = (file: File | Blob): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });

const resizeToCanvas = (img: HTMLImageElement) => {
  const canvas = document.createElement("canvas");
  let { width, height } = img;
  if (width > MAX_DIM || height > MAX_DIM) {
    if (width >= height) {
      height = Math.round((height * MAX_DIM) / width);
      width = MAX_DIM;
    } else {
      width = Math.round((width * MAX_DIM) / height);
      height = MAX_DIM;
    }
  }
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, width, height);
  return canvas;
};

export async function removeBackground(file: File): Promise<Blob> {
  const segmenter = await getSegmenter();
  const img = await loadImage(file);
  const canvas = resizeToCanvas(img);
  const dataUrl = canvas.toDataURL("image/png");

  const result: any = await segmenter(dataUrl);
  const mask = Array.isArray(result) ? result[0]?.mask : result?.mask;
  if (!mask?.data) throw new Error("Background removal failed: no mask returned");

  const ctx = canvas.getContext("2d")!;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  // Mask data is uint8, 0..255 — for RMBG, higher value = foreground.
  for (let i = 0; i < mask.data.length; i++) {
    data[i * 4 + 3] = mask.data[i]; // set alpha
  }
  ctx.putImageData(imageData, 0, 0);

  return await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Encode failed"))), "image/png")
  );
}
