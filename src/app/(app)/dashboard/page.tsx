"use client";

import { useState, useEffect, useRef } from "react";
import { BarChart, Clock, ScanLine, TrendingUp, Camera, CameraOff } from "lucide-react";
import Webcam from "react-webcam";
import { toast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function DashboardPage() {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const webcamRef = useRef<Webcam>(null);

  useEffect(() => {
    const getCameraPermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasCameraPermission(false);
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);
        if (webcamRef.current && webcamRef.current.video) {
           webcamRef.current.video.srcObject = stream;
        }
         // Clean up the stream when the component unmounts
        return () => {
          stream.getTracks().forEach(track => track.stop());
        };
      } catch (error) {
        console.error("Error accessing camera:", error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this app.',
        });
      }
    };

    getCameraPermission();
  }, []);


  const handleScan = () => {
    toast({
      title: "Attendance Marked!",
      description: "You've been successfully marked present for 'Advanced Mathematics'.",
    });
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Welcome Back, Jane!"
        description="Your academic snapshot for today."
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Attendance Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground">+2% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Next Class
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">11:00 AM</div>
            <p className="text-xs text-muted-foreground">Physics in Room 301</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Tasks
            </CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3/5 Today</div>
            <p className="text-xs text-muted-foreground">Keep up the good work!</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card className="bg-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Mark Your Attendance</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-4 text-center">
             <div className="relative w-full max-w-sm aspect-video bg-background rounded-lg shadow-inner overflow-hidden">
              {hasCameraPermission === null && (
                <div className="flex items-center justify-center h-full">
                  <p>Loading Camera...</p>
                </div>
              )}
              {hasCameraPermission === false && (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <CameraOff className="h-16 w-16 mb-4"/>
                   <Alert variant="destructive" className="items-center">
                    <AlertTitle>Camera Access Required</AlertTitle>
                    <AlertDescription>
                      Please allow camera access to use this feature.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
               {hasCameraPermission === true && (
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    className="w-full h-full object-cover"
                  />
               )}
            </div>
            <p className="text-muted-foreground max-w-sm">
              Scan the QR code in your classroom to automatically mark your attendance for the current period.
            </p>
            <Button size="lg" onClick={handleScan}>
              <Camera className="mr-2 h-5 w-5" />
              Simulate Scan
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
