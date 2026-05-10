import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { decryptFields, ENCRYPTED_FIELDS } from '@/utils/encryption';
import DashboardClient from '@/components/DashboardClient';

export default async function DashboardContent({ initialTab, username }: { initialTab: string; username: string }) {
  const supabase = await createClient();

  const [employeeResult, logResult, userResult, employeeListResult] = await Promise.all([
    supabase.from('EMPLOYEE').select('*').order('lname'),
    supabase.from('LOGIN_LOGS').select('*').order('login_timestamp', { ascending: false }).limit(100),
    supabase.from('USER').select('*').order('username'),
    supabase.from('EMPLOYEE').select('e_id, fname, lname').order('lname'),
  ]);

  const employees = employeeResult.data
    ? employeeResult.data.map((emp) => decryptFields(emp, ENCRYPTED_FIELDS as any))
    : [];

  const rawEmployeeList = employeeListResult.data
    ? employeeListResult.data.map((emp) => decryptFields(emp, ['fname', 'lname'] as any))
    : [];

  const users = userResult.data
    ? userResult.data.map((user) => ({
        ...user,
        EMPLOYEE: rawEmployeeList.find((emp) => emp.e_id === user.e_id) || null,
      }))
    : [];

  const credentialEmployees = rawEmployeeList.filter(
    (employee) => !users.some((user) => user.e_id === employee.e_id)
  );

  return (
    <DashboardClient
      username={username}
      initialTab={initialTab}
      employees={employees}
      logs={logResult.data ?? []}
      users={users}
      credentialEmployees={credentialEmployees}
    />
  );
}
