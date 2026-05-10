import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DashboardContent from '@/components/DashboardContent';

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const { tab = 'employees' } = await searchParams;
  const cookieStore = await cookies();
  const username = cookieStore.get('username')?.value || 'System Admin';
  const role = cookieStore.get('user_role')?.value;

  if (role !== 'admin') {
    redirect('/welcome');
  }

  return (
    <div className="flex h-screen bg-background text-foreground transition-colors duration-300 selection:bg-primary-accent/20 overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 hidden dark:block">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-purple-500/5 rounded-full blur-[100px]" />
      </div>

      <DashboardContent initialTab={tab} username={username} />
    </div>
  );
}
