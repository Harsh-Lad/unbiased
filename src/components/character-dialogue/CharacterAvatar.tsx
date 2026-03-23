"use client";

import Image from "next/image";
import { type CharacterConfig } from "@/lib/characters";

interface CharacterAvatarProps {
  character: CharacterConfig;
  size?: number;
}

export function CharacterAvatar({ character, size = 48 }: CharacterAvatarProps) {
  return (
    <div
      className={`relative flex shrink-0 items-center justify-center rounded-full ${character.avatarBg} ring-2 ring-white/80 dark:ring-white/20 shadow-lg`}
      style={{ width: size, height: size }}
    >
      <Image
        src={character.sprite}
        alt={character.name}
        width={size - 8}
        height={size - 8}
        className="rounded-full object-cover drop-shadow-sm"
        priority
      />
    </div>
  );
}
