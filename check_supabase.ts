import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const url = "https://cezzwsplciewkgfgkovi.supabase.co";
const key = process.env.VITE_SUPABASE_ANON_KEY;

async function check() {
  console.log("Checking Supabase connection to:", url);
  const supabase = createClient(url, key!);
  
  const { data: policies, error: pError } = await supabase.from('policies').select('*').limit(1);
  console.log("Policies check:", { count: policies?.length, error: pError?.message });

  const { data: events, error: eError } = await supabase.from('trigger_events').select('*').limit(1);
  console.log("Trigger Events check:", { count: events?.length, error: eError?.message });

  const { data: workerPolicies, error: wpError } = await supabase.from('policies').select('*').eq('phone_number', '9876543210');
  console.log("Worker (9876543210) check:", { count: workerPolicies?.length, error: wpError?.message });
}

check();
