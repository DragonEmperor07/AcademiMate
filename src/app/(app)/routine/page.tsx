"use client";

import { useState } from "react";
import { Loader2, Wand2 } from "lucide-react";
import { getRoutine } from "@/lib/actions";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function RoutinePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const studentProfile = {
    classSchedule: "Math (9-10 AM), Physics (11-12 PM), Literature (2-3 PM)",
    freeTimeAvailable: "2 hours in the morning, 1 hour in the afternoon",
    studentInterests: "Programming, AI, Space Exploration",
    studentStrengths: "Problem-solving, Creative Thinking, Mathematics",
    careerGoals: "Software Engineer at a top tech company, focusing on AI development.",
  };

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
                <p className="text-muted-foreground">{studentProfile.classSchedule}</p>
              </div>
               <div>
                <h4 className="font-semibold">Interests</h4>
                <p className="text-muted-foreground">{studentProfile.studentInterests}</p>
              </div>
              <div>
                <h4 className="font-semibold">Career Goals</h4>
                <p className="text-muted-foreground">{studentProfile.careerGoals}</p>
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
