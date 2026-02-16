"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      setError(true);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0a' }}>
      <form onSubmit={handleSubmit} className="w-full max-w-xs">
        <div style={{ color: '#4ade80', marginBottom: '16px', fontSize: '12px' }}>
          nikola@cc <span style={{ color: '#333' }}>~ $</span> login
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
          <span style={{ color: '#555' }}>password:</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent border-none outline-none"
            style={{
              color: '#c8c8c8',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '12px',
              caretColor: '#4ade80',
            }}
          />
        </div>

        {error && (
          <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '8px' }}>
            access denied
          </div>
        )}

        {loading && (
          <div style={{ color: '#555', fontSize: '11px', marginTop: '8px' }}>
            authenticating...
          </div>
        )}

        <button type="submit" className="hidden" />
      </form>
    </div>
  );
}
