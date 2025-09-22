"use client";

import { useState, useEffect, useRef } from "react";
import { BarChart, Clock, ScanLine, TrendingUp, Camera, CameraOff } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { toast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getStudentById, updateStudentStatus, getStudents, subscribe } from "@/lib/student-data";
import { getNextClass, getCurrentClass, subscribe as subscribeToClasses, getClasses, Class } from "@/lib/class-data";

const videoConstraints = {
  facingMode: "environment",
};

export default function DashboardPage() {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loggedInStudent, setLoggedInStudent] = useState<any>(null);
  const [students, setStudents] = useState(getStudents());
  const [currentTime, setCurrentTime] = useState("");
  const [allClasses, setAllClasses] = useState<Class[]>(getClasses());
  const [nextClass, setNextClass] = useState(getNextClass());
  const [currentClass, setCurrentClass] = useState(getCurrentClass());
  const [isScanning, setIsScanning] = useState(false);
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerRegionId = "qr-scanner-region";

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const role = localStorage.getItem("loggedInUserRole");
    setUserRole(role);

    if (role === 'student') {
      const studentId = localStorage.getItem("loggedInUserId");
      if (studentId) {
        const student = getStudentById(studentId);
        setLoggedInStudent(student);
      }
    }
    
    if (role === 'student') {
      const getCameraPermission = async () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.error("Camera not supported on this browser.");
            setHasCameraPermission(false);
            return;
        }
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          stream.getTracks().forEach(track => track.stop()); // Stop stream immediately, we'll start it with the scanner
          setHasCameraPermission(true);
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
    }

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(err => console.error("Failed to stop scanner on unmount", err));
      }
    };
  }, []);

  useEffect(() => {
     const unsubscribe = subscribe(() => {
        setStudents([...getStudents()]);
        if (loggedInStudent) {
            const student = getStudentById(loggedInStudent.id);
            setLoggedInStudent(student);
        }
    });

    const unsubscribeClasses = subscribeToClasses(() => {
        setAllClasses([...getClasses()]);
        setNextClass(getNextClass());
        setCurrentClass(getCurrentClass());
    });

    return () => {
        unsubscribe();
        unsubscribeClasses();
    };
  }, [loggedInStudent]);

  const handleScanSuccess = (decodedText: string) => {
    if (loggedInStudent && currentClass) {
      const expectedQrCodeValue = `${currentClass.code}-2024-FALL`;
      if (decodedText === expectedQrCodeValue) {
        updateStudentStatus(loggedInStudent.id, "Present");
        toast({
          title: "Attendance Marked!",
          description: `You've been successfully marked present for '${currentClass.subject}'.`,
        });
        stopScan();
      } else {
        toast({
          variant: "destructive",
          title: "Incorrect QR Code",
          description: "Please scan the QR code for the correct class.",
        });
      }
    } else {
        toast({
            variant: "destructive",
            title: "Scan Failed",
            description: "No class is currently in progress to mark attendance for.",
        });
    }
  };

  const handleScanError = (errorMessage: string) => {
    // console.log(`QR Code no longer in front of camera.`);
  };

  const startScan = () => {
    if (hasCameraPermission && !isScanning) {
      const html5QrcodeScanner = new Html5Qrcode(scannerRegionId);
      scannerRef.current = html5QrcodeScanner;
      setIsScanning(true);
      html5QrcodeScanner.start(
        { facingMode: "environment" },
        { 
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        handleScanSuccess,
        handleScanError
      ).catch(err => {
        console.error("Unable to start scanning.", err);
        setIsScanning(false);
        toast({
            variant: "destructive",
            title: "Scanner Error",
            description: "Could not start the QR code scanner.",
        });
      });
    }
  };

  const stopScan = () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop()
        .then(() => {
            setIsScanning(false);
        })
        .catch(err => {
            console.error("Failed to stop the scanner.", err);
            setIsScanning(false); // Force state change even on error
        });
    } else {
        setIsScanning(false);
    }
  };

  const attendancePercentage = () => {
    if (students.length === 0) return 0;
    const presentCount = students.filter(s => s.status === 'Present').length;
    return Math.round((presentCount / students.length) * 100);
  }

  const getPageTitle = () => {
    if (userRole === 'staff') {
      return 'Welcome, Staff Member!';
    }
    if (loggedInStudent) {
      return `Welcome Back, ${loggedInStudent.name.split(' ')[0]}!`;
    }
    return 'Welcome Back!';
  }

  const completedClassesCount = allClasses.filter(c => c.status === 'Completed').length;
  const totalClassesCount = allClasses.length;

  return (
    <div className="space-y-8">
      <PageHeader
        title={getPageTitle()}
        description="Your academic snapshot for today."
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Class Attendance Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendancePercentage()}%</div>
            <p className="text-xs text-muted-foreground">
              {userRole === 'student' && (loggedInStudent?.status === 'Present' ? 'You are marked present' : 'You are marked absent')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Current Time
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentTime || "..."}</div>
            <p className="text-xs text-muted-foreground">Have a productive day!</p>
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
             <div className="text-2xl font-bold">{nextClass?.time.split(' - ')[0] || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">
                {nextClass ? `${nextClass.subject} in Room ${nextClass.room}` : 'No upcoming classes'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Classes
            </CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedClassesCount}/{totalClassesCount} Today</div>
            <p className="text-xs text-muted-foreground">Keep up the good work!</p>
          </CardContent>
        </Card>
      </div>

      {userRole === 'student' && (
        <div>
          <Card className="bg-primary/10 border-primary/20">
            <CardHeader>
              <CardTitle className="font-headline text-xl">Mark Your Attendance</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center space-y-4 text-center">
               <div className="relative w-full max-w-sm aspect-video bg-background rounded-lg shadow-inner overflow-hidden">
                <div id={scannerRegionId} className="w-full h-full" />
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
                {hasCameraPermission !== false && !isScanning && (
                   <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80">
                     <Camera className="h-16 w-16 mb-4 text-muted-foreground"/>
                     <p className="text-muted-foreground">Camera is ready</p>
                   </div>
                )}
              </div>
              <p className="text-muted-foreground max-w-sm">
                Scan the QR code in your classroom to automatically mark your attendance for the current period.
              </p>
               {isScanning ? (
                <Button size="lg" onClick={stopScan} variant="destructive">
                  <ScanLine className="mr-2 h-5 w-5" />
                  Stop Scanning
                </Button>
               ) : (
                <Button size="lg" onClick={startScan} disabled={!hasCameraPermission || loggedInStudent?.status === 'Present'}>
                  <Camera className="mr-2 h-5 w-5" />
                  {loggedInStudent?.status === 'Present' ? 'Attendance Marked' : 'Start Scan'}
                </Button>
               )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
