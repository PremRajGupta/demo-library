import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Camera, ImagePlus, X, SwitchCamera } from 'lucide-react';
import { processCapturedImage, processImageFile } from '../lib/imageCapture';

type FacingMode = 'user' | 'environment';

type ImageCaptureFieldProps = {
  label: React.ReactNode;
  previewUrl: string | null;
  onImageChange: (dataUrl: string | null) => void;
  facingMode?: FacingMode;
  previewClassName?: string;
  emptyHint?: string;
  error?: string;
  helperText?: string;
};

export default function ImageCaptureField({
  label,
  previewUrl,
  onImageChange,
  facingMode = 'environment',
  previewClassName = 'w-28 h-28',
  emptyHint = 'No image',
  error,
  helperText = 'Upload from gallery or take a photo with camera.',
}: ImageCaptureFieldProps) {
  const inputId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleFile = async (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setLocalError('Please select an image file (JPG/PNG).');
      return;
    }
    setLocalError('');
    setProcessing(true);
    try {
      const dataUrl = await processImageFile(file);
      onImageChange(dataUrl);
    } catch {
      setLocalError('Could not process image. Try another file.');
    } finally {
      setProcessing(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleCapture = async (dataUrl: string) => {
    setLocalError('');
    setProcessing(true);
    try {
      const compressed = await processCapturedImage(dataUrl);
      onImageChange(compressed);
    } catch {
      setLocalError('Could not save photo. Try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div>
      <div className="mb-2">{label}</div>
      <div className="border border-dashed border-[#e6eef8] rounded-lg p-3 flex items-center justify-center min-h-[120px] bg-[#f8fafc]">
        {previewUrl ? (
          <img src={previewUrl} alt="Preview" className={`${previewClassName} rounded-md object-cover`} />
        ) : (
          <div className="flex flex-col items-center text-[#64748b] py-2">
            <Camera size={28} className="opacity-60" />
            <p className="text-sm mt-2">{emptyHint}</p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mt-3">
        <input
          ref={fileRef}
          id={inputId}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          disabled={processing}
        />
        <label
          htmlFor={inputId}
          className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-[#e2e8f0] bg-white text-[#1e293b] hover:bg-[#f8fafc] cursor-pointer ${processing ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <ImagePlus size={16} />
          Gallery
        </label>
        <button
          type="button"
          onClick={() => setCameraOpen(true)}
          disabled={processing}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-[#0369a1] text-white hover:bg-[#075985] disabled:opacity-50"
        >
          <Camera size={16} />
          {processing ? 'Processing…' : 'Camera'}
        </button>
        {previewUrl && (
          <button
            type="button"
            onClick={() => onImageChange(null)}
            disabled={processing}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-[#fecaca] text-[#dc2626] hover:bg-[#fef2f2] disabled:opacity-50"
          >
            Remove
          </button>
        )}
      </div>

      <p className="text-xs text-[#94a3b8] mt-2">{helperText}</p>
      {(error || localError) && (
        <p className="text-xs text-red-600 mt-1">{error || localError}</p>
      )}

      {cameraOpen &&
        createPortal(
          <CameraCaptureModal
            facingMode={facingMode}
            onCapture={handleCapture}
            onClose={() => setCameraOpen(false)}
          />,
          document.body
        )}
    </div>
  );
}

function CameraCaptureModal({
  facingMode: initialFacing,
  onCapture,
  onClose,
}: {
  facingMode: FacingMode;
  onCapture: (dataUrl: string) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<FacingMode>(initialFacing);
  const [cameraError, setCameraError] = useState('');
  const [ready, setReady] = useState(false);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError('');
    setReady(false);
    stopStream();
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError('Camera is not supported on this browser. Use Gallery upload instead.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        await video.play();
        setReady(true);
      }
    } catch {
      setCameraError(
        'Could not open camera. Allow camera permission in browser settings, or use Gallery upload.'
      );
    }
  }, [facingMode, stopStream]);

  useEffect(() => {
    startCamera();
    return () => stopStream();
  }, [startCamera, stopStream]);

  const switchCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !ready) return;
    const w = video.videoWidth;
    const h = video.videoHeight;
    if (!w || !h) return;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, w, h);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    stopStream();
    onCapture(dataUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-black">
      <div className="flex items-center justify-between px-4 py-3 bg-[#1a2b4a] text-white shrink-0">
        <p className="font-semibold text-sm sm:text-base">Take Photo</p>
        <button
          type="button"
          onClick={() => {
            stopStream();
            onClose();
          }}
          className="p-2 rounded-lg hover:bg-white/10"
          aria-label="Close camera"
        >
          <X size={22} />
        </button>
      </div>

      <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-black">
        {cameraError ? (
          <p className="text-white text-center px-6 text-sm max-w-md">{cameraError}</p>
        ) : (
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className="max-h-full max-w-full object-contain"
          />
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="shrink-0 px-4 py-4 pb-6 bg-[#0f172a] flex items-center justify-center gap-6">
        <button
          type="button"
          onClick={switchCamera}
          disabled={!!cameraError}
          className="flex flex-col items-center gap-1 text-white/80 text-xs disabled:opacity-40"
        >
          <span className="p-3 rounded-full bg-white/10">
            <SwitchCamera size={22} />
          </span>
          Flip
        </button>
        <button
          type="button"
          onClick={capture}
          disabled={!ready || !!cameraError}
          className="w-16 h-16 rounded-full border-4 border-white bg-white/20 hover:bg-white/30 disabled:opacity-40"
          aria-label="Capture photo"
        />
        <button
          type="button"
          onClick={() => {
            stopStream();
            onClose();
          }}
          className="text-sm text-white/70 px-3 py-2"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
