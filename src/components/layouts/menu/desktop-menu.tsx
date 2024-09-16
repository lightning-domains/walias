"use client";
import Link from "next/link";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MenuItem } from "@/types/menu";
import Sidebar from "../sidebar";
import DomainSwitcher from "../../../features/domains/components/domain-switcher";
import UpgradeBlock from "./upgrade-block";
import LoadingMenu from "./loading-menu";
import PoweredFooter from "./powered-footer";

interface DesktopMenuProps {
  menuItems: MenuItem[];
  isAdmin?: boolean;
  isLoading?: boolean;
}

export default function DesktopMenu({
  menuItems,
  isAdmin = false,
  isLoading,
}: DesktopMenuProps) {
  const pathname = usePathname();
  return (
    <Sidebar>
      <div className='flex h-14 items-center gap-1 justify-around border-b lg:h-[60px] md:px-2 lg:px-4'>
        <DomainSwitcher />
      </div>
      <div className='flex-1'>
        <nav className='grid items-start px-2 text-sm font-medium lg:px-4'>
          {isLoading ? (
            <LoadingMenu />
          ) : (
            <>
              <>
                <div className='pt-4 pb-2'>
                  <p className='px-2 text-xs font-semibold text-slate-400 uppercase'>
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
                    <p className='px-2 text-xs font-semibold text-slate-400 uppercase'>
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
            </>
          )}
        </nav>
      </div>
      <div className='mt-auto p-4'>
        <UpgradeBlock isLoading={isLoading} />
      </div>
      <PoweredFooter />
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
        `flex items-center dark:text-slate-300 dark:hover:text-slate-200 gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary`,
        item.disabled &&
          "text-slate-300 hover:text-slate-300  dark:text-slate-600 dark:hover:text-slate-600  cursor-not-allowed"
      )}
    >
      <item.icon className='h-4 w-4' />
      {item.title}
    </Link>
  );
}
