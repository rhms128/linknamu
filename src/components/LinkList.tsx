"use client";

import { useCallback, useEffect, useState } from "react";

import {
  EMAIL,
  EMAIL_ID,
  ZERO_COUNTS,
  links,
  type Counts,
} from "@/lib/links";
import CopyEmailCard from "./CopyEmailCard";
import LinkCard from "./LinkCard";

export default function LinkList() {
  // 데이터를 받기 전에는 0회로 보여 주고, 응답이 오면 실제 값으로 갈아끼운다.
  const [counts, setCounts] = useState<Counts>(ZERO_COUNTS);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/clicks")
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data: Counts) => {
        if (!cancelled) setCounts((prev) => ({ ...prev, ...data }));
      })
      .catch(() => {
        // 못 받아오면 0회를 유지한다. 링크 자체는 그대로 동작해야 한다.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const registerClick = useCallback((id: string) => {
    // 먼저 화면부터 올리고, 서버가 알려준 값으로 맞춘다.
    setCounts((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));

    // keepalive: 링크를 따라 이동하더라도 요청이 끊기지 않게 한다.
    fetch(`/api/clicks/${id}`, { method: "POST", keepalive: true })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { count?: number } | null) => {
        if (typeof data?.count === "number") {
          setCounts((prev) => ({ ...prev, [id]: data.count as number }));
        }
      })
      .catch(() => {
        // 저장에 실패해도 화면은 그대로 둔다.
      });
  }, []);

  return (
    <nav className="mt-11 flex flex-col gap-3.5">
      {links.map((link) => (
        <LinkCard
          key={link.id}
          title={link.title}
          titleEn={link.titleEn}
          url={link.url}
          emoji={link.emoji}
          count={counts[link.id] ?? 0}
          onCounted={() => registerClick(link.id)}
        />
      ))}
      <CopyEmailCard
        title="이메일"
        titleEn="email"
        emoji="✉️"
        email={EMAIL}
        count={counts[EMAIL_ID] ?? 0}
        onCounted={() => registerClick(EMAIL_ID)}
      />
    </nav>
  );
}
