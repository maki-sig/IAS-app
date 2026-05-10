"use client";

import React, { useState, useActionState, useEffect } from 'react';
import { createCredential } from '@/app/actions';
import { X, ShieldPlus, Loader2, Eye, EyeOff, Check, Minus } from 'lucide-react';

interface CredentialModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: any[] | null;
}

// ── Validation rules (mirrors server-side) ─────────────────────────────────
const USERNAME_REGEX = /^[A-Za-z0-9-]+$/;

function validateUsername(value: string): string | null {
  if (!value) return 'Username is required.';
  if (value.length < 1 || value.length > 39) return 'Username must be between 1 and 39 characters.';
  if (!USERNAME_REGEX.test(value)) return 'Only letters, numbers, and hyphens are allowed.';  if (/--/.test(value)) return 'Username cannot contain consecutive hyphens.';
  return null;
}

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

function validateConfirm(password: string, confirm: string): string | null {
  if (!confirm) return 'Please confirm your password.';
  if (password !== confirm) return 'Passwords do not match.';
  return null;
}

// ── Strength indicator row ────────────────────────────────────────────────
function StrengthRow({ met, label }: { met: boolean; label: string }) {
  return (
    <span className={`flex items-center gap-1 transition-colors duration-200 ${met ? 'text-green-500' : 'text-text-dim'}`}>
      {met ? <Check size={10} strokeWidth={2.5} /> : <Minus size={10} strokeWidth={2} />}
      <span>{label}</span>
    </span>
  );
}

// ── Component ─────────────────────────────────────────────────────────────
export default function CredentialModal({ isOpen, onClose, employees }: CredentialModalProps) {
  const [state, action, pending] = useActionState(createCredential, null);
  const [showPassword, setShowPassword] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const [fields, setFields] = useState({ e_id: '', username: '', password: '', confirmPassword: '' });
  const [touched, setTouched] = useState({ username: false, password: false, confirmPassword: false });

  const strength = getPasswordStrength(fields.password);

  const errors = {
    username:        touched.username        ? validateUsername(fields.username)                        : null,
    password:        touched.password        ? (isPasswordValid(strength) ? null : 'Password does not meet requirements.') : null,
    confirmPassword: touched.confirmPassword ? validateConfirm(fields.password, fields.confirmPassword) : null,
  };

  const hasErrors = Object.values(errors).some(Boolean)
    || !fields.e_id
    || !isPasswordValid(strength)
    || fields.password !== fields.confirmPassword;

  const set = (key: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setFields(prev => ({ ...prev, [key]: e.target.value }));

  const touch = (key: keyof typeof touched) => () =>
    setTouched(prev => ({ ...prev, [key]: true }));

  const handleSubmitAttempt = () =>
    setTouched({ username: true, password: true, confirmPassword: true });

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => onClose(), 260);
  };

  useEffect(() => {
    if (state?.success) handleClose();
  }, [state?.success]);

  if (!isOpen && !isClosing) return null;

  const inputBase = "w-full bg-input-bg border rounded-md py-3 px-4 text-sm text-foreground outline-none transition-all";
  const inputNormal = `${inputBase} border-input-border focus:border-input-focus`;
  const inputErr    = `${inputBase} border-red-500/60 focus:border-red-500`;
  const cls = (key: keyof typeof errors) => errors[key] ? inputErr : inputNormal;

  const passwordStrengthFilled = [strength.minLength, strength.hasUpper, strength.hasLower, strength.hasDigit, strength.hasSymbol].filter(Boolean).length;
  const strengthColor = passwordStrengthFilled <= 2 ? 'bg-red-500' : passwordStrengthFilled <= 4 ? 'bg-yellow-500' : 'bg-green-500';

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm ${isClosing ? 'animate-overlay-fade-out' : 'animate-in fade-in'} duration-300`}>
      <div className={`relative w-full max-w-md bg-card-bg border border-card-border rounded-xl shadow-2xl overflow-hidden transition-all ${isClosing ? 'animate-modal-exit' : 'animate-modal-scale'}`}>
        <header className="px-6 py-5 border-b border-card-border flex items-center justify-between transition-colors">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-input-bg border border-input-border transition-colors">
              <ShieldPlus size={18} className="text-text-muted transition-colors" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-foreground transition-colors">New Credential</h3>
          </div>
          <button onClick={handleClose} className="text-text-dim hover:text-foreground transition-colors">
            <X size={20} />
          </button>
        </header>

        <form action={action} className="p-6 space-y-4">

          {/* Employee selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-text-dim ml-1 transition-colors">Select Employee</label>
            <select
              name="e_id"
              required
              value={fields.e_id}
              onChange={set('e_id')}
              className="w-full bg-input-bg border border-input-border rounded-md py-3 px-4 text-sm text-foreground outline-none focus:border-input-focus transition-all appearance-none cursor-pointer"
            >
              <option value="" disabled className="bg-card-bg">
                {employees && employees.length === 0 ? 'All employees have credentials' : 'Choose Employee'}
              </option>
              {employees?.map((emp) => (
                <option key={emp.e_id} value={emp.e_id} className="bg-card-bg">
                  {emp.fname} {emp.lname} (ID: {emp.e_id})
                </option>
              ))}
            </select>
            {employees?.length === 0 && (
              <p className="text-[10px] text-yellow-500 ml-1">All registered employees already have credentials.</p>
            )}
          </div>

          {/* Username */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-text-dim ml-1 transition-colors">Username</label>
            <input
              name="username"
              type="text"
              placeholder="j.doe"
              required
              maxLength={39}
              value={fields.username}
              onChange={set('username')}
              onBlur={touch('username')}
              className={cls('username')}
            />
            {errors.username
              ? <p className="text-[10px] text-red-500 ml-1 animate-in fade-in slide-in-from-top-1 duration-200">{errors.username}</p>
              : touched.username && fields.username && <p className="text-[10px] text-text-dim ml-1">{fields.username.length}/39</p>
            }
          </div>

          {/* Password section */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between ml-1 mr-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-text-dim transition-colors">Password</span>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-text-dim hover:text-foreground transition-colors duration-300"
              >
                {showPassword ? <EyeOff size={12} strokeWidth={2} /> : <Eye size={12} strokeWidth={2} />}
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Password */}
              <div className="space-y-1.5">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  value={fields.password}
                  onChange={set('password')}
                  onBlur={touch('password')}
                  className={touched.password && !isPasswordValid(strength) ? inputErr : inputNormal}
                />
              </div>
              {/* Confirm */}
              <div className="space-y-1.5">
                <input
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  value={fields.confirmPassword}
                  onChange={set('confirmPassword')}
                  onBlur={touch('confirmPassword')}
                  className={cls('confirmPassword')}
                />
              </div>
            </div>

            <div className="flex justify-between px-1 pt-0.5">
              <span className="text-[10px] text-text-dim uppercase tracking-widest font-medium">Password</span>
              <span className="text-[10px] text-text-dim uppercase tracking-widest font-medium">Confirm</span>
            </div>

            {/* Strength bar — only shown once user starts typing */}
            {fields.password.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(i => (
                    <div
                      key={i}
                      className={`h-0.5 flex-1 rounded-full transition-all duration-300 ${i <= passwordStrengthFilled ? strengthColor : 'bg-input-border'}`}
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
              {pending ? <Loader2 size={16} className="animate-spin" /> : "Authorize User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
