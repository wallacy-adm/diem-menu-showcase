const DEFAULT_WIDTH = 600;
const DEFAULT_QUALITY = 70;

let webpSupportCache: boolean | null = null;

export function supportsWebP() {
  if (webpSupportCache !== null) return webpSupportCache;

  try {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    webpSupportCache = canvas.toDataURL("image/webp").startsWith("data:image/webp");
  } catch {
    webpSupportCache = false;
  }

  return webpSupportCache;
}

function isDataUrl(url: string) {
  return url.startsWith("data:");
}

function isExternalHttpUrl(url: string) {
  if (!url) return false;
  if (isDataUrl(url)) return false;

  try {
    const parsed = new URL(url, window.location.origin);
    return ["http:", "https:"].includes(parsed.protocol) && parsed.origin !== window.location.origin;
  } catch {
    return false;
  }
}

export function getOptimizedImageUrl(url: string, width = DEFAULT_WIDTH, quality = DEFAULT_QUALITY) {
  if (!url || isDataUrl(url) || !isExternalHttpUrl(url)) return url;

  try {
    const parsed = new URL(url);
    if (!parsed.searchParams.has("width")) {
      parsed.searchParams.set("width", String(width));
    }
    if (!parsed.searchParams.has("quality")) {
      parsed.searchParams.set("quality", String(quality));
    }
    if (supportsWebP() && !parsed.searchParams.has("format")) {
      parsed.searchParams.set("format", "webp");
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Falha ao ler imagem"));
    reader.readAsDataURL(file);
  });
}

function drawImageOnCanvas(file: File, maxWidth: number) {
  return new Promise<HTMLCanvasElement>((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);
    image.onload = () => {
      const ratio = Math.min(1, maxWidth / image.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * ratio));
      canvas.height = Math.max(1, Math.round(image.height * ratio));

      const context = canvas.getContext("2d");
      if (!context) {
        reject(new Error("Canvas 2D indisponível"));
        return;
      }

      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(objectUrl);
      resolve(canvas);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Falha ao processar imagem"));
    };
    image.src = objectUrl;
  });
}

function canvasToDataUrl(canvas: HTMLCanvasElement, mimeType: string, quality: number) {
  return canvas.toDataURL(mimeType, quality);
}

export async function compressImageFile(
  file: File,
  options?: { maxWidth?: number; quality?: number },
): Promise<string> {
  const maxWidth = options?.maxWidth ?? 1600;
  const quality = options?.quality ?? 0.7;

  try {
    const canvas = await drawImageOnCanvas(file, maxWidth);
    const mimeType = supportsWebP() ? "image/webp" : file.type === "image/png" ? "image/png" : "image/jpeg";

    const compressed = canvasToDataUrl(canvas, mimeType, quality);
    if (!compressed) return fileToDataUrl(file);

    return compressed;
  } catch {
    return fileToDataUrl(file);
  }
}
