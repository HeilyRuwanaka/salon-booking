"use client";

import Image from "next/image";
import Link from "next/link";

type Props = {
  /** Visual height in px */
  height?: number;
  href?: string | null;
  className?: string;
  priority?: boolean;
};

/** Official Ranu Salon mark (gold on black). Keep compact so it doesn’t overpower the UI. */
export function BrandLogo({
  height = 40,
  href = "/",
  className = "",
  priority = false,
}: Props) {
  const img = (
    <Image
      src="/images/logo.png"
      alt="Ranu Salon"
      width={Math.round(height * 0.73)}
      height={height}
      className={`w-auto object-contain ${className}`.trim()}
      style={{ height, width: "auto" }}
      priority={priority}
    />
  );

  if (href === null) return img;
  return (
    <Link href={href} className="inline-flex shrink-0 items-center" aria-label="Ranu Salon home">
      {img}
    </Link>
  );
}
