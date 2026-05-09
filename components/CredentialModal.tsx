"use client";

import React, { useState, useActionState, useEffect } from 'react';
import { createCredential } from '@/app/actions';
import { X, ShieldPlus, Loader2 } from 'lucide-react';

export default function CredentialModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [state, action, pending] = useActionState(createCredential, null);

  useEffect(() => {
    if (state?.success) {
      onClose();
    }
  }, [state, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-[#0c0c0c] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <header className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/10">
              <ShieldPlus size={18} className="text-white/60" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/90">New Credential</h3>
          </div>
          <button onClick={onClose} className="text-white/20 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </header>

        <form action={action} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Employee ID</label>
            <input 
              name="e_id"
              type="number" 
              placeholder="e.g. 101"
              required
              className="w-full bg-white/5 border border-white/5 rounded-md py-3 px-4 text-sm text-white outline-none focus:border-white/20 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Username</label>
            <input 
              name="username"
              type="text" 
              placeholder="j.doe"
              required
              className="w-full bg-white/5 border border-white/5 rounded-md py-3 px-4 text-sm text-white outline-none focus:border-white/20 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Password</label>
              <input 
                name="password"
                type="password" 
                placeholder="••••••••"
                required
                className="w-full bg-white/5 border border-white/5 rounded-md py-3 px-4 text-sm text-white outline-none focus:border-white/20 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Confirm</label>
              <input 
                name="confirmPassword"
                type="password" 
                placeholder="••••••••"
                required
                className="w-full bg-white/5 border border-white/5 rounded-md py-3 px-4 text-sm text-white outline-none focus:border-white/20 transition-all"
              />
            </div>
          </div>

          {state?.error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-[11px] text-red-400 font-medium animate-in slide-in-from-top-2">
              {state.error}
            </div>
          )}

          <div className="pt-4">
            <button 
              type="submit"
              disabled={pending}
              className="w-full flex items-center justify-center bg-white text-black py-3.5 rounded-md text-xs font-bold uppercase tracking-widest hover:bg-white/90 transition-all disabled:opacity-50"
            >
              {pending ? <Loader2 size={16} className="animate-spin" /> : "Authorize User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
