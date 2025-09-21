"use client";

import { useState, useEffect } from "react";
import { Loader2, Wand2 } from "lucide-react";
import { getRoutine } from "@/lib/actions";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getClasses, subscribe as subscribeToClasses, updateClassStatuses } from "@/lib/class-data";

export default function RoutinePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [studentProfile, setStudentProfile] = useState({
    classSchedule: "No classes today",
    freeTimeAvailable: "All day",
    studentInterests: "",
    studentStrengths: "",
    careerGoals: "",
  });

  const updateProfile = () => {
    const studentId = localStorage.getItem("loggedInUserId");
    const storedProfile = studentId ? localStorage.getItem(`profile_${studentId}`) : null;
    
    updateClassStatuses();
    const classes = getClasses();
    const classSchedule = classes.length > 0 
      ? classes.map(c => `${c.subject} (${c.time}) - ${c.status}`).join('\n') 
      : "No classes scheduled for today.";

    if (storedProfile) {
      const parsedProfile = JSON.parse(storedProfile);
      setStudentProfile({
        classSchedule: classSchedule,
        freeTimeAvailable: "2 hours in the morning, 1 hour in the afternoon", // This could be calculated
        studentInterests: parsedProfile.interests,
        studentStrengths: parsedProfile.strengths,
        careerGoals: parsedProfile.careerGoals,
      });
    } else {
        setStudentProfile(prev => ({ ...prev, classSchedule: classSchedule }));
    }
  }

  useEffect(() => {
    updateProfile();

    const unsubscribe = subscribeToClasses(() => {
      updateProfile();
    });

    const intervalId = setInterval(() => {
      updateProfile();
    }, 60000); // Update every minute

    return () => {
      unsubscribe();
      clearInterval(intervalId);
    };
  }, []);


  async function handleGenerate() {
    setLoading(true);
    setResult("");
    try {
      const response = await getRoutine(studentProfile);
      setResult(response.dailyRoutine);
    } catch (error) {
      console.error(error);
      setResult("Sorry, we couldn't generate your routine at this time. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Personalized Daily Routine"
        description="Generate a daily schedule that balances academics and personal goals."
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Your Academic Profile</CardTitle>
              <CardDescription>
                We'll use this information to build your routine.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold">Class Schedule</h4>
                <div className="text-muted-foreground whitespace-pre-line">
                  {studentProfile.classSchedule}
                </div>
              </div>
               <div>
                <h4 className="font-semibold">Interests</h4>
                <p className="text-muted-foreground">{studentProfile.studentInterests || 'Not set'}</p>
              </div>
              <div>
                <h4 className="font-semibold">Career Goals</h4>
                <p className="text-muted-foreground">{studentProfile.careerGoals || 'Not set'}</p>
              </div>
               <Button onClick={handleGenerate} disabled={loading} className="w-full">
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 h-4 w-4" />
                )}
                Generate My Routine
              </Button>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card className="min-h-[400px]">
            <CardHeader>
              <CardTitle>Your Generated Routine</CardTitle>
              <CardDescription>Here's a suggested plan for your day.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading && (
                <div className="flex items-center justify-center h-60">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}
              {result && (
                <div className="prose prose-sm max-w-none text-foreground prose-headings:text-foreground prose-strong:text-foreground">
                  {result.split('\n').map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
              )}
               {!loading && !result && (
                 <div className="flex flex-col items-center justify-center h-60 text-center text-muted-foreground">
                    <Wand2 className="h-10 w-10 mb-2"/>
                    <p>Your personalized daily routine will appear here.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
