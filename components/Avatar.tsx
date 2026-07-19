"use client";

import { useState } from "react";
import Image from "next/image";
import { fixImageUrl, shouldSkipOptimization } from "@/lib/image";

type Props = {
  name: string;
  photoUrl?: string;
  size: number;
  className?: string;
};

/**
 * メンバー写真の共通アバター。
 * URLが無い・読み込みに失敗した場合は名前のイニシャルにフォールバックする
 * （仮データや削除済み画像でもUIが壊れない）。
 */
export default function Avatar({ name, photoUrl, size, className = "" }: Props) {
  const [failed, setFailed] = useState(false);
  const imgUrl = fixImageUrl(photoUrl, size * 2);

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full bg-sky-50 ${className}`}
      style={{ width: size, height: size }}
    >
      {imgUrl && !failed ? (
        <Image
          src={imgUrl}
          alt={name}
          fill
          className="object-cover"
          sizes={`${size}px`}
          unoptimized={shouldSkipOptimization(imgUrl)}
          onError={() => setFailed(true)}
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sky-100 to-indigo-100 font-bold text-sky-500"
          style={{ fontSize: Math.max(10, size * 0.36) }}
        >
          {name ? name.slice(0, 1) : "?"}
        </div>
      )}
    </div>
  );
}
