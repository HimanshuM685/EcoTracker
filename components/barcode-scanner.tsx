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
        body: JSON.stringify({ 
          barcode,
          userEmail: user?.email // Include user email for database tracking
        }),
      });

      const data = await scanRes.json();
      if (data.error) {
        toast({ title: "Product not found", variant: "destructive" });
        return;
      }

      // Send to user score API (keeping for backward compatibility)
      const userScoreRes = await fetch("/api/user/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user?.email,
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
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
      <Card className="w-full max-w-md mx-4 dark-card border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Scan Barcode</CardTitle>
              <CardDescription className="text-gray-400">Position the barcode within the frame</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <video ref={videoRef} className="w-full h-64 bg-black rounded-lg object-cover" autoPlay playsInline muted />

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-48 h-24 border-2 border-green-400 rounded-lg">
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-green-400 rounded-tl-lg"></div>
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-green-400 rounded-tr-lg"></div>
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-green-400 rounded-bl-lg"></div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-green-400 rounded-br-lg"></div>
                <div className="absolute inset-0 overflow-hidden rounded-lg">
                  <div className="absolute w-full h-0.5 bg-green-400 animate-pulse"></div>
                </div>
              </div>
            </div>

            <div className="absolute top-2 right-2 flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={toggleFlash}
                className={`${isFlashOn ? "bg-yellow-600" : "bg-gray-700"}`}
              >
                <Flashlight className="h-4 w-4" />
              </Button>
              <Button variant="secondary" size="sm" onClick={switchCamera} className="bg-gray-700">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="text-center space-y-4">
            <p className="text-sm text-gray-400">
              Align the barcode within the green frame and it will be scanned automatically
            </p>

            <div className="flex gap-2">
              <Button onClick={simulateScan} className="flex-1">
                <Camera className="mr-2 h-4 w-4" />
                Scan Now
              </Button>
              <Button onClick={enterBarcodeManually} variant="outline" className="flex-1">
                Enter Manually
              </Button>
            </div>

            <Button variant="ghost" onClick={onClose} className="w-full">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

