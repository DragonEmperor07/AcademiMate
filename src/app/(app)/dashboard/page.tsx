"use client";

import { BarChart, Clock, ScanLine, TrendingUp } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
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
        description="Here's your academic snapshot for today."
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
            <div className="p-4 bg-background rounded-lg shadow-inner">
               <ScanLine className="h-24 w-24 text-primary" />
            </div>
            <p className="text-muted-foreground max-w-sm">
              Scan the QR code in your classroom to automatically mark your attendance for the current period.
            </p>
            <Button size="lg" onClick={handleScan}>
              <ScanLine className="mr-2 h-5 w-5" />
              Simulate QR Scan
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
