"use client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MenuItem } from "@/types/menu";
import { Menu } from "lucide-react";
import Link from "next/link";
import DomainSwitcher from "../../../features/domains/components/domain-switcher";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import UpgradeBlock from "./upgrade-block";
import LoadingMenu from "./loading-menu";
import PoweredFooter from "./powered-footer";

interface MobileMenuProps {
  menuItems: MenuItem[];
  isAdmin?: boolean;
  isLoading?: boolean;
}

export default function MobileMenu({
  menuItems,
  isAdmin = false,
  isLoading,
}: MobileMenuProps) {
  const pathname = usePathname();
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant='outline' size='icon' className='shrink-0 md:hidden'>
          <Menu className='h-5 w-5' />
          <span className='sr-only'>Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side='left' className='flex flex-col'>
        <nav className='grid gap-2 text-lg pr-8 font-medium'>
          <DomainSwitcher className='w-full text-lg p-2' />
          {isLoading ? (
            <LoadingMenu />
          ) : (
            <>
              <div className='pt-4 pb-2'>
                <p className='px-2 text-xs font-semibold text-slate-400 uppercase'>
                  User
                </p>
              </div>
              {menuItems
                .filter((item) => !item.isAdmin)
                .map((item, k) => (
                  <MovileMenuLink
                    key={k}
                    item={item}
                    selected={pathname === item.href}
                  />
                ))}

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
                      <MovileMenuLink
                        key={k}
                        item={item}
                        selected={pathname === item.href}
                      />
                    ))}
                </>
              )}
            </>
          )}
        </nav>
        <div className='mt-auto'>
          <UpgradeBlock isLoading={isLoading} />
        </div>
        <PoweredFooter />
      </SheetContent>
    </Sheet>
  );
}

function MovileMenuLink({
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
        "mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground",
        item.disabled &&
          "text-slate-300 hover:text-slate-300 dark:text-slate-500 dark:hover:text-slate-500 cursor-not-allowed",
        selected && "bg-muted dark:text-slate-100"
      )}
    >
      <item.icon className='h-5 w-5' />
      {item.title}
    </Link>
  );
}
