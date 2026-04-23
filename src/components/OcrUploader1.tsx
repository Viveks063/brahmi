import { useState, useCallback, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileImage, Loader2, CheckCircle, AlertCircle, Camera, X } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

const OcrUploader = () => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState(null);
  const { toast } = useToast();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      handleFile(droppedFile);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleFile = (selectedFile) => {
    setFile(selectedFile);
    setResult(null);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleFileInput = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFile(selectedFile);
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      
      setStream(mediaStream);
      setShowCamera(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      toast({
        title: "Camera ready",
        description: "Position the inscription in the frame and capture",
      });
    } catch (error) {
      console.error('Camera error:', error);
      toast({
        title: "Camera access denied",
        description: "Please allow camera permissions to use this feature",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const capturedFile = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
            handleFile(capturedFile);
            stopCamera();
          }
        }, 'image/jpeg', 0.95);
      }
    }
  };

  const processImage = async () => {
    if (!file) return;

    setProcessing(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('http://localhost:8000/process-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Processing failed');

      const data = await response.json();
      setResult(data);
      toast({
        title: "Success!",
        description: "Image processed successfully",
      });
    } catch (error) {
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <section id="translator" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-serif text-4xl font-bold text-primary mb-4">
            Upload & Translate
          </h2>
          <p className="font-sans text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload an image or use your camera to capture Ancient Brahmi script and get instant recognition, 
            transliteration, and translation.
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Upload Section */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="font-sans flex items-center">
                <Upload className="w-5 h-5 mr-2" />
                Upload or Capture Image
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!showCamera ? (
                <>
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      dragActive 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    {preview ? (
                      <div className="space-y-4">
                        <img 
                          src={preview} 
                          alt="Preview" 
                          className="max-h-48 mx-auto rounded-lg shadow-lg"
                        />
                        <p className="font-sans text-sm text-muted-foreground">
                          {file?.name}
                        </p>
                      </div>
                    ) : (
                      <>
                        <FileImage className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="font-sans text-lg mb-2">
                          Drop your Brahmi script image here
                        </p>
                        <p className="font-sans text-sm text-muted-foreground mb-4">
                          or use the options below
                        </p>
                      </>
                    )}
                    
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileInput}
                      className="hidden"
                      id="file-upload"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <label htmlFor="file-upload">
                      <Button variant="outline" className="font-sans cursor-pointer w-full">
                        <Upload className="w-4 h-4 mr-2" />
                        Choose File
                      </Button>
                    </label>
                    
                    <Button 
                      variant="outline"
                      onClick={startCamera}
                      className="font-sans w-full"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Use Camera
                    </Button>
                  </div>

                  <Button 
                    onClick={processImage}
                    disabled={!file || processing}
                    className="w-full font-sans"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Process Image'
                    )}
                  </Button>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="relative bg-black rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-auto"
                    />
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={capturePhoto}
                      className="flex-1 font-sans"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Capture Photo
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={stopCamera}
                      className="font-sans"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                  
                  <p className="text-xs text-center text-muted-foreground">
                    Position the inscription clearly in frame and tap capture
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="font-sans flex items-center">
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
                  {/* Stage 1: Recognized Text */}
                  <div>
                    <h4 className="font-sans font-semibold text-foreground mb-2 flex items-center">
                      <span className="text-xl mr-2">📷</span>
                      Stage 1 - Recognized Text:
                    </h4>
                    <p className="font-serif text-lg bg-card p-3 rounded border">
                      {result.results.recognized || "N/A"}
                    </p>
                  </div>

                  {/* Stage 2: Brahmi Characters */}
                  <div>
                    <h4 className="font-sans font-semibold text-foreground mb-2 flex items-center">
                      <span className="text-xl mr-2">🔤</span>
                      Stage 2 - Brahmi Characters:
                    </h4>
                    <p className="font-serif text-lg bg-card p-3 rounded border">
                      {result.results.brahmi_characters || "N/A"}
                    </p>
                    <div className="mt-2 flex gap-4 text-sm">
                      <div>
                        <span className="font-sans font-semibold text-muted-foreground">Confidence:</span>
                        <p className="text-foreground capitalize">{result.results.brahmi_confidence || "N/A"}</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="font-sans font-semibold text-muted-foreground text-sm">Explanation:</span>
                      <p className="text-sm text-foreground">{result.results.brahmi_explanation || "N/A"}</p>
                    </div>
                  </div>
                  
                  {/* Stage 3: Transliterated */}
                  <div>
                    <h4 className="font-sans font-semibold text-foreground mb-2 flex items-center">
                      <span className="text-xl mr-2">🔄</span>
                      Stage 3 - Transliterated (IAST):
                    </h4>
                    <p className="font-sans bg-card p-3 rounded border">
                      {result.results.transliterated || "N/A"}
                    </p>
                  </div>
                  
                  {/* Stage 4: Translation */}
                  <div>
                    <h4 className="font-sans font-semibold text-foreground mb-2 flex items-center">
                      <span className="text-xl mr-2">🌍</span>
                      Stage 4 - English Translation:
                    </h4>
                    <p className="font-sans bg-card p-3 rounded border">
                      {result.results.translated || "N/A"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <FileImage className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="font-sans">
                    Upload an image or use camera to see the translation results here
                  </p>
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