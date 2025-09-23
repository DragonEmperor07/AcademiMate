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
import { getStudentById, updateStudentStatus, subscribe, Student } from "@/lib/student-data";
import { subscribe as subscribeToClasses, Class } from "@/lib/class-data";

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
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loggedInStudent, setLoggedInStudent] = useState<Student | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [presentCount, setPresentCount] = useState(0);
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [allClasses, setAllClasses] = useState<Class[]>([]);
  const [nextClass, setNextClass] = useState<Class | undefined>(undefined);
  const [currentClass, setCurrentClass] = useState<Class | undefined>(undefined);
  const [studentAttendancePercentage, setStudentAttendancePercentage] = useState(0);

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
  }, []);

  useEffect(() => {
     const unsubscribeStudents = subscribe(async (allStudents) => {
        setStudents(allStudents);
        setPresentCount(allStudents.filter(s => s.status === "Present").length);
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
    if (userRole === 'student' && loggedInStudent && allClasses.length > 0) {
        const completedClasses = allClasses.filter(c => c.status === 'Completed');
        if (completedClasses.length === 0 || !loggedInStudent.attendedClasses) {
            setStudentAttendancePercentage(0);
            return;
        }
        
        const attendedCount = loggedInStudent.attendedClasses.filter(classId => 
            completedClasses.some(c => c.code === classId)
        ).length;
        
        const percentage = Math.round((attendedCount / completedClasses.length) * 100);
        setStudentAttendancePercentage(percentage);
    }
  }, [loggedInStudent, allClasses, userRole]);

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

      {/* Essentials Section */}
      {userRole === 'staff' && (
        <div>
          <h2 className="text-xl font-bold mb-4">ESSENTIALS</h2>
          <div className="grid gap-4 md:grid-cols-1">
            <Link href="/attendance">
                <Card className="bg-blue-50 border-blue-200 hover:bg-blue-100 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Class Attendance</CardTitle>
                    <Users className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-blue-600">{presentCount} / {students.length}</div>
                    <p className="text-xs text-muted-foreground mt-2">
                    Students present in the current class. Click to view details.
                    </p>
                </CardContent>
                </Card>
            </Link>
          </div>
        </div>
      )}

      {/* Tools Section */}
      <div>
        <h2 className="text-xl font-bold mb-4">TOOLS</h2>
        
        {userRole === 'student' && (
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="font-headline text-xl flex items-center gap-2">
                My Attendance
              </CardTitle>
            </CardHeader>
             <CardContent>
              <div className="text-2xl font-bold text-primary">{studentAttendancePercentage}%</div>
               <p className="text-xs text-muted-foreground">Overall attendance in completed classes.</p>
              <div className="mt-4">
                <Progress value={studentAttendancePercentage} className="h-2" />
              </div>
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

    