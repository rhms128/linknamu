import CopyEmailCard from "@/components/CopyEmailCard";
import LinkCard from "@/components/LinkCard";
import ProfileHeader from "@/components/ProfileHeader";
import ThemeToggle from "@/components/ThemeToggle";

const profile = {
  name: "이혜석",
  bio: "Physical AI 개발자 | Robotics, VLA, CV에 관심이 많습니다",
  avatarUrl: "/profile.jpg",
};

const links = [
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

const email = "leehsuk030128@gmail.com";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-6 py-12 sm:px-8 sm:py-16">
      <div className="mb-6 flex justify-end">
        <ThemeToggle />
      </div>

      <ProfileHeader
        name={profile.name}
        bio={profile.bio}
        avatarUrl={profile.avatarUrl}
      />

      <nav className="mt-11 flex flex-col gap-3.5">
        {links.map((link) => (
          <LinkCard
            key={link.id}
            title={link.title}
            titleEn={link.titleEn}
            url={link.url}
            emoji={link.emoji}
          />
        ))}
        <CopyEmailCard
          title="이메일"
          titleEn="email"
          emoji="✉️"
          email={email}
        />
      </nav>
    </main>
  );
}
