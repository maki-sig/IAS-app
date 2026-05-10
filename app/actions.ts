"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import crypto from "crypto";
import { revalidatePath } from "next/cache";

// Security Validation Helper
const validateSecurityInput = (value: string, fieldName: string) => {
  const forbiddenChars = /[<>"';()]/;
  if (forbiddenChars.test(value)) {
    return `${fieldName} contains forbidden characters for security reasons.`;
  }
  return null;
};

const nameRegex = /^[A-Za-z'\-.\s]+$/;
const phMobileRegex = /^09\d{9}$/;

export async function login(state: any, formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { error: "Username and password are required" };
  }

  const supabase = await createClient();

  const { data: user, error: userError } = await supabase
    .from("USER")
    .select("*")
    .eq("username", username)
    .single();

  if (userError || !user) {
    await logAttempt(username, "F");
    return { error: "Invalid credentials" };
  }

  if (user.failed_attempt_count >= 5) {
    const lastAttempt = new Date(user.last_failed_attempt).getTime();
    const now = new Date().getTime();
    const diffMinutes = (now - lastAttempt) / (1000 * 60);

    if (diffMinutes < 5) {
      const remainingMinutes = Math.ceil(5 - diffMinutes);
      return { 
        error: `Account locked due to too many failed attempts. Please try again in ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}.` 
      };
    }
  }

  const hashedInput = crypto.createHash('sha256').update(password).digest('hex');
  const storedHash = user.hash_password.trim();
  const isValid = hashedInput === storedHash;

  if (!isValid) {
    await supabase
      .from("USER")
      .update({
        failed_attempt_count: (user.failed_attempt_count || 0) + 1,
        last_failed_attempt: new Date().toISOString(),
      })
      .eq("user_id", user.user_id);

    await logAttempt(username, "F");
    return { error: "Invalid credentials" };
  }

  await supabase
    .from("USER")
    .update({
      failed_attempt_count: 0,
      last_failed_attempt: null,
    })
    .eq("user_id", user.user_id);

  await logAttempt(username, "P");

  const { data: employee, error: empError } = await supabase
    .from("EMPLOYEE")
    .select("role")
    .eq("e_id", user.e_id)
    .single();

  if (empError || !employee) {
    return { error: "Employee record not found" };
  }

  const cookieStore = await cookies();
  cookieStore.set("user_role", employee.role, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  cookieStore.set("username", username, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  if (employee.role === "admin") {
    redirect("/dashboard");
  } else {
    redirect("/welcome");
  }
}

export async function createCredential(state: any, formData: FormData) {
  const e_id = formData.get("e_id") as string;
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!e_id || !username || !password || !confirmPassword) {
    return { error: "All fields are required" };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" };
  }

  const usernameRegex = /^[a-zA-Z0-9._-]+$/;
  if (!usernameRegex.test(username)) {
    return { error: "Invalid username format." };
  }

  const forbiddenChars = /[<>"';()]/;
  if (forbiddenChars.test(password)) {
    return { error: "Password contains forbidden characters." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters long." };
  }

  const supabase = await createClient();

  const { data: employee, error: empError } = await supabase
    .from("EMPLOYEE")
    .select("e_id")
    .eq("e_id", parseInt(e_id))
    .single();

  if (empError || !employee) {
    return { error: "Employee ID not found" };
  }

  const { data: existingUser } = await supabase
    .from("USER")
    .select("username")
    .eq("username", username)
    .single();

  if (existingUser) {
    return { error: "Username already exists" };
  }

  const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

  const { error: insertError } = await supabase
    .from("USER")
    .insert({
      e_id: parseInt(e_id),
      username: username,
      hash_password: hashedPassword,
      failed_attempt_count: 0
    });

  if (insertError) {
    console.error(insertError);
    return { error: "Failed to create credential" };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function resetPassword(state: any, formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!username || !password || !confirmPassword) {
    return { error: "All fields are required" };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" };
  }

  const forbiddenChars = /[<>"';()]/;
  if (forbiddenChars.test(password)) {
    return { error: "Password contains forbidden characters." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters long." };
  }

  const supabase = await createClient();
  const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

  const { error: updateError } = await supabase
    .from("USER")
    .update({
      hash_password: hashedPassword,
      failed_attempt_count: 0,
      last_failed_attempt: null
    })
    .eq("username", username);

  if (updateError) {
    console.error(updateError);
    return { error: "Failed to reset password" };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function registerEmployee(state: any, formData: FormData) {
  const fields = ['fname', 'mname', 'lname', 'address', 'contact_no'];
  for (const field of fields) {
    const val = formData.get(field) as string;
    if (val) {
      const error = validateSecurityInput(val, field);
      if (error) return { error };
    }
  }

  const fname = formData.get("fname") as string;
  const mname = formData.get("mname") as string;
  const lname = formData.get("lname") as string;
  const sex = formData.get("sex") as string;
  const address = formData.get("address") as string;
  const birth_date = formData.get("birth_date") as string;
  const role = formData.get("role") as string;
  const hire_date = formData.get("hire_date") as string;
  const contact_no = formData.get("contact_no") as string;

  if (!fname || !lname || !sex || !role || !hire_date || !contact_no) {
    return { error: "Required fields are missing." };
  }

  if (!nameRegex.test(fname) || !nameRegex.test(lname) || (mname && !nameRegex.test(mname))) {
    return { error: "Names can only contain letters, numbers, spaces, dots, and hyphens." };
  }

  if (!phMobileRegex.test(contact_no)) {
    return { error: "Contact number must be exactly 11 digits and start with 09 (Philippine Standard)." };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("EMPLOYEE").insert({
    fname, mname, lname, sex, address, birth_date, role, hire_date, contact_no
  });

  if (error) {
    console.error(error);
    return { error: "Failed to register employee." };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateEmployee(state: any, formData: FormData) {
  const e_id = formData.get("e_id") as string;
  if (!e_id) return { error: "Employee ID is missing." };

  const fields = ['fname', 'mname', 'lname', 'address', 'contact_no'];
  for (const field of fields) {
    const val = formData.get(field) as string;
    if (val) {
      const error = validateSecurityInput(val, field);
      if (error) return { error };
    }
  }

  const fname = formData.get("fname") as string;
  const mname = formData.get("mname") as string;
  const lname = formData.get("lname") as string;
  const sex = formData.get("sex") as string;
  const address = formData.get("address") as string;
  const birth_date = formData.get("birth_date") as string;
  const role = formData.get("role") as string;
  const hire_date = formData.get("hire_date") as string;
  const contact_no = formData.get("contact_no") as string;

  if (!fname || !lname || !sex || !role || !hire_date || !contact_no) {
    return { error: "Required fields are missing." };
  }

  if (!nameRegex.test(fname) || !nameRegex.test(lname) || (mname && !nameRegex.test(mname))) {
    return { error: "Names can only contain letters, numbers, spaces, dots, and hyphens." };
  }

  if (!phMobileRegex.test(contact_no)) {
    return { error: "Contact number must be exactly 11 digits and start with 09 (Philippine Standard)." };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("EMPLOYEE").update({
    fname, mname, lname, sex, address, birth_date, role, hire_date, contact_no
  }).eq("e_id", parseInt(e_id));

  if (error) {
    console.error(error);
    return { error: "Failed to update employee." };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteEmployee(e_id: number) {
  const supabase = await createClient();

  const { error: userDeleteError } = await supabase
    .from("USER")
    .delete()
    .eq("e_id", e_id);

  if (userDeleteError) {
    console.error("Error deleting associated user:", userDeleteError);
    return { error: "Failed to delete associated user credentials." };
  }

  const { error: empDeleteError } = await supabase
    .from("EMPLOYEE")
    .delete()
    .eq("e_id", e_id);

  if (empDeleteError) {
    console.error("Error deleting employee:", empDeleteError);
    return { error: "Failed to delete employee record." };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteCredential(username: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("USER")
    .delete()
    .eq("username", username);

  if (error) {
    console.error("Error deleting credential:", error);
    return { error: "Failed to delete credential." };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

async function logAttempt(username: string, status: "P" | "F") {
  const supabase = await createClient();
  await supabase.from("LOGIN_LOGS").insert({
    username: username,
    status: status,
    login_timestamp: new Date().toISOString(),
  });
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("user_role");
  cookieStore.delete("username");
  redirect("/");
}
