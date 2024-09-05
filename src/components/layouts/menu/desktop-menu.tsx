"use client";
import Link from "next/link";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MenuItem } from "@/types/menu";
import Sidebar from "../sidebar";
import TeamSwitcher from "./team-switcher";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import UpgradeBlock from "./upgrade-block";

interface DesktopMenuProps {
  menuItems: MenuItem[];
  isAdmin?: boolean;
}

export default function DesktopMenu({
  menuItems,
  isAdmin = false,
}: DesktopMenuProps) {
  const pathname = usePathname();

  return (
    <Sidebar>
      <div className='flex h-14 items-center gap-1 justify-around border-b lg:h-[60px] md:px-2 lg:px-4'>
        <TeamSwitcher />
        <Button variant='outline' size='icon' className='ml-auto h-10 w-10'>
          <Bell className='h-4 w-4' />
          <span className='sr-only'>Toggle notifications</span>
        </Button>
      </div>
      <div className='flex-1'>
        <nav className='grid items-start px-2 text-sm font-medium lg:px-4'>
          <>
            <div className='pt-4 pb-2'>
              <p className='px-2 text-xs font-semibold text-gray-400 uppercase'>
                User
              </p>
            </div>
            {menuItems
              .filter((item) => !item.isAdmin)
              .map((item, k) => (
                <DesktopMenuLink
                  key={k}
                  item={item}
                  selected={pathname !== item.href}
                />
              ))}
          </>
          {isAdmin && (
            <>
              <div className='pt-4 pb-2'>
                <p className='px-2 text-xs font-semibold text-gray-400 uppercase'>
                  Admin
                </p>
              </div>
              {menuItems
                .filter((item) => item.isAdmin)
                .map((item, k) => (
                  <DesktopMenuLink
                    key={k}
                    item={item}
                    selected={pathname !== item.href}
                  />
                ))}
            </>
          )}
        </nav>
      </div>
      <div className='mt-auto p-4'>
        <UpgradeBlock />
      </div>
    </Sidebar>
  );
}

function DesktopMenuLink({
  item,
  selected,
}: {
  item: MenuItem;
  selected: boolean;
}) {
  return (
    <Link
      href={!item.disabled ? item.href : ""}
      className={cn(
        selected ? `text-muted-foreground` : `bg-muted`,
        `flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary`,
        item.disabled && "text-gray-300 hover:text-gray-300 cursor-not-allowed"
      )}
    >
      <item.icon className='h-4 w-4' />
      {item.title}
    </Link>
  );
}
