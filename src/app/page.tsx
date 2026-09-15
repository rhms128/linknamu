import LinkCard from "@/components/LinkCard";
import ProfileHeader from "@/components/ProfileHeader";
import ThemeToggle from "@/components/ThemeToggle";

// TODO: 실제 프로필/링크 데이터로 교체 (지금은 보여주기용 더미 값)
const profile = {
  name: "이혜석",
  bio: "Physical AI 개발자",
  avatarUrl: "/avatar-placeholder.svg",
};

const links = [
  { id: "github", title: "Github", url: "https://github.com" },
  { id: "linkedin", title: "LinkedIn", url: "https://www.linkedin.com" },
  { id: "blog", title: "Blog", url: "https://example.com" },
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 py-12">
      <div className="mb-2 flex justify-end">
        <ThemeToggle />
      </div>

      <ProfileHeader
        name={profile.name}
        bio={profile.bio}
        avatarUrl={profile.avatarUrl}
      />

      <nav className="mt-8 flex flex-col gap-4">
        {links.map((link) => (
          <LinkCard key={link.id} title={link.title} url={link.url} />
        ))}
      </nav>
    </main>
  );
}
