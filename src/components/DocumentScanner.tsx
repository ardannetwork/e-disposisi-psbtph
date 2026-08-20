import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Camera, RotateCcw, Check, Move, Crop, Maximize } from 'lucide-react';
import {
  toGrayscale,
  adjustContrastBrightness,
  applyBlur,
  detectEdges,
  findDocumentBounds,
  binarize,
  perspectiveTransform,
  estimateCornersFromBounds,
  imageDataToBlob,
  clamp,
  Point,
} from '../utils/documentScanner';

interface DocumentScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
}

type ScanStage = 'camera' | 'preview' | 'adjust';

const MAX_WORKING_SIZE = 1000;

function downscaleImage(imageData: ImageData): ImageData {
  const w = imageData.width;
  const h = imageData.height;
  if (w <= MAX_WORKING_SIZE && h <= MAX_WORKING_SIZE) return imageData;

  const scale = Math.min(MAX_WORKING_SIZE / w, MAX_WORKING_SIZE / h);
  const newW = Math.round(w * scale);
  const newH = Math.round(h * scale);

  const canvas = document.createElement('canvas');
  canvas.width = newW;
  canvas.height = newH;
  const ctx = canvas.getContext('2d')!;
  ctx.putImageData(imageData, 0, 0);
  const scaledData = ctx.getImageData(0, 0, newW, newH);
  return scaledData;
}

export const DocumentScanner: React.FC<DocumentScannerProps> = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<number | null>(null);

  const [stage, setStage] = useState<ScanStage>('camera');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [rawImage, setRawImage] = useState<ImageData | null>(null);
  const [workingImage, setWorkingImage] = useState<ImageData | null>(null);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [threshold, setThreshold] = useState(180);
  const [contrast, setContrast] = useState(20);
  const [isBinarize, setIsBinarize] = useState(false);
  const [isAutoCrop, setIsAutoCrop] = useState(true);
  const [corners, setCorners] = useState<Point[] | null>(null);
  const [detectedCorners, setDetectedCorners] = useState<Point[] | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragIndex, setDragIndex] = useState(-1);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [videoReady, setVideoReady] = useState(false);

  const stopCamera = useCallback(() => {
    setVideoReady(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    setError('');
    setVideoReady(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: cameraFacing, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        const markReady = () => setVideoReady(true);
        videoRef.current.onloadedmetadata = markReady;
        videoRef.current.onloadeddata = markReady;
        videoRef.current.onplaying = markReady;
        await videoRef.current.play();
        setTimeout(() => {
          if (videoRef.current && videoRef.current.readyState >= 2) {
            setVideoReady(true);
          }
        }, 1000);
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('Gagal mengakses kamera. Pastikan izin kamera diberikan.');
    }
  }, [cameraFacing]);

  useEffect(() => {
    if (isOpen) {
      setStage('camera');
      setRawImage(null);
      setWorkingImage(null);
      setProcessedBlob(null);
      setCorners(null);
      setDetectedCorners(null);
      setError('');
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen, startCamera, stopCamera]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video.readyState < 2) return;
    canvas.width = video.videoWidth || 1920;
    canvas.height = video.videoHeight || 1080;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setRawImage(imageData);
    const working = downscaleImage(imageData);
    setWorkingImage(working);
    setStage('preview');
  }, []);

  const updatePreview = useCallback((img: ImageData, thresh: number, cont: number, doBinarize: boolean) => {
    let result = toGrayscale(img);
    result = adjustContrastBrightness(result, cont, 0);
    result = applyBlur(result, 1);
    if (doBinarize) {
      result = binarize(result, thresh);
    }
    const previewCanvas = previewCanvasRef.current;
    if (previewCanvas) {
      previewCanvas.width = result.width;
      previewCanvas.height = result.height;
      const ctx = previewCanvas.getContext('2d')!;
      ctx.putImageData(result, 0, 0);
    }
    return result;
  }, []);

  const runAutoCrop = useCallback(async (img: ImageData): Promise<Point[] | null> => {
    const blurred = applyBlur(img, 2);
    const edges = detectEdges(blurred);
    const bounds = findDocumentBounds(edges, blurred.width, blurred.height);
    if (bounds) {
      return estimateCornersFromBounds(bounds, blurred.width, blurred.height);
    }
    return null;
  }, []);

  const finalizeImage = useCallback(async (): Promise<Blob | null> => {
    if (!rawImage) return null;
    setIsProcessing(true);
    try {
      let img = toGrayscale(rawImage);
      img = adjustContrastBrightness(img, contrast, 0);
      img = applyBlur(img, 2);

      const useCorners = detectedCorners || corners;
      if (useCorners && useCorners.length === 4) {
        const scaleX = rawImage.width / (workingImage?.width || rawImage.width);
        const scaleY = rawImage.height / (workingImage?.height || rawImage.height);
        const scaledCorners = useCorners.map((c) => ({
          x: c.x * scaleX,
          y: c.y * scaleY,
        }));
        const w = Math.max(
          Math.abs(scaledCorners[1].x - scaledCorners[0].x),
          Math.abs(scaledCorners[3].x - scaledCorners[2].x)
        );
        const h = Math.max(
          Math.abs(scaledCorners[3].y - scaledCorners[0].y),
          Math.abs(scaledCorners[2].y - scaledCorners[1].y)
        );
        const dstW = Math.max(100, Math.round(w));
        const dstH = Math.max(100, Math.round(h));
        img = perspectiveTransform(img, scaledCorners, dstW, dstH);
      }

      const bw = binarize(img, threshold);
      const blob = await imageDataToBlob(bw);
      setProcessedBlob(blob);
      return blob;
    } catch (err) {
      console.error('Finalize error:', err);
      setError('Gagal memproses gambar.');
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [rawImage, workingImage, threshold, contrast, corners, detectedCorners]);

  useEffect(() => {
    if (stage === 'preview' && workingImage) {
      updatePreview(workingImage, threshold, contrast, isBinarize);
    }
  }, [stage, workingImage, threshold, contrast, isBinarize, updatePreview]);

  useEffect(() => {
    if (stage === 'adjust' && workingImage && !corners) {
      runAutoCrop(workingImage).then((result) => {
        if (result) {
          setDetectedCorners(result);
          setCorners(result);
        } else {
          const w = workingImage.width;
          const h = workingImage.height;
          const pad = Math.min(w, h) * 0.1;
          const fallback: Point[] = [
            { x: pad, y: pad },
            { x: w - pad, y: pad },
            { x: w - pad, y: h - pad },
            { x: pad, y: h - pad },
          ];
          setCorners(fallback);
          setDetectedCorners(fallback);
        }
      });
    }
  }, [stage, workingImage, corners, runAutoCrop]);

  const handleConfirm = useCallback(async () => {
    const blob = await finalizeImage();
    if (!blob) return;
    const file = new File([blob], `scanned_${Date.now()}.jpg`, { type: 'image/jpeg' });
    onCapture(file);
    handleClose();
  }, [finalizeImage, onCapture]);

  const handleRetake = useCallback(() => {
    setRawImage(null);
    setWorkingImage(null);
    setProcessedBlob(null);
    setCorners(null);
    setDetectedCorners(null);
    setStage('camera');
    startCamera();
  }, [startCamera]);

  const handleClose = useCallback(() => {
    stopCamera();
    onClose();
  }, [onClose, stopCamera]);

  const handleSwitchCamera = useCallback(async () => {
    setCameraFacing((prev) => (prev === 'environment' ? 'user' : 'environment'));
  }, []);

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!corners || !previewCanvasRef.current) return;
    const rect = previewCanvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const scaleX = previewCanvasRef.current.width / rect.width;
    const scaleY = previewCanvasRef.current.height / rect.height;
    const mx = x * scaleX;
    const my = y * scaleY;
    for (let i = 0; i < corners.length; i++) {
      const dx = corners[i].x - mx;
      const dy = corners[i].y - my;
      if (Math.sqrt(dx * dx + dy * dy) < 30) {
        setIsDragging(true);
        setDragIndex(i);
        break;
      }
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !corners || !previewCanvasRef.current || dragIndex < 0) return;
    const rect = previewCanvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const scaleX = previewCanvasRef.current.width / rect.width;
    const scaleY = previewCanvasRef.current.height / rect.height;
    const newCorners = [...corners];
    newCorners[dragIndex] = {
      x: clamp(x * scaleX, 0, previewCanvasRef.current.width),
      y: clamp(y * scaleY, 0, previewCanvasRef.current.height),
    };
    setCorners(newCorners);
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
    setDragIndex(-1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      <div className="relative w-full h-full max-w-2xl bg-slate-900 border border-slate-700 overflow-hidden shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-800 shrink-0">
          <h3 className="text-sm font-bold text-white">Scanner Dokumen</h3>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {stage === 'camera' && (
            <div className="space-y-4">
              <div className="relative bg-black rounded-2xl overflow-hidden aspect-[4/3]">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />
                <div className="absolute inset-0 border-2 border-white/20 rounded-2xl m-8 pointer-events-none">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={capturePhoto}
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Camera className="w-4 h-4" />
                  Ambil Foto
                </button>
                <button
                  onClick={handleSwitchCamera}
                  className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    const img = new Image();
                    img.onload = () => {
                      const canvas = document.createElement('canvas');
                      canvas.width = img.width;
                      canvas.height = img.height;
                      const ctx = canvas.getContext('2d')!;
                      ctx.drawImage(img, 0, 0);
                      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                      setRawImage(imageData);
                      const working = downscaleImage(imageData);
                      setWorkingImage(working);
                      setStage('preview');
                    };
                    img.src = reader.result as string;
                  };
                  reader.readAsDataURL(file);
                }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition-colors"
              >
                Pilih dari Galeri
              </button>
            </div>
          )}

          {stage === 'preview' && workingImage && (
            <div className="space-y-4">
              <div className="relative bg-black rounded-2xl overflow-hidden flex items-center justify-center">
                <canvas
                  ref={previewCanvasRef}
                  className="max-w-full max-h-[400px] object-contain"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                    Kontras
                  </label>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={contrast}
                    onChange={(e) => {
                      if (debounceRef.current) clearTimeout(debounceRef.current);
                      debounceRef.current = window.setTimeout(() => {
                        setContrast(Number(e.target.value));
                      }, 16);
                    }}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                    Ambang Hitam/Putih
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="255"
                    value={threshold}
                    onChange={(e) => {
                      if (debounceRef.current) clearTimeout(debounceRef.current);
                      debounceRef.current = window.setTimeout(() => {
                        setThreshold(Number(e.target.value));
                      }, 16);
                    }}
                    className="w-full"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBinarize}
                    onChange={(e) => setIsBinarize(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-800 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-xs text-slate-300">Filter Hitam/Putih</span>
                </label>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setStage('adjust'); setIsAutoCrop(false); }}
                  className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <Crop className="w-3.5 h-3.5" />
                  Sesuaikan Area
                </button>
                <button
                  onClick={handleRetake}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {stage === 'adjust' && workingImage && (
            <div className="space-y-4">
              <div className="relative bg-black rounded-2xl overflow-hidden flex items-center justify-center">
                <canvas
                  ref={previewCanvasRef}
                  className="max-w-full max-h-[400px] object-contain"
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseLeave={handleCanvasMouseUp}
                />
              </div>
              <p className="text-[10px] text-slate-500 text-center">
                Seret titik pojok untuk menyesuaikan area dokumen. Otomatis mendeteksi tepi dokumen.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsAutoCrop(true);
                    setCorners(null);
                    setDetectedCorners(null);
                    setStage('preview');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <Maximize className="w-3.5 h-3.5" />
                  Auto Crop
                </button>
                <button
                  onClick={handleRetake}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition-colors"
                >
                  Batal
                </button>
              </div>
            </div>
          )}

          {stage === 'preview' && (
            <button
              onClick={handleConfirm}
              disabled={isProcessing}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all"
            >
              <Check className="w-4 h-4" />
              {isProcessing ? 'Memproses...' : 'Gunakan Foto Ini'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
