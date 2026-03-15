"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BookOpen,
  ChartColumnIncreasing,
  FileUp,
  PanelLeft,
  Settings,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const items = [
  {
    href: "/library",
    label: "Exam Library",
    icon: BookOpen,
  },
  {
    href: "/library/import",
    label: "Import Exams",
    icon: FileUp,
  },
  {
    href: "/attempts",
    label: "Attempts",
    icon: ChartColumnIncreasing,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
  },
] as const;

export function SidebarNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string): boolean => {
    if (href === "/library") {
      return (
        pathname === "/library" ||
        (pathname.startsWith("/library/") &&
          !pathname.startsWith("/library/import"))
      );
    }

    if (href === "/library/import") {
      return (
        pathname === "/library/import" ||
        pathname.startsWith("/library/import/")
      );
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      <div
        className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 px-4 pb-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/85 lg:hidden"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 0.75rem)" }}
      >
        <div className="flex items-center gap-3">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger render={<Button variant="outline" size="icon-sm" />}>
              <PanelLeft className="h-4 w-4" />
              <span className="sr-only">Open navigation</span>
            </SheetTrigger>
            <SheetContent side="left" className="w-[84vw] max-w-sm p-0">
              <SheetHeader className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
                <SheetTitle className="text-left text-base font-semibold text-emerald-600 dark:text-emerald-400">
                  Mockly
                </SheetTitle>
                <p className="text-left text-xs text-slate-500 dark:text-slate-400">
                  Mock exam practice
                </p>
              </SheetHeader>

              <nav
                className="space-y-1 px-3 pt-3"
                style={{
                  paddingBottom: "calc(env(safe-area-inset-bottom) + 0.75rem)",
                }}
              >
                {items.map((item) => {
                  const active = isActive(item.href);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      prefetch={true}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition",
                        active
                          ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-100",
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>

          <div>
            <p className="text-base font-semibold text-emerald-600 dark:text-emerald-400">
              Mockly
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Mock exam practice
            </p>
          </div>
        </div>
      </div>

      <aside className="hidden w-full border-b border-slate-200 bg-white/80 p-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80 lg:sticky lg:top-0 lg:flex lg:h-screen lg:border-b-0 lg:border-r lg:flex-col">
        <div className="mb-6 px-2">
          <p className="text-xl font-semibold text-emerald-600 dark:text-emerald-400">
            Mockly
          </p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Mock exam practice
          </p>
        </div>

        <nav className="space-y-1">
          {items.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition",
                  active
                    ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-100",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
