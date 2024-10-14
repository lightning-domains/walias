import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Domain } from "@/types/domain";
import { LNURLResponse } from "@/types/lud";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function resolveLud16(
  walias: string
): Promise<LNURLResponse | null> {
  const [username, domain] = walias.split("@");

  try {
    const response = await fetch(
      `https://${domain}/.well-known/lnurlp/${username}`
    );

    if (!response.ok) {
      console.error(`HTTP error! Status: ${response.status}`);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error("Fetch error:", error);
    return null;
  }
}

export async function resolveNip05(walias: string): Promise<string | null> {
  const [username, domain] = walias.split("@");

  try {
    const response = await fetch(
      `https://${domain}/.well-known/nostr.json?name=${username}`
    );

    if (!response.ok) {
      console.error(`HTTP error! Status: ${response.status}`);
      return null;
    }
    const data = await response.json();
    return data.names[username];
  } catch (error) {
    console.error("Fetch error:", error);
    return null;
  }
}

export async function getDomainProfile(
  $domain: string
): Promise<Domain | null> {
  try {
    const response = await fetch(`https://${$domain}/.well-known/domain.json`);

    if (!response.ok) {
      console.error(`HTTP error! Status: ${response.status}`);
      return null;
    }
    return { ...(await response.json()), name: $domain };
  } catch (error) {
    console.error("Fetch error:", error);
    return null;
  }
}

// Function to validate if a string is a valid domain name
export function isValidDomain(domain: string): boolean {
  const domainRegex =
    /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
  return domainRegex.test(domain);
}

// Function to validate if a string is a valid 32 bytes hex string
export function isValidKey(hexString: string, length: number = 32): boolean {
  const hexRegex = new RegExp(`^[a-fA-F0-9]{${length * 2}}$`);
  return hexRegex.test(hexString);
}
