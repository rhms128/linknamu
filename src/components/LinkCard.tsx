import { CARD_CLASS, CARD_EN_CLASS } from "./cardStyle";
import ClickCount from "./ClickCount";

type LinkCardProps = {
  title: string;
  titleEn: string;
  url: string;
  emoji: string;
  count: number;
  onCounted: () => void;
};

export default function LinkCard({
  title,
  titleEn,
  url,
  emoji,
  count,
  onCounted,
}: LinkCardProps) {
  // mailto: 같은 링크는 새 탭으로 열 필요가 없다.
  const isExternal = url.startsWith("http");

  return (
    <a
      href={url}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      onClick={onCounted}
      className={CARD_CLASS}
    >
      <span aria-hidden="true">{emoji}</span>
      {title}
      <span className={CARD_EN_CLASS}>({titleEn})</span>
      <ClickCount value={count} />
    </a>
  );
}
