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

export default function Sidebar({ inboxCount, agentActive }: { inboxCount?: number; agentActive?: boolean }) {
  const pathname = usePathname();

  return (
    <nav
      style={{
        width: 52,
        background: "#0a0a0a",
        borderRight: "1px solid #1a1a1a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "14px 0",
        gap: 6,
        flexShrink: 0,
      }}
    >
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          title={item.label}
          style={{
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 4,
            fontSize: 16,
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
          width: 24,
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
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 4,
            fontSize: 16,
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
                top: 0,
                right: 0,
                width: 7,
                height: 7,
                background: "#ef4444",
                borderRadius: "50%",
              }}
            />
          ) : null}
        </Link>
      ))}

      <div style={{ flex: 1 }} />

      {/* Avatar with active glow */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 2,
          position: "relative",
        }}
      >
        {agentActive && (
          <style>{`
            @keyframes agent-pulse {
              0%, 100% { box-shadow: 0 0 4px 1px rgba(74, 222, 128, 0.4); }
              50% { box-shadow: 0 0 10px 3px rgba(74, 222, 128, 0.7); }
            }
          `}</style>
        )}
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            overflow: "hidden",
            border: agentActive ? "1.5px solid #4ade80" : "1px solid #1a1a1a",
            animation: agentActive ? "agent-pulse 2s ease-in-out infinite" : "none",
            transition: "border-color 0.3s ease",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://sacwbhhusphqzsaoyhit.supabase.co/storage/v1/object/public/identity/avatar.png"
            alt="avatar"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      </div>
    </nav>
  );
}
