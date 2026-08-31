"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  MessageSquare,
  Play,
  Settings,
  Swords,
  UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { domain } from "@/config/domain.config";

type NavItem = {
  href: string;
  label: string;
  icon: typeof Home;
} & (
  | { show: "always" }
  | { show: "feature"; feature: keyof typeof domain.features }
  | { show: "admin" }
);

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home", icon: Home, show: "always" },
  { href: "/quiz/setup", label: "Quiz", icon: Play, show: "always" },
  {
    href: "/duel",
    label: "Duel",
    icon: Swords,
    show: "feature",
    feature: "duels",
  },
  {
    href: "/forum",
    label: "Forum",
    icon: MessageSquare,
    show: "feature",
    feature: "forum",
  },
  { href: "/profile", label: "Profile", icon: UserCircle, show: "always" },
  // "admin", not "always" — this nav item must never render for a non-admin.
  // See docs/handoff.md for why this used to be wrong.
  { href: "/admin", label: "Admin", icon: Settings, show: "admin" },
];

export function BottomNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const visible = NAV_ITEMS.filter((item) => {
    switch (item.show) {
      case "always":
        return true;
      case "feature":
        return domain.features[item.feature];
      case "admin":
        return isAdmin;
    }
  });

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
        {visible.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-muted-foreground transition-colors",
                active && "text-primary",
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
