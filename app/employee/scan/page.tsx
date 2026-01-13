"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BrowserQRCodeReader } from "@zxing/browser";

import { config } from "@/config";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

export default function EmployeeScanPage() {
  const { user } = useAuth();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [code, setCode] = useState(config.officeQrCode);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const scanningRef = useRef(false);

  useEffect(() => {
    let reader: BrowserQRCodeReader | null = null;
    const startCamera = async () => {
      try {
        reader = new BrowserQRCodeReader();
        const devices = await BrowserQRCodeReader.listVideoInputDevices();
        if (!devices.length) {
          setCameraError("No camera detected. Use manual entry instead.");
          return;
        }
        if (!videoRef.current) return;
        setCameraReady(true);
        await reader.decodeFromVideoDevice(
          devices[0].deviceId,
          videoRef.current,
          (result) => {
            if (result) {
              handleScan(result.getText());
            }
          }
        );
      } catch (err) {
        setCameraError("Camera access denied. Use manual entry instead.");
      }
    };
    startCamera();
    return () => {
      reader?.reset();
    };
  }, []);

  const handleScan = async (value: string) => {
    if (!user) return;
    if (scanningRef.current) return;
    scanningRef.current = true;
    setScanning(true);
    try {
      await api.scanQr(user.id, value.trim());
      toast.success("Scan recorded successfully.");
      router.push("/employee");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to record scan.");
    } finally {
      setScanning(false);
      scanningRef.current = false;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Scan office QR</CardTitle>
          <CardDescription>Use your camera to check in or check out.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
            <div className="space-y-3">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-900/5 dark:border-slate-800">
                {!cameraReady && !cameraError && <Skeleton className="h-64 w-full" />}
                <video ref={videoRef} className="h-64 w-full object-cover" />
              </div>
              {cameraError && (
                <p className="text-sm text-rose-500">{cameraError}</p>
              )}
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="manual">Manual code</Label>
                <Input
                  id="manual"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                />
              </div>
              <Button
                className="w-full"
                onClick={() => handleScan(code)}
                disabled={scanning}
              >
                {scanning ? "Recording..." : "Submit code"}
              </Button>
              <Button variant="outline" className="w-full" onClick={() => router.push("/employee")}
              >
                Back to dashboard
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
