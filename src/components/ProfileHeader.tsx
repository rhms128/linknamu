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
        className="avatar-frame h-32 w-32 rounded-full object-cover sm:h-36 sm:w-36"
      />
      <h1 className="mt-7 text-2xl font-bold tracking-tight">{name}</h1>
      {/*
       * 항상 한 줄로 보이게 한다. 좁은 화면에서 넘치지 않도록
       * 글자 크기를 화면 너비에 비례시키고, 위아래를 clamp로 묶었다.
       */}
      <p className="text-muted mt-2.5 whitespace-nowrap text-[clamp(0.625rem,2.85vw,0.8125rem)] leading-relaxed">
        {bio}
      </p>
    </header>
  );
}
