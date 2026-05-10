"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { encryptFields, ENCRYPTED_FIELDS } from "@/utils/encryption";

// Security Validation Helper
const validateSecurityInput = (value: string, fieldName: string) => {
  const forbiddenChars = /[<>"';()]/;
  if (forbiddenChars.test(value)) {
    return `${fieldName} contains forbidden characters for security reasons.`;
  }
  return null;
};

const nameRegex    = /^[A-Za-z'\-.\s]+$/;
const addressRegex = /^[0-9A-Za-z.,\-\s]+$/;
const dateRegex    = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const phMobileRegex = /^09\d{9}$/;

// Returns an error string if date is invalid/out of range, null otherwise
function validateDate(value: string, label: string): string | null {
  if (!value) return `${label} is required.`;
  if (!dateRegex.test(value)) return `${label} must be in YYYY-MM-DD format.`;
  const d = new Date(value);
  const year = d.getUTCFullYear();
  if (year < 1900 || year > 2099) return `${label} must be between 1900-01-01 and 2099-12-31.`;
  return null;
}

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

  // Username: 1–39 chars, allowed chars, no consecutive hyphens
  const usernameRegex = /^[A-Za-z0-9-]+$/;
  if (!username || username.length < 1 || username.length > 39) {
    return { error: "Username must be between 1 and 39 characters." };
  }
  if (!usernameRegex.test(username)) {
    return { error: "Username contains invalid characters." };
  }
  if (/--/.test(username)) {
    return { error: "Username cannot contain consecutive hyphens." };
  }

  // Password complexity: min 8, uppercase, lowercase, digit, symbol
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters long." };
  }
  if (!/[A-Z]/.test(password)) {
    return { error: "Password must contain at least one uppercase letter." };
  }
  if (!/[a-z]/.test(password)) {
    return { error: "Password must contain at least one lowercase letter." };
  }
  if (!/[0-9]/.test(password)) {
    return { error: "Password must contain at least one number." };
  }
  if (!/[!@#$%^&*()_+\-=]/.test(password)) {
    return { error: "Password must contain at least one symbol." };
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

  // Guard: ensure this employee doesn't already have credentials (1:1 enforcement)
  const { data: existingCredByEmp } = await supabase
    .from("USER")
    .select("username")
    .eq("e_id", parseInt(e_id))
    .single();

  if (existingCredByEmp) {
    return { error: "This employee already has credentials assigned." };
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

  // Password complexity: min 8, uppercase, lowercase, digit, symbol
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters long." };
  }
  if (!/[A-Z]/.test(password)) {
    return { error: "Password must contain at least one uppercase letter." };
  }
  if (!/[a-z]/.test(password)) {
    return { error: "Password must contain at least one lowercase letter." };
  }
  if (!/[0-9]/.test(password)) {
    return { error: "Password must contain at least one number." };
  }
  if (!/[!@#$%^&*()_+\-=]/.test(password)) {
    return { error: "Password must contain at least one symbol." };
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
    return { error: "Names may only contain letters, spaces, apostrophes, hyphens, and periods." };
  }

  if (address && !addressRegex.test(address)) {
    return { error: "Address may only contain letters, numbers, spaces, commas, periods, and hyphens." };
  }

  const birthDateError = validateDate(birth_date, 'Birth date');
  if (birthDateError) return { error: birthDateError };

  const hireDateError = validateDate(hire_date, 'Hire date');
  if (hireDateError) return { error: hireDateError };

  if (!phMobileRegex.test(contact_no)) {
    return { error: "Contact number must be exactly 11 digits and start with 09 (Philippine Standard)." };
  }

  const supabase = await createClient();

  // Encrypt sensitive fields before storing
  const employeeData = {
    fname, mname, lname, sex, address, birth_date, role, hire_date, contact_no
  };
  const encryptedData = encryptFields(employeeData, ENCRYPTED_FIELDS as any);

  const { error } = await supabase.from("EMPLOYEE").insert(encryptedData);

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
    return { error: "Names may only contain letters, spaces, apostrophes, hyphens, and periods." };
  }

  if (address && !addressRegex.test(address)) {
    return { error: "Address may only contain letters, numbers, spaces, commas, periods, and hyphens." };
  }

  const birthDateError = validateDate(birth_date, 'Birth date');
  if (birthDateError) return { error: birthDateError };

  const hireDateError = validateDate(hire_date, 'Hire date');
  if (hireDateError) return { error: hireDateError };

  if (!phMobileRegex.test(contact_no)) {
    return { error: "Contact number must be exactly 11 digits and start with 09 (Philippine Standard)." };
  }

  const supabase = await createClient();

  // Encrypt sensitive fields before storing
  const employeeData = {
    fname, mname, lname, sex, address, birth_date, role, hire_date, contact_no
  };
  const encryptedData = encryptFields(employeeData, ENCRYPTED_FIELDS as any);

  const { error } = await supabase.from("EMPLOYEE").update(encryptedData).eq("e_id", parseInt(e_id));

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
