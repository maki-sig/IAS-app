import React, { Suspense } from 'react';
import { cookies } from 'next/headers';
import Sidebar from '@/components/Sidebar';
import DashboardContent from '@/components/DashboardContent';
import DashboardSkeleton from '@/components/DashboardSkeleton';

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const { tab = 'employees' } = await searchParams;
  const cookieStore = await cookies();
  const username = cookieStore.get('username')?.value || 'System Admin';

  return (
    <div className="flex h-screen bg-background text-foreground transition-colors duration-300 selection:bg-primary-accent/20 overflow-hidden">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 hidden dark:block">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-purple-500/5 rounded-full blur-[100px]" />
      </div>

      <Sidebar tab={tab} username={username} />

      {/* Main Content Area wrapped in Suspense */}
      <Suspense key={tab} fallback={<DashboardSkeleton tab={tab} />}>
        <DashboardContent tab={tab} />
      </Suspense>
    </div>
  );
}
