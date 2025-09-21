import Link from 'next/link';
import { ArrowRight, GraduationCap, User } from 'lucide-react';
import { AppLogo } from '@/components/app-logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="flex flex-col items-center space-y-4 text-center">
        <AppLogo />
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl font-headline">
          Welcome to AcademiMate
        </h1>
        <p className="max-w-[700px] text-muted-foreground md:text-xl">
          Your smart partner in navigating the academic landscape. Automated attendance, personalized tasks, and dynamic routines to help you succeed.
        </p>
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-2 max-w-4xl w-full">
        <RoleCard
          href="/login?role=student"
          icon={<User className="h-10 w-10 text-primary" />}
          title="I'm a Student"
          description="Access your dashboard, mark attendance, and get personalized recommendations."
        />
        <RoleCard
          href="/login?role=staff"
          icon={<GraduationCap className="h-10 w-10 text-primary" />}
          title="I'm Staff"
          description="View real-time class attendance and manage student activities."
        />
      </div>
    </main>
  );
}

function RoleCard({ href, icon, title, description }: { href: string; icon: React.ReactNode; title: string; description: string; }) {
  return (
    <Card className="transform transition-transform duration-300 hover:scale-105 hover:shadow-xl">
      <CardHeader className="items-center text-center">
        {icon}
        <CardTitle className="text-2xl font-headline">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center text-center space-y-4">
        <p className="text-muted-foreground flex-grow">{description}</p>
        <Button asChild className="w-full" size="lg">
          <Link href={href}>
            Go to Portal <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
