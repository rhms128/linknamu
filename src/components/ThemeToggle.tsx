"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  // 첫 렌더는 서버와 같은 값이어야 하므로, 실제 테마는 마운트 후에 읽는다.
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
    setMounted(true);
  }, []);

  const toggle = () => {
    const next = !isDark;
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // 사생활 보호 모드 등에서 localStorage가 막혀도 토글 자체는 동작하게 둔다.
    }
    setIsDark(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "밝은 화면으로 전환" : "어두운 화면으로 전환"}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-base transition-colors hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
    >
      {mounted ? (isDark ? "☀️" : "🌙") : null}
    </button>
  );
}
