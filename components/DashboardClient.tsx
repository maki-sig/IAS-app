"use client";

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  ShieldCheck, 
  ShieldPlus
} from 'lucide-react';
import CredentialModal from './CredentialModal';
import ResetPasswordModal from './ResetPasswordModal';

export default function DashboardClient({ tab, employees, logs, users }: { tab: string, employees: any[] | null, logs: any[] | null, users: any[] | null }) {
  const [isCredentialModalOpen, setIsCredentialModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [selectedUsername, setSelectedUsername] = useState<string | null>(null);

  const handleResetClick = (username: string) => {
    setSelectedUsername(username);
    setIsResetModalOpen(true);
  };

  return (
    <main className="flex-1 flex flex-col min-w-0 bg-transparent overflow-hidden">
      <header className="px-8 py-6 flex items-center justify-between border-b border-white/5">
        <div>
          <h2 className="text-lg font-light tracking-tight text-white/90 capitalize">{tab} Management</h2>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white/50 transition-colors" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-white/5 border border-white/5 rounded-md py-1.5 pl-8 pr-4 text-[11px] outline-none focus:border-white/20 transition-all w-48"
            />
          </div>
          {tab === 'employees' && (
            <button className="flex items-center gap-1.5 bg-white text-black px-3 py-1.5 rounded-md text-[11px] font-bold hover:bg-white/90 transition-all">
              <Plus size={12} />
              New Employee
            </button>
          )}
          {tab === 'credentials' && (
            <button 
              onClick={() => setIsCredentialModalOpen(true)}
              className="flex items-center gap-1.5 bg-white text-black px-3 py-1.5 rounded-md text-[11px] font-bold hover:bg-white/90 transition-all"
            >
              <ShieldPlus size={12} />
              New Credential
            </button>
          )}
        </div>
      </header>

      {/* Scrollable Table Area */}
      <div className="flex-1 overflow-auto p-8 pt-6">
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 h-full">
          {tab === 'employees' && (
            <div className="rounded-lg border border-white/10 bg-white/5 overflow-hidden backdrop-blur-xl shadow-2xl h-full flex flex-col">
              <div className="overflow-auto flex-1">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 z-10 bg-[#0c0c0c] shadow-[0_1px_0_rgba(255,255,255,0.05)]">
                    <tr className="text-[9px] uppercase tracking-[0.2em] text-white/50 font-bold">
                      <th className="py-4 px-6 font-semibold">Name</th>
                      <th className="py-4 px-6 font-semibold">Role</th>
                      <th className="py-4 px-6 font-semibold">Contact</th>
                      <th className="py-4 px-6 font-semibold">Hire Date</th>
                      <th className="py-4 px-6 font-semibold text-right pr-6">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {employees?.map((emp) => (
                      <tr key={emp.e_id} className="group hover:bg-white/[0.02] transition-all">
                        <td className="py-4 px-6">
                          <div className="flex flex-col">
                            <span className="text-[13px] font-medium text-white/80">{emp.fname} {emp.lname}</span>
                            <span className="text-[9px] text-white/20 uppercase tracking-tighter">{emp.sex} • {emp.birth_date}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-widest ${emp.role === 'admin' ? 'bg-blue-500/10 text-blue-400' : 'bg-white/5 text-white/30'}`}>
                            {emp.role}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-[12px] text-white/50 font-light">{emp.contact_no}</td>
                        <td className="py-4 px-6 text-[12px] text-white/50 font-light">{emp.hire_date}</td>
                        <td className="py-4 px-6 text-right pr-6">
                          <button className="text-[9px] font-bold uppercase tracking-widest text-white/15 hover:text-white transition-colors">Edit</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'credentials' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 pb-8">
              {users?.map((user) => (
                <div key={user.username} className="rounded-lg border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-xl hover:border-white/20 transition-all group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-8 w-8 flex items-center justify-center rounded-md bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors">
                      <ShieldCheck size={16} className="text-white/50" />
                    </div>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-widest ${user.failed_attempt_count >= 5 ? 'bg-red-500/10 text-red-400 animate-pulse' : 'bg-green-500/10 text-green-400'}`}>
                      {user.failed_attempt_count >= 5 ? 'Locked' : 'Active'}
                    </span>
                  </div>
                  <div className="space-y-0.5 mb-4">
                    <h3 className="text-base font-light text-white/90 tracking-tight">{user.username}</h3>
                    <p className="text-[9px] text-white/25 uppercase tracking-widest font-medium">
                      {user.EMPLOYEE ? `${user.EMPLOYEE.fname} ${user.EMPLOYEE.lname}` : 'System User'}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-white/15 uppercase font-bold tracking-widest">Failed Attempts</span>
                      <span className="text-xs font-medium text-white/50">{user.failed_attempt_count}</span>
                    </div>
                    <button 
                      onClick={() => handleResetClick(user.username)}
                      className="text-[9px] font-bold uppercase tracking-widest text-white/30 hover:text-white transition-colors"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              ))}
              {users?.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-white/20 border border-dashed border-white/10 rounded-lg">
                  <ShieldCheck size={48} strokeWidth={1} className="mb-4 opacity-50" />
                  <p className="text-sm">No user credentials found.</p>
                  <button onClick={() => setIsCredentialModalOpen(true)} className="mt-4 text-xs text-white/40 hover:text-white underline decoration-white/20 transition-all underline-offset-4">Create your first credential</button>
                </div>
              )}
            </div>
          )}

          {tab === 'logs' && (
            <div className="rounded-lg border border-white/10 bg-white/5 overflow-hidden backdrop-blur-xl shadow-2xl h-full flex flex-col">
              <div className="overflow-auto flex-1">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 z-10 bg-[#0c0c0c] shadow-[0_1px_0_rgba(255,255,255,0.05)]">
                    <tr className="text-[9px] uppercase tracking-[0.2em] text-white/50 font-bold">
                      <th className="py-4 px-6 font-semibold">Timestamp</th>
                      <th className="py-4 px-6 font-semibold">Username</th>
                      <th className="py-4 px-6 font-semibold">Status</th>
                      <th className="py-4 px-6 font-semibold text-right pr-6">Activity ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {logs?.map((log) => (
                      <tr key={log.log_id} className="group hover:bg-white/[0.02] transition-all">
                        <td className="py-4 px-6 text-[12px] text-white/50 font-light">
                          {new Date(log.login_timestamp).toLocaleString()}
                        </td>
                        <td className="py-4 px-6 text-[13px] font-medium text-white/70">{log.username}</td>
                        <td className="py-4 px-6">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-widest ${log.status === 'P' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                            {log.status === 'P' ? 'Pass' : 'Fail'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right pr-6 text-[9px] text-white/10 font-mono">#{log.log_id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      <CredentialModal isOpen={isCredentialModalOpen} onClose={() => setIsCredentialModalOpen(false)} />
      <ResetPasswordModal 
        isOpen={isResetModalOpen} 
        onClose={() => {
          setIsResetModalOpen(false);
          setSelectedUsername(null);
        }} 
        username={selectedUsername} 
      />
    </main>
  );
}
