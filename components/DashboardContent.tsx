import React from 'react';
import { createClient } from '@/utils/supabase/server';
import DashboardClient from '@/components/DashboardClient';

export default async function DashboardContent({ tab }: { tab: string }) {
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
    // Fetch both users AND employee list for the 'New Credential' modal dropdown
    const { data: userData, error: userError } = await supabase
      .from('USER')
      .select('*')
      .order('username');
    
    // Fetch employees who do NOT yet have credentials (1:1 enforcement at data layer)
    const { data: usersWithCreds } = await supabase
      .from('USER')
      .select('e_id');

    const credentialledIds = new Set((usersWithCreds || []).map((u: any) => u.e_id));

    const { data: empListData } = await supabase
      .from('EMPLOYEE')
      .select('e_id, fname, lname')
      .order('lname');

    // Only offer employees without credentials in the dropdown
    employees = (empListData || []).filter((e: any) => !credentialledIds.has(e.e_id));

    if (userError) {
      console.error("Error fetching users:", userError);
    } else if (userData) {
      const empMap = new Map(empListData?.map(e => [e.e_id, e]));
      users = userData.map(u => ({
        ...u,
        EMPLOYEE: empMap.get(u.e_id) || null
      }));
    }
  }

  return <DashboardClient tab={tab} employees={employees} logs={logs} users={users} />;
}
