"use client";

import React, { useActionState, useEffect } from 'react';
import { createCredential } from '@/app/actions';
import { X, ShieldPlus, Loader2 } from 'lucide-react';

interface CredentialModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: any[] | null;
}

export default function CredentialModal({ isOpen, onClose, employees }: CredentialModalProps) {
  const [state, action, pending] = useActionState(createCredential, null);

  useEffect(() => {
    if (state?.success) {
      onClose();
    }
  }, [state, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-card-bg border border-card-border rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 transition-colors">
        <header className="px-6 py-5 border-b border-card-border flex items-center justify-between transition-colors">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-input-bg border border-input-border transition-colors">
              <ShieldPlus size={18} className="text-text-muted transition-colors" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-foreground transition-colors">New Credential</h3>
          </div>
          <button onClick={onClose} className="text-text-dim hover:text-foreground transition-colors">
            <X size={20} />
          </button>
        </header>

        <form action={action} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-text-dim ml-1 transition-colors">Select Employee</label>
            <select 
              name="e_id"
              required
              defaultValue=""
              className="w-full bg-input-bg border border-input-border rounded-md py-3 px-4 text-sm text-foreground outline-none focus:border-input-focus transition-all appearance-none cursor-pointer"
            >
              <option value="" disabled className="bg-card-bg">Choose Employee</option>
              {employees?.map((emp) => (
                <option key={emp.e_id} value={emp.e_id} className="bg-card-bg">
                  {emp.fname} {emp.lname} (ID: {emp.e_id})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-text-dim ml-1 transition-colors">Username</label>
            <input 
              name="username"
              type="text" 
              placeholder="j.doe"
              required
              className="w-full bg-input-bg border border-input-border rounded-md py-3 px-4 text-sm text-foreground outline-none focus:border-input-focus transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-dim ml-1 transition-colors">Password</label>
              <input 
                name="password"
                type="password" 
                placeholder="••••••••"
                required
                className="w-full bg-input-bg border border-input-border rounded-md py-3 px-4 text-sm text-foreground outline-none focus:border-input-focus transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-dim ml-1 transition-colors">Confirm</label>
              <input 
                name="confirmPassword"
                type="password" 
                placeholder="••••••••"
                required
                className="w-full bg-input-bg border border-input-border rounded-md py-3 px-4 text-sm text-foreground outline-none focus:border-input-focus transition-all"
              />
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
              {pending ? <Loader2 size={16} className="animate-spin" /> : "Authorize User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
