export type Link = {
  id: string;
  title: string;
  titleEn: string;
  url: string;
  emoji: string;
};

export const links: Link[] = [
  {
    id: "github",
    title: "깃허브",
    titleEn: "github",
    url: "https://github.com/rhms128",
    emoji: "🐙",
  },
  {
    id: "instagram",
    title: "인스타그램",
    titleEn: "instagram",
    url: "https://www.instagram.com/hyeseok0/",
    emoji: "📸",
  },
  {
    id: "linkedin",
    title: "링크드인",
    titleEn: "linkedin",
    url: "https://linkedin.com/in/hslee128",
    emoji: "💼",
  },
];

export const EMAIL_ID = "email";
export const EMAIL = "leehsuk030128@gmail.com";

// 집계 대상 id 목록. API가 임의의 문서를 만들지 못하도록 허용 목록으로도 쓴다.
export const TRACKED_IDS: string[] = [...links.map((link) => link.id), EMAIL_ID];

export type Counts = Record<string, number>;

export const ZERO_COUNTS: Counts = Object.fromEntries(
  TRACKED_IDS.map((id) => [id, 0]),
);
