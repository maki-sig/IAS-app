"use client";

import React, { useState, useActionState, useEffect } from 'react';
import { resetPassword } from '@/app/actions';
import { X, KeyRound, Loader2, Eye, EyeOff } from 'lucide-react';

interface ResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string | null;
}

export default function ResetPasswordModal({ isOpen, onClose, username }: ResetModalProps) {
  const [state, action, pending] = useActionState(resetPassword, null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (state?.success) {
      onClose();
    }
  }, [state, onClose]);

  if (!isOpen || !username) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-card-bg border border-card-border rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 transition-colors">
        <header className="px-6 py-5 border-b border-card-border flex items-center justify-between transition-colors">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-input-bg border border-input-border transition-colors">
              <KeyRound size={18} className="text-text-muted transition-colors" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-foreground transition-colors">Reset Password</h3>
              <p className="text-[10px] text-text-dim uppercase tracking-widest font-medium transition-colors">Account: {username}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-text-dim hover:text-foreground transition-colors">
            <X size={20} />
          </button>
        </header>

        <form action={action} className="p-6 space-y-4">
          <input type="hidden" name="username" value={username} />
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-text-dim ml-1 transition-colors">New Password</label>
            <div className="group relative">
              <input 
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                required
                autoFocus
                className="w-full bg-input-bg border border-input-border rounded-md py-3 pl-4 pr-11 text-sm text-foreground outline-none focus:border-input-focus transition-all"
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

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-text-dim ml-1 transition-colors">Confirm New Password</label>
            <div className="group relative">
              <input 
                name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                placeholder="••••••••"
                required
                className="w-full bg-input-bg border border-input-border rounded-md py-3 pl-4 pr-11 text-sm text-foreground outline-none focus:border-input-focus transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-dim hover:text-foreground transition-colors duration-300"
              >
                {showConfirm ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
              </button>
            </div>
          </div>

          {state?.error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-[11px] text-red-500 font-medium animate-in slide-in-from-top-2">
              {state.error}
            </div>
          )}

          <div className="pt-4">
            <button 
              type="submit"
              disabled={pending}
              className="w-full flex items-center justify-center bg-primary-accent border border-primary-accent-border text-white py-3.5 rounded-md text-xs font-bold uppercase tracking-widest hover:bg-primary-accent-hover transition-all disabled:opacity-50"
            >
              {pending ? <Loader2 size={16} className="animate-spin" /> : "Update Credentials"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
