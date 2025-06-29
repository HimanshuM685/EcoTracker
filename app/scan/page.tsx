"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Scan, Search, Leaf, AlertTriangle, CheckCircle, Camera } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import BarcodeScanner from "@/components/barcode-scanner"
import RewardsNotification, { useRewardsNotification } from "@/components/rewards-notification"


interface ProductData {
  barcode: string
  product: string
  co2_emission: number
  category?: string
  confidence?: 'high' | 'medium' | 'low'
  calculation?: string
  brand?: string
  description?: string
  sustainabilityScore?: string
  image?: string
  transportDistance?: string
  packaging?: string
  certifications?: string[]
}


export default function ScanPage() {
  const [barcode, setBarcode] = useState("")
  const [product, setProduct] = useState<ProductData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isScanning, setIsScanning] = useState(false)

  const [scanLock, setScanLock] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const { updateUserStats, user } = useAuth()
  const { toast } = useToast()
  const { notification, showNotification, dismissNotification } = useRewardsNotification()

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Use back camera if available
      })
      setStream(mediaStream)
      setIsScanning(true)
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
    setIsScanning(false)
  }

  const handleScan = async (scanned?: string) => {
  if (scanLock) return;
  setScanLock(true);

  const actualBarcode = (scanned || barcode).trim();

  if (!actualBarcode) {
    toast({
      title: "Please enter a barcode",
      description: "Enter a valid barcode to scan the product.",
      variant: "destructive",
    });
    setScanLock(false);
    return;
  }

  setIsLoading(true);

  try {
    const res = await fetch("/api/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ barcode: actualBarcode, userEmail: user?.email }),
    });

    const data = await res.json();

    if (!res.ok || data.error || !data.productName) {
      throw new Error("Product not found in API");
    }

    setProduct({
      barcode: actualBarcode,
      product: data.productName,
      brand: data.brand || "Unknown",
      category: data.category || "Unknown",
      co2_emission: parseFloat(data.carbonEstimate),
      confidence: data.confidence,
      calculation: data.calculation,
      sustainabilityScore: "B",
      description: `${data.calculation || "Calculated using scientific data"}`,
      image: "/placeholder.svg",
      certifications: [],
      packaging: "Unknown",
      transportDistance: "Unknown",
    });

    toast({
      title: "Product found!",
      description: `Carbon impact: ${data.carbonEstimate}kg CO₂ (${data.confidence} confidence)`,
    });

    // Show reward notifications if rewards were earned
    if (data.rewards) {
      const { pointsEarned, pointsType, leveledUp, newAchievements } = data.rewards;
      
      if (pointsEarned && pointsEarned > 0) {
        showNotification({
          type: 'points',
          message: `Great job! You earned ${pointsEarned} reward points for scanning this product.`,
          points: pointsEarned,
          pointsType: pointsType
        });
      }

      if (leveledUp) {
        setTimeout(() => {
          showNotification({
            type: 'level_up',
            message: `Congratulations! You've reached level ${data.rewards.level}!`,
            level: data.rewards.level
          });
        }, 2000);
      }

      if (newAchievements && newAchievements.length > 0) {
        newAchievements.forEach((achievement: any, index: number) => {
          setTimeout(() => {
            showNotification({
              type: 'achievement',
              message: `Achievement unlocked: ${achievement.name}!`,
              points: achievement.points
            });
          }, 3000 + (index * 1500));
        });
      }
    }

    updateUserStats?.(parseFloat(data.carbonEstimate));
  } catch (err) {
    console.warn("API failed, trying fallback JSON...");

    try {
      // Step 3: Fallback to local barcode-data.json
      const res = await fetch("/barcode-data.json");
      const data: ProductData[] = await res.json();
      const matched = data.find((item) => item.barcode === actualBarcode);

      if (matched) {
        setProduct({
          ...matched,
          image: matched.image || "/placeholder.svg",
          sustainabilityScore: matched.sustainabilityScore || "Unknown",
          brand: matched.brand || "N/A",
          category: matched.category || "N/A",
          transportDistance: matched.transportDistance || "N/A",
          packaging: matched.packaging || "N/A",
          certifications: matched.certifications || [],
          description: matched.description || "No description available.",
        });

        updateUserStats?.(matched.co2_emission);

        toast({
          title: matched.product,
          description: `CO₂ Emission: ${matched.co2_emission} kg added to your tracking.`,
        });
      } else {
        throw new Error("Barcode not found in fallback JSON");
      }
    } catch (err) {
      console.error("Fallback failed:", err);
      toast({
        title: "Error",
        description: "Could not find product in API or local data.",
        variant: "destructive",
      });

      setProduct(null);
    }
  } finally {
    setIsLoading(false);
    setScanLock(false);
  }
};


  const getSustainabilityColor = (score: string) => {
    switch (score) {
      case "A":
        return "bg-green-100 text-green-800 border-green-200"
      case "B+":
      case "B":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "C":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "D":
      case "F":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getCarbonImpact = (footprint: number) => {
    if (footprint < 1) return { level: "Low", icon: CheckCircle, color: "text-green-600" }
    if (footprint < 5) return { level: "Medium", icon: AlertTriangle, color: "text-yellow-600" }
    return { level: "High", icon: AlertTriangle, color: "text-red-600" }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Scan Product</h1>
          <p className="text-gray-400 mt-2">
            Enter or scan a barcode to check the carbon footprint and sustainability score.
          </p>
        </div>

        <Card className="dark-card border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Scan className="h-5 w-5" />
              Product Scanner
            </CardTitle>
            <CardDescription className="text-gray-400">
              Enter a barcode manually, use your camera to scan, or try the demo barcodes below
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="barcode">Barcode</Label>
              <div className="flex gap-2">
                <Input
                  id="barcode"
                  placeholder="Enter barcode (try: 123456789012, 987654321098, 456789123456)"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !scanLock) handleScan()
                  }}
                />
                <Button onClick={() => setIsScanning(true)} variant="outline">
                  <Camera className="h-4 w-4" />
                </Button>
                <Button onClick={() => handleScan()} disabled={isLoading}>
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="text-sm text-gray-400">
              <p>
                <strong className="text-gray-300">Try these sample barcodes:</strong>
              </p>
              <ul className="mt-1 space-y-1 text-gray-500">
                <li>• 123456789012 (Organic Bananas - Low impact)</li>
                <li>• 987654321098 (Beef Patties - High impact)</li>
                <li>• 456789123456 (Almond Milk - Medium impact)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {product && (
          <Card className="dark-card border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-white">
                <span>{product.product}</span>
                <div className="flex gap-2">
                  <Badge className={`${getSustainabilityColor(product.sustainabilityScore!)} border`}>
                    Score: {product.sustainabilityScore}
                  </Badge>
                  {product.confidence && (
                    <Badge variant="outline" className={
                      product.confidence === 'high' ? 'border-green-500 text-green-400' :
                      product.confidence === 'medium' ? 'border-yellow-500 text-yellow-400' :
                      'border-red-500 text-red-400'
                    }>
                      {product.confidence} confidence
                    </Badge>
                  )}
                </div>
              </CardTitle>
              <CardDescription>
                {product.brand} • {product.category}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  {/* <img
                    // src={product.image}
                    alt={product.product}
                    className="w-full h-48 object-cover rounded-lg bg-gray-100"
                  /> */}
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Carbon Footprint</h3>
                    <div className="flex items-center gap-2">
                      {(() => {
                        const impact = getCarbonImpact(product.co2_emission)
                        return (
                          <>
                            <impact.icon className={`h-5 w-5 ${impact.color}`} />
                            <span className="text-2xl font-bold">{product.co2_emission} kg CO₂</span>
                            <Badge variant="outline" className={impact.color}>
                              {impact.level} Impact
                            </Badge>
                          </>
                        )
                      })()}
                    </div>
                    {product.calculation && (
                      <p className="text-sm text-gray-400 mt-2">
                        Calculation: {product.calculation}
                      </p>
                    )}
                  </div>

                  <Separator />

                  {/* <div>
                    <h4 className="font-medium mb-2 text-gray-300">Sustainability Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"> 
                        <span className="text-gray-400">Transport Distance:</span>
                        <span className="text-gray-300">{product.transportDistance}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Packaging:</span>
                        <span className="text-gray-300">{product.packaging}</span>
                      </div>
                     </div>
                  </div> */}

                  {product.certifications && product.certifications.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2 text-gray-300">Certifications</h4>
                      <div className="flex flex-wrap gap-2">
                        {product.certifications.map((cert: string) => (
                          <Badge key={cert} variant="secondary" className="bg-green-100 text-green-800">
                            <Leaf className="h-3 w-3 mr-1" />
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2 text-gray-300">Description</h4>
                <p className="text-gray-400">{product.description}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {isScanning && (
          <BarcodeScanner
            onScan={(scannedBarcode) => {

              if (!scanLock) {
                setBarcode(scannedBarcode)
                setIsScanning(false)
                handleScan()
              }
              setBarcode(scannedBarcode)
              setIsScanning(false)
              handleScan(scannedBarcode)

            }}
            onClose={() => setIsScanning(false)}
          />
        )}
      </div>
      
      {/* Rewards Notification */}
      <RewardsNotification 
        notification={notification}
        onDismiss={dismissNotification}
      />
    </DashboardLayout>
  )
}

