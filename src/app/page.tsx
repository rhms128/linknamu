import LinkList from "@/components/LinkList";
import ProfileHeader from "@/components/ProfileHeader";
import ThemeToggle from "@/components/ThemeToggle";

const profile = {
  name: "이혜석",
  bio: "Physical AI 개발자 | Robotics, VLA, CV에 관심이 많습니다",
  avatarUrl: "/profile.jpg",
};

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

      <LinkList />
    </main>
  );
}
