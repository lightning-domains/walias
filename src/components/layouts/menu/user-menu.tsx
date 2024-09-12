"use client";
/* eslint-disable @next/next/no-img-element */

import { useProfile } from "nostr-hooks";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { CircleUser, Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback } from "react";

export default function UserMenu() {
  const router = useRouter();
  const { userPubkey, logout } = useAuth();
  const { profile } = useProfile({ pubkey: userPubkey! });
  const { theme, setTheme } = useTheme();

  const handleLogout = useCallback(() => {
    logout();
    router.push("/admin");
  }, [logout, router]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='secondary' size='icon' className='rounded-full'>
          {profile ? (
            <img
              alt={profile?.displayName}
              src={profile?.image}
              className='rounded-full'
            />
          ) : (
            <CircleUser className='h-5 w-5' />
          )}

          <span className='sr-only'>Toggle user menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='min-w-[180px]'>
        <DropdownMenuLabel>
          {profile?.displayName ? profile.displayName : "My Account"}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className='cursor-pointer'
          onClick={() => router.push("/admin/settings/profile")}
        >
          My profile
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={true}
          onClick={() => router.push("/admin/inbox")}
        >
          Inbox
        </DropdownMenuItem>
        <DropdownMenuItem
          className='cursor-pointer'
          onClick={() => router.push("/admin/settings/providers")}
        >
          Wallet providers
        </DropdownMenuItem>
        <DropdownMenuItem
          className='cursor-pointer'
          onClick={() => window.open("https://discord.lacrypta.ar", "_blank")}
        >
          Support
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => e.preventDefault()}
          className='focus:bg-transparent flex justify-between'
        >
          <span>Theme</span>
          <div className='flex items-center'>
            <button
              onClick={() => setTheme("system")}
              className={`p-1 w-6 h-6 rounded-md ${
                theme === "system" ? "bg-muted" : ""
              }`}
            >
              <Laptop className='h-4 w-4' />
            </button>
            <button
              onClick={() => setTheme("light")}
              className={`p-1 w-6 h-6 rounded-md ${
                theme === "light" ? "bg-muted" : ""
              }`}
            >
              <Sun className='h-4 w-4' />
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`p-1 w-6 h-6 rounded-md ${
                theme === "dark" ? "bg-muted" : ""
              }`}
            >
              <Moon className='h-4 w-4' />
            </button>
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className='cursor-pointer' onClick={handleLogout}>
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
