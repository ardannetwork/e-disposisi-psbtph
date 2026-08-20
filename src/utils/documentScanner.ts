export interface Point {
  x: number;
  y: number;
}

export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function toGrayscale(imageData: ImageData): ImageData {
  const data = imageData.data;
  const result = new ImageData(imageData.width, imageData.height);
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    result.data[i] = gray;
    result.data[i + 1] = gray;
    result.data[i + 2] = gray;
    result.data[i + 3] = 255;
  }
  return result;
}

export function adjustContrastBrightness(
  imageData: ImageData,
  contrast: number,
  brightness: number
): ImageData {
  const data = imageData.data;
  const result = new ImageData(imageData.width, imageData.height);
  const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
  for (let i = 0; i < data.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      const newColor = factor * (data[i + c] - 128) + 128 + brightness;
      result.data[i + c] = clamp(newColor, 0, 255);
    }
    result.data[i + 3] = data[i + 3];
  }
  return result;
}

export function applyBlur(imageData: ImageData, radius: number): ImageData {
  if (radius <= 0) return imageData;
  const w = imageData.width;
  const h = imageData.height;
  const src = imageData.data;
  const result = new ImageData(w, h);
  const dst = result.data;
  const size = radius * 2 + 1;
  const div = size * size;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let r = 0, g = 0, b = 0, a = 0, count = 0;
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = clamp(x + dx, 0, w - 1);
          const ny = clamp(y + dy, 0, h - 1);
          const idx = (ny * w + nx) * 4;
          r += src[idx];
          g += src[idx + 1];
          b += src[idx + 2];
          a += src[idx + 3];
          count++;
        }
      }
      const idx = (y * w + x) * 4;
      dst[idx] = r / count;
      dst[idx + 1] = g / count;
      dst[idx + 2] = b / count;
      dst[idx + 3] = a / count;
    }
  }
  return result;
}

export function detectEdges(imageData: ImageData): Float32Array {
  const w = imageData.width;
  const h = imageData.height;
  const gray = new Float32Array(w * h);
  const data = imageData.data;
  for (let i = 0; i < w * h; i++) {
    gray[i] = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
  }

  const edges = new Float32Array(w * h);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = y * w + x;
      const gx =
        -gray[(y - 1) * w + (x - 1)] + gray[(y - 1) * w + (x + 1)] +
        -2 * gray[y * w + (x - 1)] + 2 * gray[y * w + (x + 1)] +
        -gray[(y + 1) * w + (x - 1)] + gray[(y + 1) * w + (x + 1)];
      const gy =
        -gray[(y - 1) * w + (x - 1)] - 2 * gray[(y - 1) * w + x] - gray[(y - 1) * w + (x + 1)] +
        gray[(y + 1) * w + (x - 1)] + 2 * gray[(y + 1) * w + x] + gray[(y + 1) * w + (x + 1)];
      edges[idx] = Math.sqrt(gx * gx + gy * gy);
    }
  }
  return edges;
}

export function findDocumentBounds(
  edges: Float32Array,
  width: number,
  height: number
): { x: number; y: number; w: number; h: number } | null {
  const threshold = 80;
  let minX = width, minY = height, maxX = 0, maxY = 0;
  let edgeCount = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (edges[y * width + x] > threshold) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        edgeCount++;
      }
    }
  }
  if (edgeCount < 500) return null;
  const pad = 20;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(width - 1, maxX + pad);
  maxY = Math.min(height - 1, maxY + pad);
  const w = maxX - minX;
  const h = maxY - minY;
  if (w < 50 || h < 50) return null;
  return { x: minX, y: minY, w, h };
}

export function binarize(imageData: ImageData, threshold: number): ImageData {
  const data = imageData.data;
  const result = new ImageData(imageData.width, imageData.height);
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    const val = gray > threshold ? 255 : 0;
    result.data[i] = val;
    result.data[i + 1] = val;
    result.data[i + 2] = val;
    result.data[i + 3] = 255;
  }
  return result;
}

export function perspectiveTransform(
  imageData: ImageData,
  srcCorners: Point[],
  dstWidth: number,
  dstHeight: number
): ImageData {
  const w = imageData.width;
  const h = imageData.height;
  const src = imageData.data;
  const result = new ImageData(dstWidth, dstHeight);
  const dst = result.data;

  const [tl, tr, br, bl] = srcCorners;

  const A = [
    tl.x, tl.y, 1, 0, 0, 0, -tl.x * dstWidth, -tl.y * dstWidth,
    0, 0, 0, tl.x, tl.y, 1, -tl.x * dstHeight, -tl.y * dstHeight,
    tr.x, tr.y, 1, 0, 0, 0, -tr.x * dstWidth, -tr.y * dstWidth,
    0, 0, 0, tr.x, tr.y, 1, -tr.x * dstHeight, -tr.y * dstHeight,
    br.x, br.y, 1, 0, 0, 0, -br.x * dstWidth, -br.y * dstWidth,
    0, 0, 0, br.x, br.y, 1, -br.x * dstHeight, -br.y * dstHeight,
    bl.x, bl.y, 1, 0, 0, 0, -bl.x * dstWidth, -bl.y * dstWidth,
    0, 0, 0, bl.x, bl.y, 1, -bl.x * dstHeight, -bl.y * dstHeight,
  ];

  const b = [0, 0, dstWidth, 0, dstWidth, dstHeight, 0, dstHeight];

  const H = solveLinearSystem(A, b);
  if (!H) return imageData;

  const h0 = H[0], h1 = H[1], h2 = H[2], h3 = H[3], h4 = H[4], h5 = H[5], h6 = H[6], h7 = H[7];

  for (let y = 0; y < dstHeight; y++) {
    for (let x = 0; x < dstWidth; x++) {
      const denom = h6 * x + h7 * y + 1;
      const srcX = (h0 * x + h1 * y + h2) / denom;
      const srcY = (h3 * x + h4 * y + h5) / denom;
      const sx = clamp(Math.round(srcX), 0, w - 1);
      const sy = clamp(Math.round(srcY), 0, h - 1);
      const srcIdx = (sy * w + sx) * 4;
      const dstIdx = (y * dstWidth + x) * 4;
      dst[dstIdx] = src[srcIdx];
      dst[dstIdx + 1] = src[srcIdx + 1];
      dst[dstIdx + 2] = src[srcIdx + 2];
      dst[dstIdx + 3] = src[srcIdx + 3];
    }
  }
  return result;
}

function solveLinearSystem(A: number[], b: number[]): number[] | null {
  const n = 8;
  const aug: number[][] = [];
  for (let i = 0; i < n; i++) {
    aug[i] = [];
    for (let j = 0; j < n; j++) {
      aug[i][j] = A[i * n + j];
    }
    aug[i][n] = b[i];
  }

  for (let i = 0; i < n; i++) {
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(aug[k][i]) > Math.abs(aug[maxRow][i])) maxRow = k;
    }
    [aug[i], aug[maxRow]] = [aug[maxRow], aug[i]];
    if (Math.abs(aug[i][i]) < 1e-10) return null;
    for (let k = i + 1; k <= n; k++) aug[i][k] /= aug[i][i];
    for (let k = 0; k < n; k++) {
      if (k !== i && Math.abs(aug[k][i]) > 1e-10) {
        for (let j = i + 1; j <= n; j++) {
          aug[k][j] -= aug[k][i] * aug[i][j];
        }
      }
    }
  }

  const x: number[] = [];
  for (let i = 0; i < n; i++) x[i] = aug[i][n];
  return x;
}

export function estimateCornersFromBounds(
  bounds: { x: number; y: number; w: number; h: number },
  width: number,
  height: number
): Point[] {
  const { x, y, w, h } = bounds;
  return [
    { x, y },
    { x: x + w, y },
    { x: x + w, y: y + h },
    { x, y: y + h },
  ];
}

export function imageDataToBlob(imageData: ImageData): Promise<Blob> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext('2d')!;
    ctx.putImageData(imageData, 0, 0);
    canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.9);
  });
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.9);
  });
}
