// OcrUploader.tsx
import React, { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Upload,
  FileImage,
  Loader2,
  CheckCircle,
  AlertCircle,
  Camera,
  X,
  Trash2,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface OCRResult {
  success: boolean;
  filename: string;
  results: {
    recognized: string;
    brahmi_characters: string;
    brahmi_confidence: string;
    brahmi_explanation: string;
    transliterated: string;
    translated: string;
  };
}

const BrahmiAPIService = {
  async processImage(file: File): Promise<OCRResult> {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("http://localhost:8000/process-image", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Failed to process image");
    }

    return (await response.json()) as OCRResult;
  },

  async testSampleImage(): Promise<OCRResult> {
    const response = await fetch("http://localhost:8000/test-sample", {
      method: "POST",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Failed to process sample image");
    }

    return (await response.json()) as OCRResult;
  },
};

const OcrUploader: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<OCRResult | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const { toast } = useToast();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    if (e.type === "dragleave") setDragActive(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const f = e.dataTransfer.files?.[0];
      if (f && f.type.startsWith("image/")) {
        setResult(null);
        handleFile(f);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please drop an image file.",
          variant: "destructive",
        });
      }
    },
    [toast]
  );

  const handleFile = (selectedFile: File) => {
    setFile(selectedFile);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
    // reset input value so same file can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Start camera: show UI, then attach stream and play
  const startCamera = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast({
        title: "Camera not supported",
        description: "Your browser doesn't support camera access.",
        variant: "destructive",
      });
      return;
    }

    try {
      // request stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      // Save stream reference so we can stop it later
      streamRef.current = stream;

      // Show camera UI first so the <video> element is visible in DOM
      setShowCamera(true);

      // wait for next paint so videoRef points to the element (reliable)
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));

      if (!videoRef.current) {
        console.error("Video element not available after showing camera UI");
        toast({
          title: "Camera error",
          description: "Video element not ready.",
          variant: "destructive",
        });
        return;
      }

      // Attach the stream and attempt to play. use playsinline + muted to satisfy autoplay policies.
      try {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        videoRef.current.muted = true;
        await videoRef.current.play();
        setCameraReady(true);
        toast({
          title: "Camera ready",
          description: "Position the inscription and tap Capture.",
        });
      } catch (playErr) {
        // some devices require a user gesture - but we did start on a button click so usually ok
        console.error("video.play() failed:", playErr);
        toast({
          title: "Camera playback failed",
          description: "Try allowing permissions or reload the page.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("getUserMedia error:", err);
      toast({
        title: "Camera access denied",
        description: err instanceof Error ? err.message : "Permission or device error",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      try {
        videoRef.current.pause();
        // remove srcObject to free camera on some browsers
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        videoRef.current.srcObject = null;
      } catch (e) {
        // ignore
      }
    }
    setCameraReady(false);
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      toast({
        title: "Capture failed",
        description: "Camera is not ready.",
        variant: "destructive",
      });
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // some devices take a moment to fill videoWidth/videoHeight; guard
    const vw = video.videoWidth || 1280;
    const vh = video.videoHeight || 720;

    canvas.width = vw;
    canvas.height = vh;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      toast({
        title: "Capture failed",
        description: "Could not get canvas context.",
        variant: "destructive",
      });
      return;
    }

    // draw and convert to Blob -> File
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          toast({
            title: "Capture failed",
            description: "Could not create image blob.",
            variant: "destructive",
          });
          return;
        }
        const timestamp = Date.now();
        const capturedFile = new File([blob], `brahmi-capture-${timestamp}.jpg`, {
          type: "image/jpeg",
        });
        handleFile(capturedFile);
        stopCamera();
        toast({
          title: "Photo captured",
          description: "Image ready for processing.",
        });
      },
      "image/jpeg",
      0.95
    );
  };

  const processImage = async () => {
    if (!file) {
      toast({
        title: "No image",
        description: "Please choose or capture an image first.",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    try {
      const res = await BrahmiAPIService.processImage(file);
      setResult(res);
      toast({
        title: "Processed",
        description: "Recognition completed.",
      });
    } catch (err) {
      console.error("processImage error:", err);
      toast({
        title: "Processing failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const testSample = async () => {
    setProcessing(true);
    try {
      const res = await BrahmiAPIService.testSampleImage();
      setResult(res);
      setPreview(null);
      setFile(null);
      toast({
        title: "Sample processed",
        description: "Loaded sample result.",
      });
    } catch (err) {
      console.error("testSample error:", err);
      toast({
        title: "Sample failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const removeSelectedFile = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
  };

  return (
    <section id="translator" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-manuscript text-4xl font-bold text-primary mb-4">
            Upload & Translate
          </h2>
          <p className="font-modern text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload an image or use your camera to capture Ancient Brahmi script and get instant
            recognition, transliteration, and translation.
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="font-modern flex items-center">
                <Upload className="w-5 h-5 mr-2" />
                Upload or Capture Image
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Upload drop area */}
              {!showCamera ? (
                <>
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    {preview ? (
                      <div className="space-y-4">
                        <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-lg shadow-lg" />
                        <div className="flex items-center justify-center gap-2">
                          <p className="font-modern text-sm text-muted-foreground truncate">{file?.name}</p>
                          <Button variant="ghost" size="sm" onClick={removeSelectedFile} className="ml-2">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <FileImage className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="font-modern text-lg mb-2">Drop your Brahmi script image here</p>
                        <p className="font-modern text-sm text-muted-foreground mb-2">or use the options below</p>
                      </>
                    )}

                    {/* Hidden input used by programmatic click */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileInput}
                      className="hidden"
                      aria-hidden
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      className="font-modern w-full"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choose File
                    </Button>

                    <Button variant="outline" onClick={startCamera} className="font-modern w-full">
                      <Camera className="w-4 h-4 mr-2" />
                      Use Camera
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={processImage} disabled={!file || processing} className="flex-1 font-modern">
                      {processing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Process Image"
                      )}
                    </Button>

                    <Button variant="outline" onClick={testSample} disabled={processing} className="font-modern">
                      Try Sample
                    </Button>
                  </div>
                </>
              ) : (
                // Camera UI
                <div className="space-y-4">
                  <div className="relative rounded-lg overflow-hidden bg-black">
                    <video
                      ref={videoRef}
                      // keeps element in DOM always so ref is available —
                      // we control visibility with container rendering
                      playsInline
                      muted
                      className="w-full"
                      style={{
                        display: "block",
                        maxHeight: 400,
                        objectFit: "contain",
                        background: "black",
                      }}
                    />
                    {!cameraReady && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                      </div>
                    )}
                    <canvas ref={canvasRef} className="hidden" />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={capturePhoto} disabled={!cameraReady} className="flex-1 font-modern">
                      <Camera className="w-4 h-4 mr-2" />
                      Capture Photo
                    </Button>

                    <Button variant="outline" onClick={stopCamera} className="font-modern">
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>

                  <p className="text-xs text-center text-muted-foreground">
                    {cameraReady ? "Position the inscription clearly in frame" : "Initializing camera..."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="font-modern flex items-center">
                {result ? (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                    Results
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 mr-2 text-muted-foreground" />
                    Awaiting Image
                  </>
                )}
              </CardTitle>
            </CardHeader>

            <CardContent>
              {result ? (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-modern font-semibold text-foreground mb-2 flex items-center">
                      <span className="text-xl mr-2">📷</span>
                      Recognized Text:
                    </h4>
                    <p className="font-manuscript text-lg bg-card p-3 rounded border">{result.results.recognized}</p>
                  </div>

                  <div>
                    <h4 className="font-modern font-semibold text-foreground mb-2 flex items-center">
                      <span className="text-xl mr-2">🔤</span>
                      Brahmi Characters:
                    </h4>
                    <p className="font-manuscript text-lg bg-card p-3 rounded border">{result.results.brahmi_characters}</p>
                    <div className="mt-2 space-y-1 text-sm">
                      <p><span className="font-semibold text-muted-foreground">Confidence:</span> {result.results.brahmi_confidence}</p>
                      <p><span className="font-semibold text-muted-foreground">Explanation:</span> {result.results.brahmi_explanation}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-modern font-semibold text-foreground mb-2 flex items-center">
                      <span className="text-xl mr-2">🔄</span>
                      Transliterated (IAST):
                    </h4>
                    <p className="font-modern bg-card p-3 rounded border">{result.results.transliterated}</p>
                  </div>

                  <div>
                    <h4 className="font-modern font-semibold text-foreground mb-2 flex items-center">
                      <span className="text-xl mr-2">🌍</span>
                      English Translation:
                    </h4>
                    <p className="font-modern bg-card p-3 rounded border">{result.results.translated}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <FileImage className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="font-modern">Upload an image or use camera to see the translation results here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default OcrUploader;