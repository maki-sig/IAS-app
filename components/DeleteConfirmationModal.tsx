"use client";

import React, { useState } from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isPending: boolean;
}

export default function DeleteConfirmationModal({ isOpen, onClose, onConfirm, title, message, isPending }: DeleteConfirmationModalProps) {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => onClose(), 180);
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div
      onClick={handleClose}
      className={`fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 ${isClosing ? 'animate-overlay-fade-out' : 'animate-overlay-fade-in'}`}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className={`relative w-full max-w-sm bg-card-bg border border-red-500/20 rounded-xl shadow-[0_0_50px_-12px_rgba(239,68,68,0.3)] overflow-hidden transition-all ${isClosing ? 'animate-modal-exit' : 'animate-modal-bounce'}`}> 
        <header className="px-6 py-4 border-b border-card-border flex items-center justify-between bg-red-500/5 transition-colors">
          <div className="flex items-center gap-3">
            <AlertTriangle size={18} className="text-red-500" />
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-500">{title}</h3>
          </div>
          <button onClick={handleClose} className="text-text-dim hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        </header>

        <div className="p-6 space-y-6 text-center">
          <p className="text-sm text-text-muted font-light leading-relaxed transition-colors">
            {message}
          </p>

          <div className="flex flex-col gap-2">
            <button 
              onClick={onConfirm}
              disabled={isPending}
              className="w-full flex items-center justify-center bg-red-500 text-white py-3 rounded-md text-[10px] font-bold uppercase tracking-widest hover:bg-red-600 transition-all disabled:opacity-50"
            >
              {isPending ? <Loader2 size={16} className="animate-spin" /> : "Confirm Deletion"}
            </button>
            <button 
              onClick={handleClose}
              disabled={isPending}
              className="w-full py-3 rounded-md text-[10px] font-bold uppercase tracking-widest text-text-dim hover:text-foreground transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
