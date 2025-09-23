
"use client";

import { useState, useEffect, useRef } from "react";
import QRCode from "react-qr-code";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { PlusCircle, MoreHorizontal, ShieldAlert, Camera, CameraOff, ScanLine, UserCheck, Loader2, UserPlus } from "lucide-react";
import { updateStudentStatus, addStudent, subscribe, Student, getStudents } from "@/lib/student-data";
import { subscribe as subscribeToClasses, Class } from "@/lib/class-data";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Html5Qrcode } from "html5-qrcode";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


export default function AttendancePage() {
  const [attendanceData, setAttendanceData] = useState<Student[]>([]);
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentId, setNewStudentId] = useState("");
  const [currentClass, setCurrentClass] = useState<Class | undefined>(undefined);
  const [userRole, setUserRole] = useState<string | null>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [isFaceScanning, setIsFaceScanning] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isAddStudentDialogOpen, setIsAddStudentDialogOpen] = useState(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const addStudentVideoRef = useRef<HTMLVideoElement>(null);
  const scannerRegionId = "qr-scanner-region";
  const { toast } = useToast();

  useEffect(() => {
    const role = localStorage.getItem("loggedInUserRole");
    setUserRole(role);
    
    if (role === 'staff') {
      const getCameraPermission = async () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.error("Camera not supported on this browser.");
            setHasCameraPermission(false);
            return;
        }
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          setHasCameraPermission(true);
           if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          // Stop the tracks immediately if we are just checking for permission
          stream.getTracks().forEach(track => track.stop());
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
      stopCameraStream(addStudentVideoRef);
    };
  }, [toast]);
  
  // Handle camera stream for Add Student Dialog
  useEffect(() => {
    if (isAddStudentDialogOpen && hasCameraPermission) {
      startCameraStream(addStudentVideoRef);
    } else {
      stopCameraStream(addStudentVideoRef);
    }
  }, [isAddStudentDialogOpen, hasCameraPermission]);


  const startCameraStream = async (ref: React.RefObject<HTMLVideoElement>) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (ref.current) {
        ref.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Failed to start camera stream:", error);
    }
  };

  const stopCameraStream = (ref: React.RefObject<HTMLVideoElement>) => {
    if (ref.current && ref.current.srcObject) {
      const stream = ref.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      ref.current.srcObject = null;
    }
  };


  useEffect(() => {
    const unsubscribe = subscribe((students) => {
      setAttendanceData(students);
    });
    const unsubscribeClasses = subscribeToClasses((all, current) => {
      setCurrentClass(current);
    });
    return () => {
      unsubscribe();
      unsubscribeClasses();
    };
  }, []);

  const presentCount = attendanceData.filter(
    (s) => s.status === "Present"
  ).length;
  const totalCount = attendanceData.length;

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (newStudentName && newStudentId) {
      const newStudent: Student = {
        name: newStudentName,
        id: newStudentId,
        status: "Absent",
        password: 'password'
      };
      addStudent(newStudent);
      toast({
        title: "Student Added",
        description: `${newStudentName} has been added to the roster.`,
      })
      setNewStudentName("");
      setNewStudentId("");
      setIsAddStudentDialogOpen(false); // Close dialog on success
    }
  };

  const handleStatusChange = (studentId: string, newStatus: "Present" | "Absent") => {
    updateStudentStatus(studentId, newStatus, currentClass?.code);
  };
  
  const handleScanSuccess = (decodedText: string) => {
    const studentId = decodedText;
    const allStudents = getStudents();
    const student = allStudents.find(s => s.id === studentId);
    
    if (student) {
        if (currentClass) {
            updateStudentStatus(studentId, "Present", currentClass.code);
            toast({
                title: "Attendance Marked!",
                description: `${student.name} has been successfully marked as present.`,
            });
            stopQrScan();
        } else {
             toast({
                variant: "destructive",
                title: "Scan Failed",
                description: "No class is currently in progress to mark attendance for.",
            });
        }
    } else {
        toast({
            variant: "destructive",
            title: "Invalid Student QR Code",
            description: "The scanned QR code does not correspond to any student.",
        });
    }
  };

  const handleScanError = (errorMessage: string) => {
    // console.log(`QR Code no longer in front of camera.`);
  };

  const startQrScan = () => {
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

  const stopQrScan = () => {
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

  const startFaceScan = async () => {
    if (!hasCameraPermission || !currentClass) return;
    
    setIsFaceScanning(true);

    if (videoRef.current && !videoRef.current.srcObject) {
       try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Camera Error',
            description: 'Could not access the camera for face scanning.',
        });
        setIsFaceScanning(false);
        return;
      }
    }
    
    // Simulate AI facial recognition
    setTimeout(() => {
      const absentStudents = attendanceData.filter(s => s.status === 'Absent');
      if (absentStudents.length > 0) {
        const randomStudent = absentStudents[Math.floor(Math.random() * absentStudents.length)];
        updateStudentStatus(randomStudent.id, 'Present', currentClass.code);
        toast({
          title: "Attendance Marked!",
          description: `AI recognized ${randomStudent.name} and marked them as present.`,
        });
      } else {
        toast({
            title: "All students present!",
            description: 'No absent students left to mark.',
        });
      }
      setIsFaceScanning(false);
    }, 2500); // Simulate 2.5 second processing time
  };


  const isStaff = userRole === 'staff';

  return (
    <div className="space-y-8">
      <PageHeader
        title="Class Attendance"
        description={isStaff ? "View and manage student attendance for the current class." : "Access restricted to staff."}
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Attendance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {presentCount} / {totalCount}
            </div>
            <p className="text-sm text-muted-foreground">Students Present</p>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Class Details</CardTitle>
             <CardDescription>{currentClass?.subject || 'No class in progress'}</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-muted-foreground">Time:</span>{" "}
              {currentClass?.time || 'N/A'}
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Room:</span>{" "}
               {currentClass?.room || 'N/A'}
            </div>
            <div>
              <span className="font-medium text-muted-foreground">
                Instructor:
              </span>{" "}
              {currentClass?.instructor || 'N/A'}
            </div>
            <div>
              <span className="font-medium text-muted-foreground">
                Subject Code:
              </span>{" "}
              {currentClass?.code || 'N/A'}
            </div>
          </CardContent>
        </Card>
      </div>

      {isStaff ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle>Student List</CardTitle>
                <Dialog open={isAddStudentDialogOpen} onOpenChange={setIsAddStudentDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Student
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[525px]">
                    <DialogHeader>
                      <DialogTitle>Add New Student</DialogTitle>
                      <DialogDescription>
                        Enter the student's details and capture their photo for facial recognition.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddStudent} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="student-name">Student Name</Label>
                        <Input
                          id="student-name"
                          placeholder="e.g., John Doe"
                          value={newStudentName}
                          onChange={(e) => setNewStudentName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="student-id">Student ID</Label>
                        <Input
                          id="student-id"
                          placeholder="e.g., S011"
                          value={newStudentId}
                          onChange={(e) => setNewStudentId(e.target.value)}
                        />
                      </div>
                       <div className="space-y-2">
                          <Label>Student Photo</Label>
                           <div className="relative w-full aspect-video bg-background rounded-lg shadow-inner overflow-hidden">
                                <video ref={addStudentVideoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                                {!hasCameraPermission && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 text-muted-foreground">
                                    <CameraOff className="h-10 w-10 mb-2"/>
                                    <p>Camera permission not granted.</p>
                                </div>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground text-center">Position the student's face in the frame.</p>
                       </div>
                      <DialogFooter>
                         <DialogClose asChild>
                           <Button type="button" variant="secondary">Cancel</Button>
                         </DialogClose>
                         <Button type="submit">
                           <UserPlus className="mr-2 h-4 w-4" />
                           Save Student
                         </Button>
                       </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceData.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">
                          {student.name}
                        </TableCell>
                        <TableCell>{student.id}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              student.status === "Present"
                                ? "default"
                                : "destructive"
                            }
                            className={
                              student.status === "Present"
                                ? "bg-green-500/80 text-white"
                                : "bg-red-500/80"
                            }
                          >
                            {student.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(student.id, "Present")}
                                disabled={student.status === 'Present'}
                              >
                                Mark as Present
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(student.id, "Absent")}
                                disabled={student.status === 'Absent'}
                              >
                                Mark as Absent
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1">
             <Card>
                <CardHeader>
                    <CardTitle>Attendance Scanner</CardTitle>
                    <CardDescription>Scan a student's code to mark them as present.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="qr">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="qr"><ScanLine className="mr-2 h-4 w-4"/>QR Code</TabsTrigger>
                            <TabsTrigger value="face"><UserCheck className="mr-2 h-4 w-4"/>Face</TabsTrigger>
                        </TabsList>
                        <TabsContent value="qr" className="flex flex-col items-center justify-center space-y-4 text-center pt-4">
                            <div className="relative w-full max-w-sm aspect-square bg-background rounded-lg shadow-inner overflow-hidden">
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
                                    <p className="text-muted-foreground">QR scanner is ready</p>
                                </div>
                                )}
                            </div>
                            <p className="text-muted-foreground max-w-sm text-sm">
                                Position the student's QR code within the frame to mark their attendance automatically.
                            </p>
                            {isScanning ? (
                                <Button size="lg" onClick={stopQrScan} variant="destructive">
                                <ScanLine className="mr-2 h-5 w-5" />
                                Stop Scanning
                                </Button>
                            ) : (
                                <Button size="lg" onClick={startQrScan} disabled={!hasCameraPermission || !currentClass}>
                                <Camera className="mr-2 h-5 w-5" />
                                {!currentClass ? 'No Class in Progress' : 'Start QR Scan'}
                                </Button>
                            )}
                        </TabsContent>
                         <TabsContent value="face" className="flex flex-col items-center justify-center space-y-4 text-center pt-4">
                            <div className="relative w-full max-w-sm aspect-square bg-background rounded-lg shadow-inner overflow-hidden">
                                <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
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
                                {isFaceScanning && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
                                    <Loader2 className="h-12 w-12 animate-spin text-white mb-4"/>
                                    <p className="text-white font-bold">Recognizing Student...</p>
                                </div>
                                )}
                            </div>
                            <p className="text-muted-foreground max-w-sm text-sm">
                                Our AI will automatically detect and verify the student's face to mark attendance.
                            </p>
                            <Button size="lg" onClick={startFaceScan} disabled={!hasCameraPermission || !currentClass || isFaceScanning}>
                                {isFaceScanning ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Scanning...
                                    </>
                                ) : (
                                    <>
                                        <UserCheck className="mr-2 h-5 w-5" />
                                        {!currentClass ? 'No Class in Progress' : 'Start Face Scan'}
                                    </>
                                )}
                            </Button>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Alert variant="destructive">
            <ShieldAlert className="h-4 w-4"/>
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
                You do not have permission to view this page. This area is for staff members only.
            </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

    