import React from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { logout } from '@/app/actions';
import { 
  Users, 
  History, 
  ShieldCheck, 
  LogOut,
  ChevronRight
} from 'lucide-react';
import DashboardClient from '@/components/DashboardClient';

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const { tab = 'employees' } = await searchParams;
  const supabase = await createClient();

  // Optimized conditional data fetching
  let employees = null;
  let logs = null;
  let users = null;

  if (tab === 'employees') {
    const { data } = await supabase.from('EMPLOYEE').select('*').order('lname');
    employees = data;
  } else if (tab === 'logs') {
    const { data } = await supabase.from('LOGIN_LOGS').select('*').order('login_timestamp', { ascending: false }).limit(100);
    logs = data;
  } else if (tab === 'credentials') {
    // Manual Join Strategy: Fetch users and employees separately to avoid ambiguous relationship errors
    const { data: userData, error: userError } = await supabase
      .from('USER')
      .select('*')
      .order('username');
    
    if (userError) {
      console.error("Error fetching users:", userError);
    } else if (userData) {
      const employeeIds = userData.map(u => u.e_id).filter(id => id !== null);
      const { data: empData } = await supabase
        .from('EMPLOYEE')
        .select('e_id, fname, lname')
        .in('e_id', employeeIds);
      
      const empMap = new Map(empData?.map(e => [e.e_id, e]));
      users = userData.map(u => ({
        ...u,
        EMPLOYEE: empMap.get(u.e_id) || null
      }));
    }
  }

  const navItems = [
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'credentials', label: 'Credentials', icon: ShieldCheck },
    { id: 'logs', label: 'Login Logs', icon: History },
  ];

  return (
    <div className="flex h-screen bg-[#050505] text-white selection:bg-white/20 overflow-hidden">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-purple-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Sidebar */}
      <aside className="h-full w-64 flex-shrink-0 border-r border-white/5 bg-black/20 backdrop-blur-3xl p-5 flex flex-col">
        <div className="mb-10 px-2">
          <h1 className="text-xs font-bold tracking-[0.1em] text-white/90 uppercase">ADMIN PORTAL</h1>
          <p className="text-[9px] uppercase tracking-[0.15em] text-white/25 font-medium mt-0.5">IAS - Management Hub</p>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = tab === item.id;
            return (
              <Link 
                key={item.id}
                href={`?tab=${item.id}`}
                className={`flex items-center justify-between group px-3 py-2.5 rounded-md transition-all duration-300 ${
                  isActive 
                    ? 'bg-white/10 text-white border border-white/10 shadow-lg' 
                    : 'text-white/30 hover:bg-white/5 hover:text-white/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={16} strokeWidth={isActive ? 2 : 1.5} />
                  <span className="text-[13px] font-medium tracking-wide">{item.label}</span>
                </div>
                {isActive && <ChevronRight size={12} className="text-white/30" />}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-5 border-t border-white/5">
          <form action={logout}>
            <button className="flex w-full items-center gap-2.5 px-3 py-2.5 rounded-md text-white/30 hover:bg-red-500/5 hover:text-red-400 transition-all duration-300 group">
              <LogOut size={16} strokeWidth={1.5} />
              <span className="text-[13px] font-medium">Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <DashboardClient tab={tab} employees={employees} logs={logs} users={users} />
    </div>
  );
}
