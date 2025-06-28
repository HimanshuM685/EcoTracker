"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, X, Flashlight, RotateCcw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import { BrowserMultiFormatReader } from "@zxing/browser"

interface BarcodeScannerProps {
  onScan: (barcode: string) => void
  onClose: () => void
}

export default function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isFlashOn, setIsFlashOn] = useState(false)
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment")
  const videoRef = useRef<HTMLVideoElement>(null)
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, [facingMode])

  useEffect(() => {
    const interval = setInterval(() => {
      simulateScan()
    }, 3000)

    return () => clearInterval(interval)
  }, [stream])

  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      setStream(mediaStream)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.play()
      }
    } catch (error) {
      toast({
        title: "Camera access denied",
        description: "Please allow camera access to scan barcodes.",
        variant: "destructive",
      })
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
  }

  const toggleFlash = async () => {
    if (stream) {
      const track = stream.getVideoTracks()[0]
      const capabilities = track.getCapabilities() as any

      if (capabilities.torch) {
        try {
          await track.applyConstraints({
            advanced: [{ torch: !isFlashOn } as any],
          })
          setIsFlashOn(!isFlashOn)
        } catch (error) {
          toast({
            title: "Flash not available",
            description: "Your device doesn't support camera flash.",
            variant: "destructive",
          })
        }
      }
    }
  }

  const switchCamera = () => {
    setFacingMode(facingMode === "user" ? "environment" : "user")
  }


  // INSIDE barcode-scanner.tsx

  const handleScan = async (barcode: string) => {
    try {
      const scanRes = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ barcode }),
      });

      const data = await scanRes.json();
      if (data.error) {
        toast({ title: "Product not found", variant: "destructive" });
        return;
      }

      // Send to user score API
      const userScoreRes = await fetch("/api/user/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user?.email, // later replace with real user
          productName: data.productName,
          carbonEstimate: data.carbonEstimate,
        }),
      });

      const scoreData = await userScoreRes.json();
      toast({
        title: `Carbon Estimate: ${data.carbonEstimate} kg`,
        description: `Your total score: ${scoreData.newScore} kg`,
      });
    } catch (err) {
      toast({
        title: "API Error",
        description: "Something went wrong while fetching data.",
        variant: "destructive",
      });
    }
  };


  const codeReader = new BrowserMultiFormatReader()

  const simulateScan = async () => {
    if (videoRef.current) {
      try {
        const result = await codeReader.decodeOnceFromVideoElement(videoRef.current)
        if (result && result.getText()) {
          const barcode = result.getText()
          onScan(barcode)
          toast({
            title: "Barcode detected!",
            description: `Scanned barcode: ${barcode}`,
          })
        }
      } catch (error) {
        if ((error as any)?.name === "NotFoundException") {
          // No barcode found – don't toast every time to avoid spam
        } else {
          toast({
            title: "Scanning failed",
            description: (error as Error).message,
            variant: "destructive",
          })
        }
      }
    }
  }

  const enterBarcodeManually = () => {
    const input = prompt("Enter barcode manually:")
    if (input) {
      onScan(input)
      toast({
        title: "Manual barcode entered",
        description: `Scanned barcode: ${input}`,
      })
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center p-4">
      {/* Glossy overlay effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900/50 to-black"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/[0.02] to-transparent"></div>

      {/* Main scanner container */}
      <div className="relative w-full max-w-md">
        {/* Glossy card background */}
        <div className="relative bg-black/95 backdrop-blur-xl border border-white/15 rounded-2xl overflow-hidden shadow-2xl shine-effect">
          {/* Enhanced glossy highlights */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
          <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-white/8 to-transparent"></div>
          <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent"></div>

          {/* Header */}
          <div className="relative p-6 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white/90 tracking-tight">Scan Barcode</h2>
                <p className="text-sm text-white/60 mt-1">Position the barcode within the frame</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Video container */}
          <div className="relative mx-6 mb-4">
            <div className="relative rounded-xl overflow-hidden bg-black border border-white/20 shadow-inner">
              <video
                ref={videoRef}
                className="w-full h-64 bg-gradient-to-br from-gray-900 to-black object-cover"
                autoPlay
                playsInline
                muted
              />

              {/* Enhanced glossy video overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/10 pointer-events-none"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5 pointer-events-none"></div>

              {/* Enhanced scanning frame */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-48 h-24">
                  {/* Main scanning border with enhanced glow */}
                  <div className="absolute inset-0 border-2 border-emerald-400/90 rounded-lg shadow-lg shadow-emerald-400/30 pulse-glow">
                    {/* Enhanced animated scanning line */}
                    <div className="absolute inset-0 overflow-hidden rounded-lg">
                      <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-emerald-300 to-transparent scan-line shadow-lg shadow-emerald-400/50"></div>
                    </div>
                  </div>

                  {/* Enhanced corner accents with inner glow */}
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-t-3 border-l-3 border-emerald-400 rounded-tl-lg shadow-sm shadow-emerald-400/40 bg-gradient-to-br from-emerald-400/10 to-transparent"></div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-t-3 border-r-3 border-emerald-400 rounded-tr-lg shadow-sm shadow-emerald-400/40 bg-gradient-to-bl from-emerald-400/10 to-transparent"></div>
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-3 border-l-3 border-emerald-400 rounded-bl-lg shadow-sm shadow-emerald-400/40 bg-gradient-to-tr from-emerald-400/10 to-transparent"></div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-3 border-r-3 border-emerald-400 rounded-br-lg shadow-sm shadow-emerald-400/40 bg-gradient-to-tl from-emerald-400/10 to-transparent"></div>
                </div>
              </div>

              {/* Control buttons */}
              <div className="absolute top-3 right-3 flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={toggleFlash}
                  className={`${isFlashOn
                      ? "bg-yellow-500/20 border-yellow-400/30 text-yellow-300 shadow-lg shadow-yellow-500/20"
                      : "bg-black/40 border-white/20 text-white/70 hover:bg-white/10"
                    } backdrop-blur-sm rounded-lg border transition-all duration-200`}
                >
                  <Flashlight className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={switchCamera}
                  className="bg-black/40 border-white/20 text-white/70 hover:bg-white/10 backdrop-blur-sm rounded-lg border transition-all duration-200"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Instructions and buttons */}
          <div className="px-6 pb-6 space-y-4">
            <p className="text-sm text-white/60 text-center leading-relaxed">
              Align the barcode within the green frame and it will be scanned automatically
            </p>

            <div className="flex gap-3">
              <Button
                onClick={simulateScan}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-lg shadow-emerald-500/30 border-0 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-500/40 btn-glossy"
              >
                <Camera className="mr-2 h-4 w-4" />
                Scan Now
              </Button>
              <Button
                onClick={enterBarcodeManually}
                variant="outline"
                className="flex-1 bg-black/50 border-white/30 text-white/90 hover:bg-white/10 hover:text-white hover:border-white/40 backdrop-blur-sm rounded-xl transition-all duration-300 hover:scale-[1.02] btn-glossy"
              >
                Enter Manually
              </Button>
            </div>

            <Button
              variant="ghost"
              onClick={onClose}
              className="w-full text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 btn-glossy"
            >
              Cancel
            </Button>
          </div>

          {/* Bottom glossy highlight */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white/5 to-transparent"></div>
        </div>

        {/* Enhanced outer glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/15 via-transparent to-emerald-600/15 rounded-2xl blur-2xl -z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-white/5 rounded-2xl blur-xl -z-10"></div>
      </div>
    </div>
  )
}

