import React from 'react';
import { logout } from '@/app/actions';
import { cookies } from 'next/headers';
import { LogOut, User as UserIcon } from 'lucide-react';

export default async function WelcomePage() {
  const cookieStore = await cookies();
  const username = cookieStore.get('username')?.value || 'Employee';

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 text-foreground selection:bg-primary-accent/20 transition-colors duration-300">
      <div className="fixed inset-0 overflow-hidden pointer-events-none hidden dark:block">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md animate-in fade-in zoom-in duration-700 z-10">
        <div className="relative overflow-hidden rounded-xl border border-card-border bg-card-bg p-12 backdrop-blur-2xl shadow-2xl text-center transition-colors duration-500">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-input-bg border border-input-border transition-colors">
            <UserIcon size={32} className="text-text-muted" />
          </div>

          <h1 className="text-3xl font-light tracking-tight text-foreground mb-2 transition-colors">
            Welcome, {username}
          </h1>
          <p className="text-sm text-text-muted mb-10 transition-colors">
            IAS - Employee Hub
          </p>

          <form action={logout}>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-md bg-red-500/10 border border-red-500/20 py-4 text-xs font-bold uppercase tracking-widest text-red-500 transition-all duration-300 hover:bg-red-500/20 active:scale-[0.98]"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
