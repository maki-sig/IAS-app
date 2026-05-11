"use client";

import React, { useState, useTransition, useMemo, useEffect } from 'react';
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
import Sidebar from './Sidebar';
import { deleteEmployee, deleteCredential } from '@/app/actions';

interface DashboardClientProps {
  username: string;
  initialTab: string;
  employees: any[] | null;
  logs: any[] | null;
  users: any[] | null;
  credentialEmployees: any[] | null;
}

export default function DashboardClient({
  username,
  initialTab,
  employees,
  logs,
  users,
  credentialEmployees,
}: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
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

  const [searchQuery, setSearchQuery] = useState('');
  const [isTabTransitioning, setIsTabTransitioning] = useState(false);
  const [searchAnimationKey, setSearchAnimationKey] = useState(0);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handleTabChange = (newTab: string) => {
    if (newTab === activeTab) return;

    setIsTabTransitioning(true);
    setTimeout(() => {
      setActiveTab(newTab);
      setIsTabTransitioning(false);
    }, 150);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setSearchAnimationKey(prev => prev + 1);
  };

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

  const visibleEmployees = employees ?? [];
  const visibleLogs = logs ?? [];
  const visibleUsers = users ?? [];
  const availableCredentialEmployees = credentialEmployees ?? [];

  const filteredEmployees = useMemo(() => {
    if (!visibleEmployees.length) return [];
    if (!searchQuery) return visibleEmployees;
    const query = searchQuery.toLowerCase();
    return visibleEmployees.filter((emp) =>
      emp.fname?.toLowerCase().includes(query) ||
      emp.lname?.toLowerCase().includes(query) ||
      emp.role?.toLowerCase().includes(query) ||
      emp.contact_no?.toLowerCase().includes(query) ||
      emp.address?.toLowerCase().includes(query)
    );
  }, [visibleEmployees, searchQuery]);

  const filteredUsers = useMemo(() => {
    if (!visibleUsers.length) return [];
    if (!searchQuery) return visibleUsers;
    const query = searchQuery.toLowerCase();
    return visibleUsers.filter((u) =>
      u.username?.toLowerCase().includes(query) ||
      u.EMPLOYEE?.fname?.toLowerCase().includes(query) ||
      u.EMPLOYEE?.lname?.toLowerCase().includes(query)
    );
  }, [visibleUsers, searchQuery]);

  const filteredLogs = useMemo(() => {
    if (!visibleLogs.length) return [];
    if (!searchQuery) return visibleLogs;
    const query = searchQuery.toLowerCase();
    return visibleLogs.filter((log) =>
      log.username?.toLowerCase().includes(query) ||
      log.status?.toLowerCase().includes(query) ||
      log.log_id?.toString().includes(query)
    );
  }, [visibleLogs, searchQuery]);

  return (
    <div className="flex-1 flex overflow-hidden">
      <Sidebar activeTab={activeTab} username={username} onTabChange={handleTabChange} />
      <main className="flex-1 flex flex-col min-w-0 bg-transparent overflow-hidden">
        <header className="px-8 py-6 flex items-center justify-between border-b border-sidebar-border transition-colors duration-300">
          <div>
            <h2 className={`text-lg font-light tracking-tight text-foreground capitalize transition-all duration-300 ${
              isTabTransitioning ? 'opacity-0 transform translate-y-2' : 'opacity-100 transform translate-y-0'
            }`}>{activeTab} Management</h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim group-focus-within:text-text-muted transition-colors" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="bg-input-bg border border-input-border rounded-md py-1.5 pl-8 pr-4 text-[11px] outline-none focus:border-input-focus focus:ring-2 focus:ring-primary-accent/20 transition-all duration-200 w-48 text-foreground"
              />
            </div>
            {activeTab === 'employees' && (
              <button
                type="button"
                onClick={handleNewEmployeeClick}
                className="flex items-center gap-1.5 bg-primary-accent border border-primary-accent-border text-white px-3 py-1.5 rounded-md text-[11px] font-bold hover:bg-primary-accent-hover transition-all"
              >
                <Plus size={12} />
                New Employee
              </button>
            )}
            {activeTab === 'credentials' && (
              <button
                type="button"
                onClick={() => setIsCredentialModalOpen(true)}
                className="flex items-center gap-1.5 bg-primary-accent border border-primary-accent-border text-white px-3 py-1.5 rounded-md text-[11px] font-bold hover:bg-primary-accent-hover transition-all"
              >
                <ShieldPlus size={12} />
                New Credential
              </button>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8 pt-6">
          <div className={`h-full transition-all duration-300 ${
            isTabTransitioning ? 'opacity-0 transform translate-x-4' : 'opacity-100 transform translate-x-0'
          }`}>
            {activeTab === 'employees' && (
              <div className="rounded-lg border border-card-border bg-card-bg overflow-hidden shadow-2xl h-full flex flex-col transition-colors duration-300">
                <div className="overflow-auto flex-1 flex flex-col">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 z-10 bg-table-header shadow-[0_1px_0_var(--color-table-border)] transition-colors duration-300">
                      <tr className="text-[9px] uppercase tracking-[0.2em] text-text-muted font-bold">
                        <th className="py-4 px-6 font-semibold">Name</th>
                        <th className="py-4 px-6 font-semibold">Role</th>
                        <th className="py-4 px-6 font-semibold">Contact</th>
                        <th className="py-4 px-6 font-semibold hidden lg:table-cell">Hire Date</th>
                        <th className="py-4 px-6 font-semibold hidden xl:table-cell">Address</th>
                        <th className="py-4 px-6 font-semibold text-right pr-6">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-table-border">
                      {filteredEmployees.map((emp, index) => (
                        <tr
                          key={emp.e_id}
                          className="group hover:bg-table-hover dark:hover:bg-white/10 hover:shadow-sm transition-all duration-200 cursor-default"
                          style={{
                            animationName: searchAnimationKey > 0 ? 'fadeInUp' : 'none',
                            animationDuration: '0.4s',
                            animationTimingFunction: 'ease-out',
                            animationDelay: `${index * 50}ms`,
                            animationFillMode: 'both'
                          }}
                        >
                          <td className="py-4 px-6">
                            <div className="flex flex-col">
                              <span className="text-[13px] font-medium text-foreground group-hover:text-foreground transition-colors duration-200">{emp.fname} {emp.lname}</span>
                              <span className="text-[9px] text-text-dim uppercase tracking-tighter group-hover:text-foreground transition-colors duration-200">{emp.sex} • {emp.birth_date}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-widest transition-all duration-200 ${
                              emp.role === 'admin' ? 'bg-blue-500/10 text-blue-500 group-hover:bg-blue-500/20' :
                              emp.role === 'manager' ? 'bg-purple-500/10 text-purple-500 group-hover:bg-purple-500/20' :
                              'bg-gray-500/10 text-gray-500 group-hover:bg-gray-500/20'
                            }`}>
                              {emp.role}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-[12px] text-text-muted font-light group-hover:text-foreground transition-colors duration-200">{emp.contact_no}</td>
                          <td className="py-4 px-6 text-[12px] text-text-muted font-light hidden lg:table-cell group-hover:text-foreground transition-colors duration-200">
                            {emp.hire_date ? new Date(emp.hire_date).toLocaleDateString() : '—'}
                          </td>
                          <td className="py-4 px-6 text-[12px] text-text-muted font-light hidden xl:table-cell max-w-[200px] group-hover:text-foreground transition-colors duration-200">
                            <p className="truncate" title={emp.address}>{emp.address || '—'}</p>
                          </td>
                          <td className="py-4 px-6 text-right pr-6">
                            <div className="flex items-center justify-end gap-4">
                              <button
                                type="button"
                                onClick={() => handleEditEmployeeClick(emp)}
                                className="text-[9px] font-bold uppercase tracking-widest text-text-dim hover:text-foreground hover:scale-110 active:scale-95 transition-all duration-200"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteEmployeeRequest(emp)}
                                className="text-text-dim hover:text-red-500 hover:scale-110 active:scale-95 transition-all duration-200"
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
                      <Search size={48} strokeWidth={1} className="mb-4 opacity-50 animate-pulse" />
                      <p className="text-sm">No employees matching "{searchQuery}"</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'credentials' && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 pb-8">
                {filteredUsers.map((user, index) => (
                  <div
                    key={user.username}
                    className="rounded-lg border border-card-border bg-card-bg p-5 shadow-xl hover:border-input-focus hover:shadow-2xl transition-all duration-300 group"
                    style={{
                      animationDelay: `${index * 75}ms`,
                      animation: searchAnimationKey > 0 ? `fadeInUp 0.5s ease-out ${index * 75}ms both` : 'none'
                    }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-8 w-8 flex items-center justify-center rounded-md bg-table-header border border-card-border group-hover:bg-table-hover transition-all duration-300">
                          <ShieldCheck size={16} className="text-text-muted group-hover:text-foreground transition-colors duration-300" />
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-widest transition-all duration-300 ${
                          user.failed_attempt_count >= 5 ? 'bg-red-500/10 text-red-500 animate-pulse' : 'bg-green-500/10 text-green-500'
                        }`}>
                          {user.failed_attempt_count >= 5 ? 'Locked' : 'Active'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteCredentialRequest(user.username)}
                          className="text-text-dim hover:text-red-500 hover:scale-110 active:scale-95 transition-all duration-200 opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-0.5 mb-4">
                      <h3 className="text-base font-light text-foreground tracking-tight">{user.username}</h3>
                      <p className="text-[9px] text-text-dim uppercase tracking-widest font-medium group-hover:text-text-muted transition-colors duration-200">
                        {user.EMPLOYEE ? `${user.EMPLOYEE.fname} ${user.EMPLOYEE.lname}` : 'System User'}
                      </p>
                    </div>
                    <div className="pt-4 border-t border-card-border flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-text-dim uppercase font-bold tracking-widest">Failed Attempts</span>
                        <span className="text-xs font-medium text-text-muted">{user.failed_attempt_count}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleResetClick(user.username)}
                        className="text-[9px] font-bold uppercase tracking-widest text-text-dim hover:text-foreground hover:scale-110 active:scale-95 transition-all duration-200"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                ))}
                {filteredUsers.length === 0 && (
                  <div className="col-span-full flex flex-col items-center justify-center py-20 text-text-dim border border-dashed border-card-border rounded-lg">
                    <Search size={48} strokeWidth={1} className="mb-4 opacity-50 animate-pulse" />
                    <p className="text-sm">No credentials matching "{searchQuery}"</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'logs' && (
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
                      {filteredLogs.map((log, index) => (
                        <tr
                          key={log.log_id}
                          className="group hover:bg-table-hover dark:hover:bg-white/10 hover:shadow-sm transition-all duration-200 cursor-pointer"
                          style={{
                            animationDelay: `${index * 50}ms`,
                            animation: searchAnimationKey > 0 ? `fadeInUp 0.4s ease-out ${index * 50}ms both` : 'none'
                          }}
                        >
                          <td className="py-4 px-6 text-[12px] text-text-muted font-light group-hover:text-foreground transition-colors duration-200">
                            {new Date(log.login_timestamp).toLocaleString()}
                          </td>
                          <td className="py-4 px-6 text-[13px] font-medium text-foreground group-hover:text-foreground transition-colors duration-200">{log.username}</td>
                          <td className="py-4 px-6">
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-widest transition-all duration-200 ${
                              log.status === 'P' ? 'bg-green-500/10 text-green-500 group-hover:bg-green-500/20' : 'bg-red-500/10 text-red-500 group-hover:bg-red-500/20'
                            }`}>
                              {log.status === 'P' ? 'Pass' : 'Fail'}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right pr-6 text-[9px] text-text-dim font-mono group-hover:text-foreground transition-colors duration-200">#{log.log_id}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredLogs.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center py-20 text-text-dim">
                      <Search size={48} strokeWidth={1} className="mb-4 opacity-50 animate-pulse" />
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
            employees={availableCredentialEmployees}
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
    </div>
  );
}
