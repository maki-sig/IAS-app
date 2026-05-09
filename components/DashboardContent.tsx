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
    
    // Also fetch employees for the modal selection
    const { data: empListData } = await supabase
      .from('EMPLOYEE')
      .select('e_id, fname, lname')
      .order('lname');
    
    employees = empListData;

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
