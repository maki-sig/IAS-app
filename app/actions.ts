"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import crypto from "crypto";
import { revalidatePath } from "next/cache";

export async function login(state: any, formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { error: "Username and password are required" };
  }

  const supabase = await createClient();

  // 1. Fetch user from USER table
  const { data: user, error: userError } = await supabase
    .from("USER")
    .select("*")
    .eq("username", username)
    .single();

  if (userError || !user) {
    await logAttempt(username, "F");
    return { error: "Invalid credentials" };
  }

  // 2. Check for Account Lockout (5 failed attempts = 5 min lockout)
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

  // 3. Verify password hash using SHA256
  const hashedInput = crypto.createHash('sha256').update(password).digest('hex');
  const storedHash = user.hash_password.trim();
  const isValid = hashedInput === storedHash;

  if (!isValid) {
    // Increment failed_attempt_count and log the time
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

  // 4. Success! Reset failed attempts
  await supabase
    .from("USER")
    .update({
      failed_attempt_count: 0,
      last_failed_attempt: null,
    })
    .eq("user_id", user.user_id);

  await logAttempt(username, "P");

  // 5. Fetch role from EMPLOYEE
  const { data: employee, error: empError } = await supabase
    .from("EMPLOYEE")
    .select("role")
    .eq("e_id", user.e_id)
    .single();

  if (empError || !employee) {
    return { error: "Employee record not found" };
  }

  // 6. Set a simple session cookie
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

  // 7. Redirect based on role
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

  // Cybersecurity Validation
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

  // Check if employee exists
  const { data: employee, error: empError } = await supabase
    .from("EMPLOYEE")
    .select("e_id")
    .eq("e_id", parseInt(e_id))
    .single();

  if (empError || !employee) {
    return { error: "Employee ID not found" };
  }

  // Check if username already exists
  const { data: existingUser } = await supabase
    .from("USER")
    .select("username")
    .eq("username", username)
    .single();

  if (existingUser) {
    return { error: "Username already exists" };
  }

  // Hash password with SHA256
  const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

  // Insert into USER table
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

  // Hash password with SHA256
  const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

  // Update USER table
  const { error: updateError } = await supabase
    .from("USER")
    .update({
      hash_password: hashedPassword,
      failed_attempt_count: 0, // Reset lockout status upon admin reset
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
