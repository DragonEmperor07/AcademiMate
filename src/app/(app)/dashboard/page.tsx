"use client";

import { useState, useEffect, useRef } from "react";
import Link from 'next/link';
import { BarChart, Clock, ScanLine, TrendingUp, Camera, CameraOff, Calendar, Users } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { toast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { getStudentById, updateStudentStatus, getStudents, subscribe, Student } from "@/lib/student-data";
import { getNextClass, getCurrentClass, subscribe as subscribeToClasses, getClasses, Class } from "@/lib/class-data";

const videoConstraints = {
  facingMode: "environment",
};

// Mock data for weather
const weatherData = {
  temperature: 30,
  condition: "Partly Cloudy",
  icon: "☁️"
};

export default function DashboardPage() {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loggedInStudent, setLoggedInStudent] = useState<Student | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [allClasses, setAllClasses] = useState<Class[]>([]);
  const [nextClass, setNextClass] = useState<Class | undefined>(undefined);
  const [currentClass, setCurrentClass] = useState<Class | undefined>(undefined);
  const [isScanning, setIsScanning] = useState(false);
  const [studentAttendancePercentage, setStudentAttendancePercentage] = useState(0);
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerRegionId = "qr-scanner-region";

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString());
      setCurrentDate(now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const role = localStorage.getItem("loggedInUserRole");
    setUserRole(role);

    if (role === 'student') {
      const studentId = localStorage.getItem("loggedInUserId");
      if (studentId) {
        getStudentById(studentId).then(student => {
            if(student) setLoggedInStudent(student);
        });
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
          stream.getTracks().forEach(track => track.stop());
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
     const unsubscribeStudents = subscribe(async (allStudents) => {
        setStudents(allStudents);
        if (loggedInStudent) {
            const student = allStudents.find(s => s.id === loggedInStudent.id);
            if (student) setLoggedInStudent(student);
        }
    });

    const unsubscribeClasses = subscribeToClasses((all, current, next) => {
        setAllClasses(all);
        setCurrentClass(current);
        setNextClass(next);
    });

    return () => {
        unsubscribeStudents();
        unsubscribeClasses();
    };
  }, [loggedInStudent]);

  useEffect(() => {
    const completedClasses = allClasses.filter(c => c.status === 'Completed');
    if (completedClasses.length === 0 || !loggedInStudent?.attendedClasses) {
      setStudentAttendancePercentage(0);
      return;
    }
    
    const attendedCount = loggedInStudent.attendedClasses.filter(classId => 
      completedClasses.some(c => c.code === classId)
    ).length;
    
    const percentage = Math.round((attendedCount / completedClasses.length) * 100);
    setStudentAttendancePercentage(percentage);

  }, [loggedInStudent, allClasses]);

  const handleScanSuccess = (decodedText: string) => {
    if (loggedInStudent && currentClass) {
      const expectedQrCodeValue = `${currentClass.code}-2024-FALL`;
      if (decodedText === expectedQrCodeValue) {
        updateStudentStatus(loggedInStudent.id, "Present", currentClass.code);
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
            setIsScanning(false);
        });
    } else {
        setIsScanning(false);
    }
  };

  const getPageTitle = () => {
    if (userRole === 'staff') {
      return 'Welcome, Staff Member!';
    }
    if (loggedInStudent) {
      return `Hi ${loggedInStudent.name.split(' ')[0]}!`;
    }
    return 'Welcome Back!';
  }

  const completedClassesCount = allClasses.filter(c => c.status === 'Completed').length;
  const totalClassesCount = allClasses.length;

  return (
    <div className="space-y-6">
      {/* Header with Weather */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{getPageTitle()}</h1>
            <p className="text-muted-foreground">{currentDate}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              <span className="text-3xl">{weatherData.temperature}°C</span>
              <span className="text-2xl">{weatherData.icon}</span>
            </div>
            <p className="text-muted-foreground">{weatherData.condition}</p>
          </div>
        </div>
        
        <div className="mt-4">
          <Button variant="outline" className="w-full justify-between" asChild>
            <Link href="/classes">
              View Schedule
              <Calendar className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Essentials Section - Only Attendance */}
      <div>
        <h2 className="text-xl font-bold mb-4">ESSENTIALS</h2>
        <div className="grid gap-4 md:grid-cols-1">
          {/* Attendance Card */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendance</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{studentAttendancePercentage}%</div>
              <div className="mt-2">
                <Progress value={studentAttendancePercentage} className="h-2" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">As on Sep 21, 13:30 PM</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tools Section */}
      <div>
        <h2 className="text-xl font-bold mb-4">TOOLS</h2>
        
        {userRole === 'student' && (
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="font-headline text-xl flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Mark Your Attendance
              </CardTitle>
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
        )}

        {/* Additional Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentTime || "..."}</div>
              <p className="text-xs text-muted-foreground">Have a productive day!</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Class</CardTitle>
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
              <CardTitle className="text-sm font-medium">Completed Classes</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedClassesCount}/{totalClassesCount} Today</div>
              <p className="text-xs text-muted-foreground">Keep up the good work!</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
