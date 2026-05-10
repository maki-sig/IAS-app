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
  }, [employee]);

  useEffect(() => {
    if (state?.success) {
      onClose();
    }
  }, [state, onClose]);

  const set = (key: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setFields(prev => ({ ...prev, [key]: e.target.value }));

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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-dim ml-1 transition-colors">First Name</label>
              <input
                name="fname"
                type="text"
                required
                value={fields.fname}
                onChange={set('fname')}
                className="w-full bg-input-bg border border-input-border rounded-md py-2.5 px-4 text-sm text-foreground outline-none focus:border-input-focus transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-dim ml-1 transition-colors">Middle Name</label>
              <input
                name="mname"
                type="text"
                value={fields.mname}
                onChange={set('mname')}
                className="w-full bg-input-bg border border-input-border rounded-md py-2.5 px-4 text-sm text-foreground outline-none focus:border-input-focus transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-dim ml-1 transition-colors">Last Name</label>
              <input
                name="lname"
                type="text"
                required
                value={fields.lname}
                onChange={set('lname')}
                className="w-full bg-input-bg border border-input-border rounded-md py-2.5 px-4 text-sm text-foreground outline-none focus:border-input-focus transition-all"
              />
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
                className="w-full bg-input-bg border border-input-border rounded-md py-2.5 px-4 text-sm text-foreground outline-none focus:border-input-focus transition-all"
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
              className="w-full bg-input-bg border border-input-border rounded-md py-2.5 px-4 text-sm text-foreground outline-none focus:border-input-focus transition-all"
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
                className="w-full bg-input-bg border border-input-border rounded-md py-2.5 px-4 text-sm text-foreground outline-none focus:border-input-focus transition-all"
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
                className="w-full bg-input-bg border border-input-border rounded-md py-2.5 px-4 text-sm text-foreground outline-none focus:border-input-focus transition-all"
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
              disabled={pending}
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
