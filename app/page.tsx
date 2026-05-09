"use client";

import React, { useState, useActionState } from 'react';
import { User, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { login } from '@/app/actions';

export default function Home() {
  const [showPassword, setShowPassword] = useState(false);
  const [state, action, pending] = useActionState(login, null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050505] p-4 text-white selection:bg-white/20">
      {/* Background decoration - very subtle blobs for transparency depth */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md transition-all duration-700 ease-out animate-in fade-in slide-in-from-bottom-8">
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-8 backdrop-blur-2xl shadow-2xl transition-all duration-500 hover:border-white/20 hover:bg-white/[0.07]">
          <div className="mb-10 text-center space-y-2">
            <h1 className="text-2xl font-light tracking-tight text-white/90">
              Welcome back
            </h1>
            <p className="text-xs uppercase tracking-[0.2em] text-white/30 font-medium">
              Information, Assurance, and Security
            </p>
          </div>

          <form action={action} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/40 ml-1">
                Username
              </label>
              <div className="group relative transition-all">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white/60 transition-all duration-300">
                  <User size={16} strokeWidth={1.5} />
                </div>
                <input
                  name="username"
                  type="text"
                  placeholder="admin"
                  required
                  className="w-full rounded-md border border-white/5 bg-white/[0.02] py-4 pl-12 pr-4 text-sm text-white placeholder:text-white/20 outline-none ring-1 ring-transparent transition-all duration-300 focus:border-white/20 focus:bg-white/[0.05] focus:ring-white/5"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/40 ml-1">
                Password
              </label>
              <div className="group relative transition-all">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white/60 transition-all duration-300">
                  <Lock size={16} strokeWidth={1.5} />
                </div>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-md border border-white/5 bg-white/[0.02] py-4 pl-12 pr-12 text-sm text-white placeholder:text-white/20 outline-none ring-1 ring-transparent transition-all duration-300 focus:border-white/20 focus:bg-white/[0.05] focus:ring-white/5"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60 transition-all duration-300"
                >
                  {showPassword ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
                </button>
              </div>
            </div>

            {state?.error && (
              <div className="text-[11px] font-medium text-red-400 bg-red-500/10 border border-red-500/40 backdrop-blur-md rounded-md p-3 text-center animate-in fade-in zoom-in-95 duration-300 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                {state.error}
              </div>
            )}

            <button
              type="submit"
              disabled={pending}
              className="relative flex w-full items-center justify-center overflow-hidden rounded-md bg-white py-4 text-xs font-bold uppercase tracking-widest text-black transition-all duration-500 hover:bg-white/90 hover:scale-[1.01] active:scale-[0.99] shadow-[0_4px_20px_rgba(255,255,255,0.05)] active:shadow-none disabled:opacity-50 disabled:scale-100"
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
