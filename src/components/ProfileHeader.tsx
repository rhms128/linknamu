import Image from "next/image";

type ProfileHeaderProps = {
  name: string;
  bio: string;
  avatarUrl: string;
};

export default function ProfileHeader({
  name,
  bio,
  avatarUrl,
}: ProfileHeaderProps) {
  return (
    <header className="flex flex-col items-center text-center">
      <Image
        src={avatarUrl}
        alt={`${name} 프로필 사진`}
        width={144}
        height={144}
        priority
        className="h-36 w-36 rounded-full object-cover ring-1 ring-black/10 dark:ring-white/15"
      />
      <h1 className="mt-5 text-xl font-bold">{name}</h1>
      <p className="mt-1 text-sm opacity-70">{bio}</p>
    </header>
  );
}
