"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BrowserQRCodeReader } from "@zxing/browser";

import { config } from "@/config";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  const [cameraStarting, setCameraStarting] = useState(false);
  const scanningRef = useRef(false);
  const readerRef = useRef<BrowserQRCodeReader | null>(null);

  useEffect(() => {
    return () => {
      readerRef.current?.reset();
      readerRef.current = null;
    };
  }, []);

  const startCamera = async () => {
    if (cameraStarting || cameraReady) return;
    setCameraStarting(true);
    setCameraError(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError("Camera access is not supported in this browser.");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      stream.getTracks().forEach((track) => track.stop());
      const reader = new BrowserQRCodeReader();
      readerRef.current = reader;
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
      setCameraReady(false);
    } finally {
      setCameraStarting(false);
    }
  };

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
      <Card className="border-slate-200/70 shadow-sm dark:border-slate-800">
        <CardContent className="space-y-6 p-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-300">
            Hold your camera steady over the office QR code. If the camera is unavailable, enter the
            code manually below.
          </div>
          <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
            <div className="space-y-3">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-900/5 dark:border-slate-800">
                {!cameraReady && !cameraError && <Skeleton className="h-64 w-full" />}
                <video ref={videoRef} className="h-64 w-full object-cover" />
              </div>
              {!cameraReady && !cameraError && (
                <Button className="w-full" onClick={startCamera} disabled={cameraStarting}>
                  {cameraStarting ? "Requesting access..." : "Enable camera"}
                </Button>
              )}
              {cameraError && <p className="text-sm text-rose-500">{cameraError}</p>}
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
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push("/employee")}
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
