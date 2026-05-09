"use client";

import React, { useState, useTransition, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  ShieldCheck, 
  ShieldPlus,
  Trash2
} from 'lucide-react';
import CredentialModal from './CredentialModal';
import ResetPasswordModal from './ResetPasswordModal';
import EmployeeModal from './EmployeeModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { deleteEmployee, deleteCredential } from '@/app/actions';

export default function DashboardClient({ tab, employees, logs, users }: { tab: string, employees: any[] | null, logs: any[] | null, users: any[] | null }) {
  const [isCredentialModalOpen, setIsCredentialModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [employeeModalMode, setEmployeeModalMode] = useState<'register' | 'edit'>('register');
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);
  const [selectedUsername, setSelectedUsername] = useState<string | null>(null);
  
  const [itemToDelete, setItemToDelete] = useState<any | null>(null);
  const [deleteType, setDeleteType] = useState<'employee' | 'credential' | null>(null);
  const [isPending, startTransition] = useTransition();

  const [searchQuery, setSearchQuery] = useState("");

  const handleResetClick = (username: string) => {
    setSelectedUsername(username);
    setIsResetModalOpen(true);
  };

  const handleNewEmployeeClick = () => {
    setEmployeeModalMode('register');
    setSelectedEmployee(null);
    setIsEmployeeModalOpen(true);
  };

  const handleEditEmployeeClick = (employee: any) => {
    setEmployeeModalMode('edit');
    setSelectedEmployee(employee);
    setIsEmployeeModalOpen(true);
  };

  const handleDeleteEmployeeRequest = (employee: any) => {
    setItemToDelete(employee);
    setDeleteType('employee');
    setIsDeleteModalOpen(true);
  };

  const handleDeleteCredentialRequest = (username: string) => {
    setItemToDelete(username);
    setDeleteType('credential');
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    startTransition(async () => {
      if (deleteType === 'employee') {
        await deleteEmployee(itemToDelete.e_id);
      } else if (deleteType === 'credential') {
        await deleteCredential(itemToDelete);
      }
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      setDeleteType(null);
    });
  };

  // Memoized filtered data with defensive checks
  const filteredEmployees = useMemo(() => {
    if (!employees) return [];
    if (!searchQuery) return employees;
    const query = searchQuery.toLowerCase();
    return employees.filter(emp => 
      emp.fname?.toLowerCase().includes(query) || 
      emp.lname?.toLowerCase().includes(query) || 
      emp.role?.toLowerCase().includes(query) ||
      emp.contact_no?.includes(query) ||
      emp.address?.toLowerCase().includes(query)
    );
  }, [employees, searchQuery]);

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    if (!searchQuery) return users;
    const query = searchQuery.toLowerCase();
    return users.filter(u => 
      u.username?.toLowerCase().includes(query) || 
      (u.EMPLOYEE?.fname?.toLowerCase().includes(query)) ||
      (u.EMPLOYEE?.lname?.toLowerCase().includes(query))
    );
  }, [users, searchQuery]);

  const filteredLogs = useMemo(() => {
    if (!logs) return [];
    if (!searchQuery) return logs;
    const query = searchQuery.toLowerCase();
    return logs.filter(log => 
      log.username?.toLowerCase().includes(query) || 
      log.status?.toLowerCase().includes(query) ||
      log.log_id?.toString().includes(query)
    );
  }, [logs, searchQuery]);

  return (
    <main className="flex-1 flex flex-col min-w-0 bg-transparent overflow-hidden">
      <header className="px-8 py-6 flex items-center justify-between border-b border-sidebar-border transition-colors duration-300">
        <div>
          <h2 className="text-lg font-light tracking-tight text-foreground capitalize transition-colors duration-300">{tab} Management</h2>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim group-focus-within:text-text-muted transition-colors" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-input-bg border border-input-border rounded-md py-1.5 pl-8 pr-4 text-[11px] outline-none focus:border-input-focus transition-all w-48 text-foreground"
            />
          </div>
          {tab === 'employees' && (
            <button 
              onClick={handleNewEmployeeClick}
              className="flex items-center gap-1.5 bg-primary-accent border border-primary-accent-border text-white px-3 py-1.5 rounded-md text-[11px] font-bold hover:bg-primary-accent-hover transition-all"
            >
              <Plus size={12} />
              New Employee
            </button>
          )}
          {tab === 'credentials' && (
            <button 
              onClick={() => setIsCredentialModalOpen(true)}
              className="flex items-center gap-1.5 bg-primary-accent border border-primary-accent-border text-white px-3 py-1.5 rounded-md text-[11px] font-bold hover:bg-primary-accent-hover transition-all"
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
            <div className="rounded-lg border border-card-border bg-card-bg overflow-hidden shadow-2xl h-full flex flex-col transition-colors duration-300">
              <div className="overflow-auto flex-1 flex flex-col">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 z-10 bg-table-header shadow-[0_1px_0_var(--color-table-border)] transition-colors duration-300">
                    <tr className="text-[9px] uppercase tracking-[0.2em] text-text-muted font-bold">
                      <th className="py-4 px-6 font-semibold">Name</th>
                      <th className="py-4 px-6 font-semibold">Role</th>
                      <th className="py-4 px-6 font-semibold">Contact</th>
                      <th className="py-4 px-6 font-semibold hidden lg:table-cell">
                        Hire Date
                      </th>
                      <th className="py-4 px-6 font-semibold hidden xl:table-cell">
                        Address
                      </th>
                      <th className="py-4 px-6 font-semibold text-right pr-6">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-table-border">
                    {filteredEmployees.map((emp) => (
                      <tr key={emp.e_id} className="group hover:bg-table-hover transition-all">
                        <td className="py-4 px-6">
                          <div className="flex flex-col">
                            <span className="text-[13px] font-medium text-foreground">{emp.fname} {emp.lname}</span>
                            <span className="text-[9px] text-text-dim uppercase tracking-tighter">{emp.sex} • {emp.birth_date}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-widest ${emp.role === 'admin' ? 'bg-blue-500/10 text-blue-500' : emp.role === 'manager' ? 'bg-purple-500/10 text-purple-500' : 'bg-gray-500/10 text-gray-500'}`}>
                            {emp.role}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-[12px] text-text-muted font-light">{emp.contact_no}</td>
                        <td className="py-4 px-6 text-[12px] text-text-muted font-light hidden lg:table-cell">
                          {emp.hire_date ? new Date(emp.hire_date).toLocaleDateString() : '—'}
                        </td>
                        <td className="py-4 px-6 text-[12px] text-text-muted font-light hidden xl:table-cell max-w-[200px]">
                          <p className="truncate" title={emp.address}>{emp.address || '—'}</p>
                        </td>
                        <td className="py-4 px-6 text-right pr-6">
                          <div className="flex items-center justify-end gap-4">
                            <button 
                              onClick={() => handleEditEmployeeClick(emp)}
                              className="text-[9px] font-bold uppercase tracking-widest text-text-dim hover:text-foreground transition-colors"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteEmployeeRequest(emp)}
                              className="text-text-dim hover:text-red-500 transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredEmployees.length === 0 && (
                  <div className="flex-1 flex flex-col items-center justify-center py-20 text-text-dim">
                    <Search size={48} strokeWidth={1} className="mb-4 opacity-50" />
                    <p className="text-sm">No employees matching "{searchQuery}"</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'credentials' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 pb-8">
              {filteredUsers.map((user) => (
                <div key={user.username} className="rounded-lg border border-card-border bg-card-bg p-5 shadow-xl hover:border-input-focus transition-all group duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-8 w-8 flex items-center justify-center rounded-md bg-table-header border border-card-border group-hover:bg-table-hover transition-colors">
                      <ShieldCheck size={16} className="text-text-muted" />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-widest ${user.failed_attempt_count >= 5 ? 'bg-red-500/10 text-red-500 animate-pulse' : 'bg-green-500/10 text-green-500'}`}>
                        {user.failed_attempt_count >= 5 ? 'Locked' : 'Active'}
                      </span>
                      <button 
                        onClick={() => handleDeleteCredentialRequest(user.username)}
                        className="text-text-dim hover:text-red-500 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-0.5 mb-4">
                    <h3 className="text-base font-light text-foreground tracking-tight">{user.username}</h3>
                    <p className="text-[9px] text-text-dim uppercase tracking-widest font-medium">
                      {user.EMPLOYEE ? `${user.EMPLOYEE.fname} ${user.EMPLOYEE.lname}` : 'System User'}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-card-border flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-text-dim uppercase font-bold tracking-widest">Failed Attempts</span>
                      <span className="text-xs font-medium text-text-muted">{user.failed_attempt_count}</span>
                    </div>
                    <button 
                      onClick={() => handleResetClick(user.username)}
                      className="text-[9px] font-bold uppercase tracking-widest text-text-dim hover:text-foreground transition-colors"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              ))}
              {filteredUsers.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-text-dim border border-dashed border-card-border rounded-lg">
                  <Search size={48} strokeWidth={1} className="mb-4 opacity-50" />
                  <p className="text-sm">No credentials matching "{searchQuery}"</p>
                </div>
              )}
            </div>
          )}

          {tab === 'logs' && (
            <div className="rounded-lg border border-card-border bg-card-bg overflow-hidden shadow-2xl h-full flex flex-col transition-colors duration-300">
              <div className="overflow-auto flex-1 flex flex-col">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 z-10 bg-table-header shadow-[0_1px_0_var(--color-table-border)] transition-colors duration-300">
                    <tr className="text-[9px] uppercase tracking-[0.2em] text-text-muted font-bold">
                      <th className="py-4 px-6 font-semibold">Timestamp</th>
                      <th className="py-4 px-6 font-semibold">Username</th>
                      <th className="py-4 px-6 font-semibold">Status</th>
                      <th className="py-4 px-6 font-semibold text-right pr-6">Activity ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-table-border">
                    {filteredLogs.map((log) => (
                      <tr key={log.log_id} className="group hover:bg-table-hover transition-all">
                        <td className="py-4 px-6 text-[12px] text-text-muted font-light">
                          {new Date(log.login_timestamp).toLocaleString()}
                        </td>
                        <td className="py-4 px-6 text-[13px] font-medium text-foreground">{log.username}</td>
                        <td className="py-4 px-6">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-widest ${log.status === 'P' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                            {log.status === 'P' ? 'Pass' : 'Fail'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right pr-6 text-[9px] text-text-dim font-mono">#{log.log_id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredLogs.length === 0 && (
                  <div className="flex-1 flex flex-col items-center justify-center py-20 text-text-dim">
                    <Search size={48} strokeWidth={1} className="mb-4 opacity-50" />
                    <p className="text-sm">No activity logs matching "{searchQuery}"</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {isCredentialModalOpen && (
        <CredentialModal 
          isOpen={isCredentialModalOpen} 
          onClose={() => setIsCredentialModalOpen(false)} 
          employees={employees}
        />
      )}
      {isResetModalOpen && (
        <ResetPasswordModal 
          isOpen={isResetModalOpen} 
          onClose={() => {
            setIsResetModalOpen(false);
            setSelectedUsername(null);
          }} 
          username={selectedUsername} 
        />
      )}
      {isEmployeeModalOpen && (
        <EmployeeModal 
          isOpen={isEmployeeModalOpen} 
          onClose={() => setIsEmployeeModalOpen(false)} 
          mode={employeeModalMode}
          employee={selectedEmployee}
        />
      )}
      {isDeleteModalOpen && (
        <DeleteConfirmationModal 
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          title={deleteType === 'employee' ? 'Terminate Personnel Record' : 'Revoke System Access'}
          message={
            deleteType === 'employee' 
              ? `Warning: Deleting ${itemToDelete?.fname} ${itemToDelete?.lname} will permanently remove their record AND automatically revoke any active system credentials. This action cannot be undone.`
              : `Warning: Deleting the credentials for "${itemToDelete}" will immediately block system access for this user. Personnel data will remain intact.`
          }
          isPending={isPending}
        />
      )}
    </main>
  );
}
