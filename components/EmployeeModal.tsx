"use client";

import React, { useState, useActionState, useEffect } from 'react';
import { registerEmployee, updateEmployee } from '@/app/actions';
import { X, UserPlus, Loader2, Save } from 'lucide-react';

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'register' | 'edit';
  employee?: any | null;
}

// Must match the server-side nameRegex in actions.ts
const NAME_REGEX = /^[A-Za-z'\-.\s]+$/;

// Capitalize the first letter after word-boundary characters (space, hyphen, apostrophe)
function toNameCase(value: string): string {
  return value.replace(/(^|[\s\-'])([a-z])/g, (_, sep, letter) => sep + letter.toUpperCase());
}

function validateName(value: string, required: boolean): string | null {
  if (!value.trim()) return required ? 'This field is required.' : null;
  if (!NAME_REGEX.test(value)) return "Only letters, spaces, apostrophes ( ' ), hyphens ( - ), and periods ( . ) are allowed.";
  return null;
}

type NameField = 'fname' | 'mname' | 'lname';

export default function EmployeeModal({ isOpen, onClose, mode, employee }: EmployeeModalProps) {
  const currentAction = mode === 'register' ? registerEmployee : updateEmployee;
  const [state, action, pending] = useActionState(currentAction, null);

  const [fields, setFields] = useState({
    fname: employee?.fname || '',
    mname: employee?.mname || '',
    lname: employee?.lname || '',
    sex: employee?.sex?.trim() || '',
    birth_date: employee?.birth_date || '',
    address: employee?.address || '',
    role: employee?.role || '',
    hire_date: employee?.hire_date || '',
    contact_no: employee?.contact_no || '',
  });

  // Track which name fields have been blurred (interacted with)
  const [touched, setTouched] = useState<Record<NameField, boolean>>({
    fname: false,
    mname: false,
    lname: false,
  });

  // Computed per-field errors — only shown after the field has been touched
  const nameErrors: Record<NameField, string | null> = {
    fname: touched.fname ? validateName(fields.fname, true) : null,
    mname: touched.mname ? validateName(fields.mname, false) : null,
    lname: touched.lname ? validateName(fields.lname, true) : null,
  };

  const hasNameErrors = Object.values(nameErrors).some(Boolean);

  // Re-sync fields when the employee prop changes (e.g. switching which record to edit)
  useEffect(() => {
    setFields({
      fname: employee?.fname || '',
      mname: employee?.mname || '',
      lname: employee?.lname || '',
      sex: employee?.sex?.trim() || '',
      birth_date: employee?.birth_date || '',
      address: employee?.address || '',
      role: employee?.role || '',
      hire_date: employee?.hire_date || '',
      contact_no: employee?.contact_no || '',
    });
    setTouched({ fname: false, mname: false, lname: false });
  }, [employee]);

  useEffect(() => {
    if (state?.success) {
      onClose();
    }
  }, [state, onClose]);

  const set = (key: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setFields(prev => ({ ...prev, [key]: e.target.value }));

  // Like set(), but applies title-case transform for name fields
  const setName = (key: NameField) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFields(prev => ({ ...prev, [key]: toNameCase(e.target.value) }));

  const touch = (key: NameField) => () =>
    setTouched(prev => ({ ...prev, [key]: true }));

  // Touch all name fields on submit attempt so errors surface immediately
  const handleSubmitAttempt = () => {
    setTouched({ fname: true, mname: true, lname: true });
  };

  const inputBase = "w-full bg-input-bg border rounded-md py-2.5 px-4 text-sm text-foreground outline-none transition-all";
  const inputNormal = `${inputBase} border-input-border focus:border-input-focus`;
  const inputError = `${inputBase} border-red-500/60 focus:border-red-500`;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl bg-card-bg border border-card-border rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 transition-colors">
        <header className="px-6 py-5 border-b border-card-border flex items-center justify-between transition-colors">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-input-bg border border-input-border transition-colors">
              {mode === 'register' ? <UserPlus size={18} className="text-text-muted" /> : <Save size={18} className="text-text-muted" />}
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-foreground transition-colors">
                {mode === 'register' ? 'Register Employee' : 'Edit Employee Record'}
              </h3>
              {mode === 'edit' && <p className="text-[10px] text-text-dim uppercase tracking-widest font-medium transition-colors">ID: {employee?.e_id}</p>}
            </div>
          </div>
          <button onClick={onClose} className="text-text-dim hover:text-foreground transition-colors">
            <X size={20} />
          </button>
        </header>

        <form action={action} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {mode === 'edit' && <input type="hidden" name="e_id" value={employee?.e_id} />}

          {/* Name row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* First Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-dim ml-1 transition-colors">First Name</label>
              <input
                name="fname"
                type="text"
                required
                value={fields.fname}
                onChange={setName('fname')}
                onBlur={touch('fname')}
                className={nameErrors.fname ? inputError : inputNormal}
              />
              {nameErrors.fname && (
                <p className="text-[10px] text-red-500 ml-1 animate-in fade-in slide-in-from-top-1 duration-200">{nameErrors.fname}</p>
              )}
            </div>

            {/* Middle Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-dim ml-1 transition-colors">Middle Name</label>
              <input
                name="mname"
                type="text"
                value={fields.mname}
                onChange={setName('mname')}
                onBlur={touch('mname')}
                className={nameErrors.mname ? inputError : inputNormal}
              />
              {nameErrors.mname && (
                <p className="text-[10px] text-red-500 ml-1 animate-in fade-in slide-in-from-top-1 duration-200">{nameErrors.mname}</p>
              )}
            </div>

            {/* Last Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-dim ml-1 transition-colors">Last Name</label>
              <input
                name="lname"
                type="text"
                required
                value={fields.lname}
                onChange={setName('lname')}
                onBlur={touch('lname')}
                className={nameErrors.lname ? inputError : inputNormal}
              />
              {nameErrors.lname && (
                <p className="text-[10px] text-red-500 ml-1 animate-in fade-in slide-in-from-top-1 duration-200">{nameErrors.lname}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-dim ml-1 transition-colors">Sex</label>
              <select
                name="sex"
                required
                value={fields.sex}
                onChange={set('sex')}
                className="w-full bg-input-bg border border-input-border rounded-md py-2.5 px-4 text-sm text-foreground outline-none focus:border-input-focus transition-all appearance-none cursor-pointer"
              >
                <option value="" disabled className="bg-card-bg">Select</option>
                <option value="M" className="bg-card-bg">Male</option>
                <option value="F" className="bg-card-bg">Female</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-dim ml-1 transition-colors">Birth Date</label>
              <input
                name="birth_date"
                type="date"
                required
                value={fields.birth_date}
                onChange={set('birth_date')}
                className={inputNormal}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-text-dim ml-1 transition-colors">Address</label>
            <input
              name="address"
              type="text"
              required
              value={fields.address}
              onChange={set('address')}
              className={inputNormal}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-dim ml-1 transition-colors">Role</label>
              <select
                name="role"
                required
                value={fields.role}
                onChange={set('role')}
                className="w-full bg-input-bg border border-input-border rounded-md py-2.5 px-4 text-sm text-foreground outline-none focus:border-input-focus transition-all appearance-none cursor-pointer"
              >
                <option value="" disabled className="bg-card-bg">Select Role</option>
                <option value="admin" className="bg-card-bg">Admin</option>
                <option value="manager" className="bg-card-bg">Manager</option>
                <option value="employee" className="bg-card-bg">Employee</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-dim ml-1 transition-colors">Hire Date</label>
              <input
                name="hire_date"
                type="date"
                required
                value={fields.hire_date}
                onChange={set('hire_date')}
                className={inputNormal}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-dim ml-1 transition-colors">Contact No. (11 Digits)</label>
              <input
                name="contact_no"
                type="text"
                required
                maxLength={11}
                pattern="09[0-9]{9}"
                placeholder="09XXXXXXXXX"
                value={fields.contact_no}
                onChange={set('contact_no')}
                className={inputNormal}
              />
            </div>
          </div>

          {state?.error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-md text-[11px] text-red-500 font-medium animate-in slide-in-from-top-2">
              {state.error}
            </div>
          )}

          <div className="pt-6 border-t border-card-border transition-colors">
            <button
              type="submit"
              disabled={pending || hasNameErrors}
              onClick={handleSubmitAttempt}
              className="w-full flex items-center justify-center bg-primary-accent border border-primary-accent-border text-white py-4 rounded-md text-xs font-bold uppercase tracking-widest hover:bg-primary-accent-hover transition-all disabled:opacity-50"
            >
              {pending ? <Loader2 size={18} className="animate-spin" /> : mode === 'register' ? "Save Employee Record" : "Update Employee Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
