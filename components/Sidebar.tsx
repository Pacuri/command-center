"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", icon: "◫", label: "Overview" },
  { href: "/tasks", icon: "✓", label: "Tasks" },
  { href: "/calendar", icon: "▦", label: "Calendar" },
  { href: "/projects", icon: "◎", label: "Projects" },
];

const SECONDARY = [{ href: "/inbox", icon: "▽", label: "Inbox" }];

export default function Sidebar({ inboxCount }: { inboxCount?: number }) {
  const pathname = usePathname();

  return (
    <nav
      style={{
        width: 44,
        background: "#0a0a0a",
        borderRight: "1px solid #1a1a1a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "12px 0",
        gap: 4,
        flexShrink: 0,
      }}
    >
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          title={item.label}
          style={{
            width: 30,
            height: 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 4,
            fontSize: 13,
            color: pathname === item.href ? "#4ade80" : "#555",
            background: pathname === item.href ? "#151515" : "transparent",
            textDecoration: "none",
            transition: "all 0.1s",
          }}
        >
          {item.icon}
        </Link>
      ))}

      <div
        style={{
          width: 20,
          height: 1,
          background: "#1a1a1a",
          margin: "4px 0",
        }}
      />

      {SECONDARY.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          title={item.label}
          style={{
            width: 30,
            height: 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 4,
            fontSize: 13,
            color: pathname === item.href ? "#4ade80" : "#555",
            background: pathname === item.href ? "#151515" : "transparent",
            textDecoration: "none",
            position: "relative",
          }}
        >
          {item.icon}
          {inboxCount && inboxCount > 0 ? (
            <span
              style={{
                position: "absolute",
                top: -1,
                right: -1,
                width: 6,
                height: 6,
                background: "#ef4444",
                borderRadius: "50%",
              }}
            />
          ) : null}
        </Link>
      ))}

      <div style={{ flex: 1 }} />
    </nav>
  );
}
