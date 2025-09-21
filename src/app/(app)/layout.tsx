"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarClock,
  ClipboardCheck,
  LayoutDashboard,
  Lightbulb,
  LogOut,
  UserCircle,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { AppLogo } from "@/components/app-logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };
  
  const isStaff = pathname.startsWith('/attendance');

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center justify-between">
            <AppLogo />
            <SidebarTrigger />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {!isStaff && (
              <>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("/dashboard")}
                    tooltip="Dashboard"
                  >
                    <Link href="/dashboard">
                      <LayoutDashboard />
                      <span>Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive("/attendance")}
                      tooltip="Attendance"
                    >
                      <Link href="/attendance">
                        <ClipboardCheck />
                        <span>Attendance</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("/profile")}
                    tooltip="My Profile"
                  >
                    <Link href="/profile">
                      <UserCircle />
                      <span>My Profile</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("/routine")}
                    tooltip="Daily Routine"
                  >
                    <Link href="/routine">
                      <CalendarClock />
                      <span>Daily Routine</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("/suggestions")}
                    tooltip="Task Suggestions"
                  >
                    <Link href="/suggestions">
                      <Lightbulb />
                      <span>Task Suggestions</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </>
            )}
            {isStaff && (
               <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/attendance")}
                  tooltip="Attendance"
                >
                  <Link href="/attendance">
                    <ClipboardCheck />
                    <span>Attendance</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
           <div className="flex items-center gap-3">
             <Avatar className="h-9 w-9">
                <AvatarImage src={isStaff ? "https://picsum.photos/seed/2/100/100" : "https://picsum.photos/seed/1/100/100"} alt="Avatar" data-ai-hint="person avatar" />
                <AvatarFallback>{isStaff ? "AG" : "JD"}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                  <span className="text-sm font-medium">{isStaff ? "Dr. Alan Grant" : "Jane Doe"}</span>
                  <span className="text-xs text-muted-foreground">{isStaff ? "Staff" : "Student"}</span>
              </div>
          </div>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Log Out">
                <Link href="/">
                  <LogOut />
                  <span>Log Out</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="min-h-screen p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
