"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { AppLogo } from "@/components/app-logo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { validateStudent } from "@/lib/student-data";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const role = searchParams.get("role") || "student"; // Default to student

  const portalName = role.charAt(0).toUpperCase() + role.slice(1);
  const dashboardPath = role === "staff" ? "/attendance" : "/dashboard";
  const isStudent = role === "student";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isStudent) {
      if (validateStudent(studentId, password)) {
        router.push(dashboardPath);
      } else {
        setError("Invalid Student ID or password.");
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "Invalid Student ID or password.",
        });
      }
    } else {
      // For now, staff login is automatic
      router.push(dashboardPath);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <AppLogo className="mx-auto" />
          <h1 className="text-2xl font-semibold tracking-tight">
            {portalName} Portal Login
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your credentials to access your account
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>Please sign in to continue.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="grid gap-4">
              {error && (
                 <Alert variant="destructive">
                  <Terminal className="h-4 w-4" />
                  <AlertTitle>Login Failed</AlertTitle>
                  <AlertDescription>
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              <div className="grid gap-2">
                <Label htmlFor={isStudent ? "studentId" : "email"}>
                  {isStudent ? "Student ID" : "Email"}
                </Label>
                <Input
                  id={isStudent ? "studentId" : "email"}
                  type={isStudent ? "text" : "email"}
                  placeholder={
                    isStudent ? "e.g. S010" : "name@example.com"
                  }
                  required
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  disabled={!isStudent}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={!isStudent}
                />
              </div>
              <Button type="submit" className="w-full">
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
        <p className="px-8 text-center text-sm text-muted-foreground">
          By clicking continue, you agree to our{" "}
          <Link
            href="#"
            className="underline underline-offset-4 hover:text-primary"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="#"
            className="underline underline-offset-4 hover:text-primary"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
