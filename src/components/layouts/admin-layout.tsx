"use client";
import {
  Search,
  Home,
  Settings,
  Users,
  WebhookIcon,
  Wallet,
} from "lucide-react";
import { Input } from "@/components/ui/input";

import MobileMenu from "./menu/mobile-menu";
import UserMenu from "./menu/user-menu";
import DesktopMenu from "./menu/desktop-menu";
import { MenuItem } from "@/types/menu";
import useDomains from "@/features/domains/hooks/use-domains";
import { Skeleton } from "../ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "../ui/button";

const ADMIN_PREFIX = "/admin";
const menuItems: MenuItem[] = [
  {
    icon: Home,
    title: "Dashboard",
    href: `${ADMIN_PREFIX}`,
    isAdmin: false,
  },
  {
    icon: Wallet,
    title: "Walias",
    href: `${ADMIN_PREFIX}/waliases`,
    isAdmin: false,
  },
  {
    icon: Settings,
    title: "Settings",
    href: `${ADMIN_PREFIX}/domains/settings`,
    isAdmin: false,
  },
  {
    icon: Users,
    title: "Users",
    href: `${ADMIN_PREFIX}/users`,
    isAdmin: true,
  },
  {
    icon: WebhookIcon,
    title: "Triggers",
    href: `${ADMIN_PREFIX}/triggers`,
    disabled: true,
    isAdmin: true,
  },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { currentDomain } = useDomains();
  const {
    userPubkey,
    isLoading: isLoadingAuth,
    loginWithExtension,
  } = useAuth();

  return (
    <div className='grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]'>
      <DesktopMenu
        menuItems={menuItems}
        isAdmin={currentDomain?.isAdmin}
        isLoading={!currentDomain}
      />

      <div className='flex flex-col'>
        <header className='flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6'>
          <MobileMenu
            menuItems={menuItems}
            isAdmin={currentDomain?.isAdmin}
            isLoading={!currentDomain}
          />
          <div className='w-full flex-1'>
            <form>
              <div className='relative'>
                {!currentDomain ? (
                  <Skeleton className='w-1/2 h-10' />
                ) : (
                  <>
                    <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
                    <Input
                      type='search'
                      placeholder='Search users...'
                      className='w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3'
                    />
                  </>
                )}
              </div>
            </form>
          </div>
          {isLoadingAuth ? (
            <Skeleton className='w-10 h-10 rounded-full' />
          ) : userPubkey ? (
            <UserMenu />
          ) : (
            <Button onClick={loginWithExtension}>Login</Button>
          )}
        </header>
        <main className='flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6'>
          {children}
        </main>
      </div>
    </div>
  );
}
