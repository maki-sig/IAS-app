import React from 'react';
import { logout } from '@/app/actions';
import { cookies } from 'next/headers';
import { LogOut, User as UserIcon } from 'lucide-react';

export default async function WelcomePage() {
  const cookieStore = await cookies();
  const username = cookieStore.get('username')?.value || 'Employee';

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050505] p-4 text-white selection:bg-white/20">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md animate-in fade-in zoom-in duration-700">
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-12 backdrop-blur-2xl shadow-2xl text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white/5 border border-white/10">
            <UserIcon size={32} className="text-white/60" />
          </div>
          
          <h1 className="text-3xl font-light tracking-tight text-white/90 mb-2">
            Welcome, {username}
          </h1>
          <p className="text-sm text-white/40 mb-10">
            Internal Access System
          </p>

          <form action={logout}>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-md bg-white/5 border border-white/10 py-4 text-xs font-bold uppercase tracking-widest text-white transition-all duration-300 hover:bg-white/10 hover:border-white/20 active:scale-[0.98]"
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
