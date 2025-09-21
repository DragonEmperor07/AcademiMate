"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

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

export default function LoginPage() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "student"; // Default to student

  const portalName = role.charAt(0).toUpperCase() + role.slice(1);
  const dashboardPath = role === "staff" ? "/attendance" : "/dashboard";
  const isStudent = role === "student";

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
            <div className="grid gap-4">
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
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input id="password" type="password" required />
              </div>
              <Button asChild className="w-full">
                <Link href={dashboardPath}>Sign In</Link>
              </Button>
            </div>
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
