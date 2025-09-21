"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookCopy,
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
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { AppHeader } from "@/components/app-header";
import { AppLogo } from "@/components/app-logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getStudentById } from "@/lib/student-data";
import { cn } from "@/lib/utils";

function UserProfile() {
  const { state } = useSidebar();
  const [userRole, setUserRole] = React.useState<string | null>(null);
  const [user, setUser] = React.useState<any>(null);
  const pathname = usePathname();

  React.useEffect(() => {
    const role = localStorage.getItem("loggedInUserRole");
    const userId = localStorage.getItem("loggedInUserId");
    setUserRole(role);

    if (role === "student" && userId) {
      setUser(getStudentById(userId));
    } else if (role === "staff") {
      setUser({ name: "Dr. Alan Grant", initials: "AG" });
    }
  }, [pathname]);

  const getInitials = (name: string) => {
    if (!name) return "";
    const nameParts = name.split(" ");
    if (nameParts.length > 1) {
      return `${nameParts[0][0]}${nameParts[1][0]}`;
    }
    return name[0];
  };
  
  const isStaff = userRole === 'staff';

  return (
    <div
      className={cn(
        "flex items-center gap-3",
        state === "collapsed" && "justify-center"
      )}
    >
      <Avatar className="h-9 w-9">
        <AvatarImage
          src={
            isStaff
              ? "https://picsum.photos/seed/2/100/100"
              : "https://picsum.photos/seed/1/100/100"
          }
          alt="Avatar"
          data-ai-hint="person avatar"
        />
        <AvatarFallback>{user ? getInitials(user.name) : ""}</AvatarFallback>
      </Avatar>
      <div
        className={cn(
          "flex flex-col",
          state === "collapsed" && "hidden"
        )}
      >
        <span className="text-sm font-medium">
          {user ? user.name : "Loading..."}
        </span>
        <span className="text-xs text-muted-foreground">
          {isStaff ? "Staff" : "Student"}
        </span>
      </div>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [userRole, setUserRole] = React.useState<string | null>(null);

  React.useEffect(() => {
    const role = localStorage.getItem("loggedInUserRole");
    setUserRole(role);
  }, [pathname]);

  const isActive = (path: string) => {
    return pathname === path;
  };
  
  const isStaff = userRole === 'staff';
  const isStudent = userRole === 'student';

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <AppLogo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {isStudent && (
              <>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("/dashboard")}
                    tooltip="Dashboard"
                  >
                    <Link href="/dashboard">
                      <LayoutDashboard />
                      <span className="group-data-[collapsible=icon]:hidden">Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("/classes")}
                    tooltip="Today's Classes"
                  >
                    <Link href="/classes">
                      <BookCopy />
                      <span className="group-data-[collapsible=icon]:hidden">Classes</span>
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
                      <span className="group-data-[collapsible=icon]:hidden">My Profile</span>
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
                      <span className="group-data-[collapsible=icon]:hidden">Daily Routine</span>
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
                      <span className="group-data-[collapsible=icon]:hidden">Task Suggestions</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </>
            )}
            {isStaff && (
               <>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("/dashboard")}
                    tooltip="Dashboard"
                  >
                    <Link href="/dashboard">
                      <LayoutDashboard />
                      <span className="group-data-[collapsible=icon]:hidden">Dashboard</span>
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
                      <span className="group-data-[collapsible=icon]:hidden">Attendance</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("/classes")}
                    tooltip="Today's Classes"
                  >
                    <Link href="/classes">
                      <BookCopy />
                      <span className="group-data-[collapsible=icon]:hidden">Classes</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
               </>
            )}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
           <UserProfile />
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Log Out">
                <Link href="/">
                  <LogOut />
                  <span className="group-data-[collapsible=icon]:hidden">Log Out</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <AppHeader />
        <main className="min-h-screen p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
