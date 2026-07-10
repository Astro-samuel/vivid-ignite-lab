const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  console.error("Missing Supabase configuration env variables.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function runTest() {
  const randomId = Math.floor(Math.random() * 1000000);
  const email = `ignite-test-${randomId}@yopmail.com`;
  const password = "SuperSecretPassword123!";
  
  console.log(`Attempting signup for: ${email}`);
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username: `test_${randomId}`, display_name: `Test ${randomId}` },
      emailRedirectTo: `http://localhost:8080/auth`,
    }
  });

  if (error) {
    console.error("Signup failed:", error.message);
  } else {
    console.log("Signup request successful!");
    console.log("User details:", data.user ? { id: data.user.id, email: data.user.email } : "No user data.");
    console.log("Session details:", data.session ? "Active session created" : "No session (email verification required)");
  }
}

runTest();
