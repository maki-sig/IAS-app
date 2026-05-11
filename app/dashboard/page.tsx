import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DashboardContent from '@/components/DashboardContent';
import { decodeSession, SESSION_COOKIE_NAME } from '@/utils/session';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'IAS-App | Admin',
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const { tab = 'employees' } = await searchParams;
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = decodeSession(sessionToken);

  if (!session || session.role !== 'admin') {
    redirect('/welcome');
  }

  const username = session.username || 'System Admin';

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
