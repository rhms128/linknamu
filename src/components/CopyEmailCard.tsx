"use client";

import { useEffect, useState } from "react";

import { CARD_CLASS, CARD_EN_CLASS } from "./cardStyle";
import ClickCount from "./ClickCount";

type CopyEmailCardProps = {
  title: string;
  titleEn: string;
  emoji: string;
  email: string;
  count: number;
  onCounted: () => void;
};

export default function CopyEmailCard({
  title,
  titleEn,
  emoji,
  email,
  count,
  onCounted,
}: CopyEmailCardProps) {
  const [copied, setCopied] = useState(false);

  // 복사 표시는 2초 뒤에 원래 문구로 되돌린다.
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    onCounted();
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
    } catch {
      // 클립보드를 쓸 수 없는 환경에서는 메일 앱으로라도 넘겨준다.
      window.location.href = `mailto:${email}`;
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`${title} 주소 복사: ${email}`}
      className={CARD_CLASS}
    >
      <span aria-hidden="true">{copied ? "✅" : emoji}</span>
      <span aria-live="polite">{copied ? "복사됨!" : title}</span>
      {!copied && <span className={CARD_EN_CLASS}>({titleEn})</span>}
      <ClickCount value={count} />
    </button>
  );
}
