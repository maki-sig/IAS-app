"use client";

import React, { useState, useActionState, useEffect } from 'react';
import { resetPassword } from '@/app/actions';
import { X, KeyRound, Loader2, Eye, EyeOff, Check, Minus } from 'lucide-react';
import { useToast } from './Toast';

interface ResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string | null;
}

// ── Shared password strength logic (mirrors server-side) ──────────────────
interface PasswordStrength {
  minLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasDigit: boolean;
  hasSymbol: boolean;
}

function getPasswordStrength(value: string): PasswordStrength {
  return {
    minLength: value.length >= 8,
    hasUpper:  /[A-Z]/.test(value),
    hasLower:  /[a-z]/.test(value),
    hasDigit:  /[0-9]/.test(value),
    hasSymbol: /[!@#$%^&*()_+\-=]/.test(value),
  };
}

function isPasswordValid(s: PasswordStrength): boolean {
  return Object.values(s).every(Boolean);
}

function StrengthRow({ met, label }: { met: boolean; label: string }) {
  return (
    <span className={`flex items-center gap-1 transition-colors duration-200 ${met ? 'text-green-500' : 'text-text-dim'}`}>
      {met ? <Check size={10} strokeWidth={2.5} /> : <Minus size={10} strokeWidth={2} />}
      <span>{label}</span>
    </span>
  );
}

// ── Component ─────────────────────────────────────────────────────────────
export default function ResetPasswordModal({ isOpen, onClose, username }: ResetModalProps) {
  const { addToast } = useToast();
  const [state, action, pending] = useActionState(resetPassword, null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const [fields, setFields] = useState({ password: '', confirmPassword: '' });
  const [touched, setTouched] = useState({ password: false, confirmPassword: false });

  const strength = getPasswordStrength(fields.password);

  const errors = {
    password:        touched.password        ? (isPasswordValid(strength) ? null : 'Password does not meet requirements.') : null,
    confirmPassword: touched.confirmPassword
      ? (!fields.confirmPassword ? 'Please confirm your password.' : fields.password !== fields.confirmPassword ? 'Passwords do not match.' : null)
      : null,
  };

  const hasErrors = !isPasswordValid(strength) || fields.password !== fields.confirmPassword || !fields.confirmPassword;

  const set = (key: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFields(prev => ({ ...prev, [key]: e.target.value }));

  const touch = (key: keyof typeof touched) => () =>
    setTouched(prev => ({ ...prev, [key]: true }));

  const handleSubmitAttempt = () =>
    setTouched({ password: true, confirmPassword: true });

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => onClose(), 180);
  };

  useEffect(() => {
    if (state?.success) {
      addToast({
        type: 'success',
        title: 'Password Reset',
        message: 'Password has been successfully reset.'
      });
      handleClose();
    }
  }, [state?.success]);

  if ((!isOpen && !isClosing) || !username) return null;

  const inputBase = "w-full bg-input-bg border rounded-md py-3 pl-4 pr-11 text-sm text-foreground outline-none transition-all";
  const inputNormal = `${inputBase} border-input-border focus:border-input-focus`;
  const inputErr    = `${inputBase} border-red-500/60 focus:border-red-500`;

  const strengthFilled = [strength.minLength, strength.hasUpper, strength.hasLower, strength.hasDigit, strength.hasSymbol].filter(Boolean).length;
  const strengthColor = strengthFilled <= 2 ? 'bg-red-500' : strengthFilled <= 4 ? 'bg-yellow-500' : 'bg-green-500';

  return (
    <div
      onClick={handleClose}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 ${isClosing ? 'animate-overlay-fade-out' : 'animate-overlay-fade-in'}`}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className={`relative w-full max-w-md bg-card-bg border border-card-border rounded-xl shadow-2xl overflow-hidden transition-all ${isClosing ? 'animate-modal-exit' : 'animate-modal-scale'}`}
      >
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
          <button onClick={handleClose} className="text-text-dim hover:text-foreground transition-colors">
            <X size={20} />
          </button>
        </header>

        <form action={action} className="p-6 space-y-4">
          <input type="hidden" name="username" value={username} />

          {/* New Password */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-text-dim ml-1 transition-colors">New Password</label>
            <div className="group relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                required
                autoFocus
                value={fields.password}
                onChange={set('password')}
                onBlur={touch('password')}
                className={touched.password && !isPasswordValid(strength) ? inputErr : inputNormal}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-dim hover:text-foreground transition-colors duration-300"
              >
                {showPassword ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
              </button>
            </div>

            {/* Strength bar — shown once typing starts */}
            {fields.password.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(i => (
                    <div
                      key={i}
                      className={`h-0.5 flex-1 rounded-full transition-all duration-300 ${i <= strengthFilled ? strengthColor : 'bg-input-border'}`}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[10px]">
                  <StrengthRow met={strength.minLength} label="Min. 8 characters" />
                  <StrengthRow met={strength.hasUpper}  label="Uppercase letter" />
                  <StrengthRow met={strength.hasLower}  label="Lowercase letter" />
                  <StrengthRow met={strength.hasDigit}  label="Number" />
                  <StrengthRow met={strength.hasSymbol} label="Symbol" />
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-text-dim ml-1 transition-colors">Confirm New Password</label>
            <div className="group relative">
              <input
                name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                placeholder="••••••••"
                required
                value={fields.confirmPassword}
                onChange={set('confirmPassword')}
                onBlur={touch('confirmPassword')}
                className={errors.confirmPassword ? inputErr : inputNormal}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-dim hover:text-foreground transition-colors duration-300"
              >
                {showConfirm ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-[10px] text-red-500 ml-1 animate-in fade-in slide-in-from-top-1 duration-200">{errors.confirmPassword}</p>
            )}
          </div>

          {state?.error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-[11px] text-red-500 font-medium animate-in slide-in-from-top-2">
              {state.error}
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={pending || hasErrors}
              onClick={handleSubmitAttempt}
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
