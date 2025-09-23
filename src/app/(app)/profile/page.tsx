
"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getStudentById, Student } from "@/lib/student-data";
import QRCode from "react-qr-code";
import { Camera, CameraOff, UserCheck, CheckCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const profileSchema = z.object({
  interests: z.string().min(3, "Please list at least one interest."),
  strengths: z.string().min(3, "Please list at least one strength."),
  careerGoals: z.string().min(3, "Please list at least one career goal."),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const [student, setStudent] = useState<Student | null>(null);
  const [profileData, setProfileData] = useState<ProfileFormValues>({
    interests: "Programming, AI, Space Exploration",
    strengths: "Problem-solving, Creative Thinking, Mathematics",
    careerGoals: "Software Engineer at a top tech company, focusing on AI development.",
  });
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isFaceRegistered, setIsFaceRegistered] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);


  useEffect(() => {
    const studentId = localStorage.getItem("loggedInUserId");
    if (studentId) {
      getStudentById(studentId).then(studentData => {
        if (studentData) setStudent(studentData);
      });

      const storedProfile = localStorage.getItem(`profile_${studentId}`);
      if (storedProfile) {
        setProfileData(JSON.parse(storedProfile));
      }
      
      const storedFaceRegistration = localStorage.getItem(`face_registered_${studentId}`);
      if (storedFaceRegistration) {
        setIsFaceRegistered(JSON.parse(storedFaceRegistration));
      }
    }
    
    // Cleanup camera stream on unmount
    return () => {
      stopCamera();
    };

  }, []);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: profileData,
    mode: "onChange",
  });

  useEffect(() => {
    form.reset(profileData);
  }, [profileData, form]);

  async function requestCamera() {
      if (isCameraOn) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);
        setIsCameraOn(true);
        streamRef.current = stream;
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings.',
        });
      }
  }

  function stopCamera() {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        if(videoRef.current) videoRef.current.srcObject = null;
        setHasCameraPermission(null);
        setIsCameraOn(false);
      }
  }

  function handleRegisterFace() {
    if (student && videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        localStorage.setItem(`face_image_${student.id}`, dataUrl);
        localStorage.setItem(`face_registered_${student.id}`, 'true');
        
        setIsFaceRegistered(true);
        stopCamera();
        toast({
            title: "Face Registered!",
            description: "Your face has been successfully registered for attendance.",
        });
      }
    }
  }


  function onSubmit(data: ProfileFormValues) {
    if (student) {
      localStorage.setItem(`profile_${student.id}`, JSON.stringify(data));
      setProfileData(data);
      toast({
        title: "Profile Updated!",
        description: "Your information has been saved successfully.",
      });
    }
  }

  const getInitials = (name: string) => {
    if (!name) return "";
    const nameParts = name.split(" ");
    if (nameParts.length > 1) {
      return `${nameParts[0][0]}${nameParts[1][0]}`;
    }
    return name[0];
  };

  if (!student) {
    return <div>Loading...</div>;
  }


  return (
    <div className="space-y-8">
      <PageHeader
        title="My Profile"
        description="Manage your personal information and preferences."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
           <Card>
            <CardHeader className="items-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src="https://picsum.photos/seed/1/200/200" data-ai-hint="student avatar"/>
                <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
              </Avatar>
              <CardTitle className="text-2xl">{student.name}</CardTitle>
              <CardDescription>Student ID: {student.id}</CardDescription>
            </CardHeader>
            <CardContent className="text-center text-sm">
                <p><span className="font-semibold">Email:</span> {student.name.toLowerCase().replace(' ', '.')}@university.edu</p>
                <p><span className="font-semibold">Major:</span> Computer Science</p>
                <p><span className="font-semibold">Year:</span> 3rd Year</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
                <CardTitle>Your Attendance QR Code</CardTitle>
                <CardDescription>
                  Present this QR code to your instructor to mark your attendance.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center p-4">
                <div className="bg-white p-4 rounded-lg">
                  <QRCode value={student.id} size={200} />
                </div>
              </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Update Your Preferences</CardTitle>
              <CardDescription>
                This information helps us personalize your academic suggestions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="interests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Interests</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Programming, Sports, Music" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="strengths"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Strengths</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Problem-solving, Communication" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="careerGoals"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Long-term Career Goals</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., Become a Software Engineer"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit">Save Changes</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
                <CardTitle>Facial Recognition</CardTitle>
                <CardDescription>
                  Register your face to enable faster, AI-powered attendance.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center space-y-4 text-center">
                 {isFaceRegistered ? (
                    <div className="flex flex-col items-center justify-center h-48 text-center text-green-600">
                        <CheckCircle className="h-16 w-16 mb-4"/>
                        <p className="font-semibold">Your face is already registered.</p>
                        <Button variant="link" onClick={() => setIsFaceRegistered(false)}>Re-register</Button>
                    </div>
                 ) : (
                    <>
                    <div className="relative w-full max-w-sm aspect-video bg-background rounded-lg shadow-inner overflow-hidden">
                        <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                        {hasCameraPermission === false && !isCameraOn && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 text-muted-foreground">
                                <CameraOff className="h-16 w-16 mb-4"/>
                                <Alert variant="destructive" className="items-center">
                                <AlertTitle>Camera Access Required</AlertTitle>
                                <AlertDescription>
                                    Enable camera to register your face.
                                </AlertDescription>
                                </Alert>
                            </div>
                        )}
                        {!isCameraOn && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80">
                                <UserCheck className="h-16 w-16 mb-4 text-muted-foreground"/>
                                <p className="text-muted-foreground">Enable your camera to begin</p>
                            </div>
                        )}
                    </div>
                    
                    {!isCameraOn ? (
                        <Button size="lg" onClick={requestCamera}>
                            <Camera className="mr-2 h-5 w-5" />
                            Enable Camera
                        </Button>
                    ) : (
                        <div className="flex gap-2">
                             <Button size="lg" onClick={handleRegisterFace}>
                                <UserCheck className="mr-2 h-5 w-5" />
                                Capture and Register
                            </Button>
                            <Button size="lg" variant="outline" onClick={stopCamera}>
                                Cancel
                            </Button>
                        </div>
                    )}
                    </>
                 )}
              </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

    

    
