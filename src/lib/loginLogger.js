// src/lib/loginLogger.js
// Mencatat aktivitas login user: IP, user agent, waktu

import { supabase } from './supabase';

async function getPublicIP() {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    return data.ip || 'unknown';
  } catch {
    return 'unknown';
  }
}

export async function logLoginActivity(userEmail) {
  try {
    const ip        = await getPublicIP();
    const userAgent = navigator.userAgent;

    await supabase.from('login_logs').insert({
      user_email : userEmail,
      ip_address : ip,
      user_agent : userAgent,
    });
  } catch (err) {
    console.warn('Login log gagal (non-critical):', err);
  }
}
