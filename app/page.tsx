"use client";

import React, { useState, useActionState, useEffect } from 'react';
import { User, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { login } from '@/app/actions';
import { useToast } from '@/components/Toast';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { addToast } = useToast();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [state, action, pending] = useActionState(login, null);

  useEffect(() => {
    if (state?.success) {
      addToast({
        type: 'success',
        title: 'Login Successful',
        message: 'Welcome back! Redirecting to your dashboard...'
      });
      
      // Redirect after a short delay to allow the toast to be seen
      setTimeout(() => {
        router.push(state.role === 'admin' ? '/dashboard' : '/welcome');
      }, 1500);
    }
  }, [state?.success, state?.role, addToast, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 text-foreground selection:bg-primary-accent/20 transition-colors duration-300">
      {/* Background decoration - very subtle blobs for transparency depth */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none hidden dark:block">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md transition-all duration-700 ease-out animate-in fade-in slide-in-from-bottom-8 z-10">
        <div className="relative overflow-hidden rounded-xl border border-card-border bg-card-bg p-8 backdrop-blur-2xl shadow-2xl transition-colors duration-500">
          <div className="mb-10 text-center space-y-2">
            <h1 className="text-2xl font-light tracking-tight text-foreground transition-colors">
              Welcome back
            </h1>
            <p className="text-xs uppercase tracking-[0.2em] text-text-muted font-medium transition-colors">
              Information Assurance, and Security
            </p>
          </div>

          <form action={action} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-semibold uppercase tracking-[0.15em] text-text-dim ml-1 transition-colors">
                Username
              </label>
              <div className="group relative transition-all">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim group-focus-within:text-foreground transition-colors duration-300">
                  <User size={16} strokeWidth={1.5} />
                </div>
                <input
                  name="username"
                  type="text"
                  placeholder="admin"
                  required
                  className="w-full rounded-md border border-input-border bg-input-bg py-4 pl-12 pr-4 text-sm text-foreground placeholder:text-text-dim outline-none ring-1 ring-transparent transition-all duration-300 focus:border-input-focus focus:ring-input-focus"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-semibold uppercase tracking-[0.15em] text-text-dim ml-1 transition-colors">
                Password
              </label>
              <div className="group relative transition-all">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim group-focus-within:text-foreground transition-colors duration-300">
                  <Lock size={16} strokeWidth={1.5} />
                </div>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-md border border-input-border bg-input-bg py-4 pl-12 pr-12 text-sm text-foreground placeholder:text-text-dim outline-none ring-1 ring-transparent transition-all duration-300 focus:border-input-focus focus:ring-input-focus"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-dim hover:text-foreground transition-colors duration-300"
                >
                  {showPassword ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
                </button>
              </div>
            </div>

            {state?.error && (
              <div className="text-[11px] font-medium text-red-500 bg-red-500/10 border border-red-500/20 backdrop-blur-md rounded-md p-3 text-center animate-in fade-in zoom-in-95 duration-300">
                {state.error}
              </div>
            )}

            <button
              type="submit"
              disabled={pending}
              className="relative flex w-full items-center justify-center overflow-hidden rounded-md bg-primary-accent border border-primary-accent-border py-4 text-xs font-bold uppercase tracking-widest text-white transition-all duration-500 hover:bg-primary-accent-hover hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:scale-100"
            >
              {pending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
