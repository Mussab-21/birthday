// timeLock.js — Unlock at 12:00 AM PKT on Oct 18 2026
// Password accepts Aleena's birthday in various formats ("1810", "18102026", "18/10", "18-10", etc.) and nicknames

const UNLOCK_TIME = new Date("2026-10-18T00:00:00+05:00").getTime();

const params = new URLSearchParams(location.search);
export const DEV_MODE = params.get("dev") === "1";

export function isUnlocked() {
  return DEV_MODE || Date.now() >= UNLOCK_TIME;
}

export function getTimeUntilUnlock() {
  const diff = UNLOCK_TIME - Date.now();
  if (diff <= 0) return null;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { h, m, s, total: diff };
}

// Resilient verification: accept birthday date formats and nicknames
export async function verifyPassword(input) {
  if (DEV_MODE) return true;
  if (!input) return false;

  const raw = input.trim().toLowerCase();
  // Strip non-alphanumeric
  const cleanDigits = raw.replace(/\D/g, "");
  const cleanAlpha = raw.replace(/[^a-z]/g, "");

  // Accepted birthday number patterns:
  // 1810, 18102026, 181000, 181001, 181002, 181003, 181004, 181005, 181006, 18101999, etc.
  if (cleanDigits.startsWith("1810") || cleanDigits === "18" || cleanDigits.endsWith("1810")) {
    return true;
  }

  // Accepted nicknames
  const acceptedNames = [
    "aleena", "ninu", "neenu", "gulabjamun", "gulab jamun", "jaan", "alina", "mussab"
  ];
  if (acceptedNames.includes(cleanAlpha) || acceptedNames.some(name => raw.includes(name))) {
    return true;
  }

  // Check SHA-256 for exact "18102026"
  const msgBuffer = new TextEncoder().encode(raw);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const inputHash = [...new Uint8Array(hashBuffer)]
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");

  return inputHash === "c31e9c56baefb8893cb62e086111bebb552eb71658b4ecf7f7a77e2ff8d8ae31";
}

