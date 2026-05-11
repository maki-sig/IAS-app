"use client";

import React from 'react';
import { useTheme } from './ThemeProvider';
import { 
  Users, 
  History, 
  ShieldCheck, 
  LogOut,
  ChevronRight,
  Sun,
  Moon,
  User
} from 'lucide-react';
import { logout } from '@/app/actions';

interface SidebarProps {
  activeTab: string;
  username: string;
  onTabChange: (tab: string) => void;
}

export default function Sidebar({ activeTab, username, onTabChange }: SidebarProps) {
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'credentials', label: 'Credentials', icon: ShieldCheck },
    { id: 'logs', label: 'Login Logs', icon: History },
  ];

  return (
    <aside className="h-full w-64 flex-shrink-0 border-r border-sidebar-border bg-sidebar-bg backdrop-blur-3xl p-5 flex flex-col z-20 transition-colors duration-300">
      <div className="mb-10 px-2 flex justify-between items-start">
        <div>
          <h1 className="text-xs font-bold tracking-[0.1em] text-foreground uppercase transition-colors duration-300">ADMIN PORTAL</h1>
          <p className="text-[9px] uppercase tracking-[0.15em] text-text-dim font-medium mt-0.5 transition-colors duration-300">IAS - Management Hub by M. BOTIS</p>
        </div>
        <button 
          onClick={toggleTheme}
          className="p-1.5 rounded-md text-text-muted hover:text-foreground hover:bg-card-border transition-colors duration-300"
          title="Toggle Theme"
        >
          {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
        </button>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={`flex w-full items-center justify-between group px-3 py-2.5 rounded-md transition-all duration-300 ${
                isActive
                  ? 'bg-primary-accent border border-primary-accent-border text-white shadow-lg'
                  : 'text-text-muted hover:bg-card-border hover:text-foreground border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon size={16} strokeWidth={isActive ? 2 : 1.5} />
                <span className="text-[13px] font-medium tracking-wide">{item.label}</span>
              </div>
              {isActive && <ChevronRight size={12} className="text-white/80" />}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto pt-5 border-t border-sidebar-border space-y-3 transition-colors duration-300">
        <div className="flex items-center gap-3 px-3 py-2 rounded-md bg-card-bg border border-card-border transition-colors duration-300">
          <div className="h-8 w-8 rounded-full bg-primary-accent-bg flex items-center justify-center flex-shrink-0 transition-colors duration-300">
            <User size={14} className="text-primary-accent transition-colors duration-300" />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-[10px] text-text-dim uppercase font-bold tracking-widest transition-colors duration-300">Logged In As</span>
            <span className="text-sm font-medium text-foreground truncate transition-colors duration-300">{username}</span>
          </div>
        </div>

        <form action={logout}>
          <button className="flex w-full items-center gap-2.5 px-3 py-2.5 rounded-md bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 transition-all duration-300 group">
            <LogOut size={16} strokeWidth={1.5} className="group-hover:translate-x-1 transition-transform" />
            <span className="text-[13px] font-medium">Sign Out</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
