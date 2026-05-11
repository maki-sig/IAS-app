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
const NAME_REGEX    = /^[A-Za-z'\-.\s]+$/;
const ADDRESS_REGEX = /^[0-9A-Za-z.,\-\s]+$/;
const DATE_MIN = '1900-01-01';
const DATE_MAX = '2099-12-31';

// Capitalize the first letter after word-boundary characters (space, hyphen, apostrophe)
function toNameCase(value: string): string {
  return value.replace(/(^|[\s\-'])([a-z])/g, (_, sep, letter) => sep + letter.toUpperCase());
}

function validateName(value: string, required: boolean): string | null {
  if (!value.trim()) return required ? 'This field is required.' : null;
  if (!NAME_REGEX.test(value)) return "Only letters, spaces, apostrophes ( ' ), hyphens ( - ), and periods ( . ) are allowed.";
  return null;
}

function validateAddress(value: string): string | null {
  if (!value.trim()) return 'This field is required.';
  if (!ADDRESS_REGEX.test(value)) return 'Only letters, numbers, spaces, commas ( , ), periods ( . ), and hyphens ( - ) are allowed.';
  return null;
}

function validateDate(value: string, label: string): string | null {
  if (!value) return `${label} is required.`;
  const year = parseInt(value.split('-')[0], 10);
  if (isNaN(year) || year < 1900 || year > 2099) return `${label} must be between ${DATE_MIN} and ${DATE_MAX}.`;
  return null;
}

type NameField = 'fname' | 'mname' | 'lname';
type ValidatedField = NameField | 'address' | 'birth_date' | 'hire_date';

export default function EmployeeModal({ isOpen, onClose, mode, employee }: EmployeeModalProps) {
  const currentAction = mode === 'register' ? registerEmployee : updateEmployee;
  const [state, action, pending] = useActionState(currentAction, null);
  const [isClosing, setIsClosing] = useState(false);

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

  // Track which validated fields have been blurred (interacted with)
  const [touched, setTouched] = useState<Record<ValidatedField, boolean>>({
    fname: false, mname: false, lname: false,
    address: false, birth_date: false, hire_date: false,
  });

  // Computed per-field errors — only shown after the field has been touched
  const errors: Record<ValidatedField, string | null> = {
    fname:      touched.fname      ? validateName(fields.fname, true)           : null,
    mname:      touched.mname      ? validateName(fields.mname, false)          : null,
    lname:      touched.lname      ? validateName(fields.lname, true)           : null,
    address:    touched.address    ? validateAddress(fields.address)            : null,
    birth_date: touched.birth_date ? validateDate(fields.birth_date, 'Birth date') : null,
    hire_date:  touched.hire_date  ? validateDate(fields.hire_date, 'Hire date')   : null,
  };

  const hasErrors = Object.values(errors).some(Boolean);

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
    setTouched({ fname: false, mname: false, lname: false, address: false, birth_date: false, hire_date: false });
  }, [employee]);

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => onClose(), 180);
  };

  useEffect(() => {
    if (state?.success) {
      handleClose();
    }
  }, [state?.success]);

  const set = (key: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setFields(prev => ({ ...prev, [key]: e.target.value }));

  // Like set(), but applies title-case transform for name fields
  const setName = (key: NameField) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFields(prev => ({ ...prev, [key]: toNameCase(e.target.value) }));

  const touch = (key: ValidatedField) => () =>
    setTouched(prev => ({ ...prev, [key]: true }));

  // Touch all validated fields on submit attempt so all errors surface immediately
  const handleSubmitAttempt = () => {
    setTouched({ fname: true, mname: true, lname: true, address: true, birth_date: true, hire_date: true });
  };

  const inputBase = "w-full bg-input-bg border rounded-md py-2.5 px-4 text-sm text-foreground outline-none transition-all";
  const inputNormal = `${inputBase} border-input-border focus:border-input-focus`;
  const inputError  = `${inputBase} border-red-500/60 focus:border-red-500`;
  const cls = (key: ValidatedField) => errors[key] ? inputError : inputNormal;

  if (!isOpen && !isClosing) return null;

  return (
    <div
      onClick={handleClose}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 ${isClosing ? 'animate-overlay-fade-out' : 'animate-overlay-fade-in'}`}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className={`relative w-full max-w-2xl bg-card-bg border border-card-border rounded-xl shadow-2xl overflow-hidden transition-all ${isClosing ? 'animate-modal-exit' : 'animate-modal-slide-up'}`}
      >
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
          <button onClick={handleClose} className="text-text-dim hover:text-foreground transition-colors">
            <X size={20} />
          </button>
        </header>

        <form action={action} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {mode === 'edit' && <input type="hidden" name="e_id" value={employee?.e_id} />}

          {/* Name row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
            {/* First Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-dim ml-1 transition-colors">First Name</label>
              <input
                name="fname"
                type="text"
                required
                placeholder="Juan"
                value={fields.fname}
                onChange={setName('fname')}
                onBlur={touch('fname')}
                className={cls('fname')}
              />
              {errors.fname && (
                <p className="text-[10px] text-red-500 ml-1 animate-in fade-in slide-in-from-top-1 duration-200">{errors.fname}</p>
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
                className={cls('mname')}
              />
              {errors.mname && (
                <p className="text-[10px] text-red-500 ml-1 animate-in fade-in slide-in-from-top-1 duration-200">{errors.mname}</p>
              )}
            </div>

            {/* Last Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-dim ml-1 transition-colors">Last Name</label>
              <input
                name="lname"
                type="text"
                required
                placeholder="Dela Cruz"
                value={fields.lname}
                onChange={setName('lname')}
                onBlur={touch('lname')}
                className={cls('lname')}
              />
              {errors.lname && (
                <p className="text-[10px] text-red-500 ml-1 animate-in fade-in slide-in-from-top-1 duration-200">{errors.lname}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
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
                min={DATE_MIN}
                max={DATE_MAX}
                value={fields.birth_date}
                onChange={set('birth_date')}
                onBlur={touch('birth_date')}
                className={cls('birth_date')}
              />
              {errors.birth_date && (
                <p className="text-[10px] text-red-500 ml-1 animate-in fade-in slide-in-from-top-1 duration-200">{errors.birth_date}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5 animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
            <label className="text-[10px] font-bold uppercase tracking-widest text-text-dim ml-1 transition-colors">Address</label>
            <input
              name="address"
              type="text"
              required
              placeholder="House/Bldg No., Street, Subdivision/Village, Barangay, City/Municipality, Province, Zip Code"
              value={fields.address}
              onChange={set('address')}
              onBlur={touch('address')}
              className={cls('address')}
            />
            {errors.address && (
              <p className="text-[10px] text-red-500 ml-1 animate-in fade-in slide-in-from-top-1 duration-200">{errors.address}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
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
                min={DATE_MIN}
                max={DATE_MAX}
                value={fields.hire_date}
                onChange={set('hire_date')}
                onBlur={touch('hire_date')}
                className={cls('hire_date')}
              />
              {errors.hire_date && (
                <p className="text-[10px] text-red-500 ml-1 animate-in fade-in slide-in-from-top-1 duration-200">{errors.hire_date}</p>
              )}
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

          <div className="pt-6 border-t border-card-border transition-colors animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>
            <button
              type="submit"
              disabled={pending || hasErrors}
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
