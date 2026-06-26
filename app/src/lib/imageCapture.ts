const DEFAULT_MAX_BYTES = 2 * 1024 * 1024;

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('Could not read image file.'));
    };
    reader.onerror = () => reject(reader.error ?? new Error('Could not read image file.'));
    reader.readAsDataURL(file);
  });
}

function dataUrlByteSize(dataUrl: string): number {
  const base64 = dataUrl.split(',')[1] ?? '';
  return Math.ceil((base64.length * 3) / 4);
}

export async function compressImageDataUrl(
  dataUrl: string,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    maxBytes?: number;
  } = {}
): Promise<string> {
  const maxWidth = options.maxWidth ?? 1280;
  const maxHeight = options.maxHeight ?? 1280;
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES;
  let quality = options.quality ?? 0.88;

  const img = await loadImage(dataUrl);

  let width = img.naturalWidth;
  let height = img.naturalHeight;
  const ratio = Math.min(1, maxWidth / width, maxHeight / height);
  width = Math.round(width * ratio);
  height = Math.round(height * ratio);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, width, height);

  let result = canvas.toDataURL('image/jpeg', quality);
  while (dataUrlByteSize(result) > maxBytes && quality > 0.45) {
    quality -= 0.1;
    result = canvas.toDataURL('image/jpeg', quality);
  }

  if (dataUrlByteSize(result) > maxBytes && (width > 640 || height > 640)) {
    return compressImageDataUrl(result, {
      maxWidth: Math.round(width * 0.75),
      maxHeight: Math.round(height * 0.75),
      quality: 0.75,
      maxBytes,
    });
  }

  return result;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Invalid image.'));
    img.src = src;
  });
}

export async function processImageFile(file: File): Promise<string> {
  const raw = await fileToDataUrl(file);
  return compressImageDataUrl(raw);
}

export async function processCapturedImage(dataUrl: string): Promise<string> {
  return compressImageDataUrl(dataUrl);
}
