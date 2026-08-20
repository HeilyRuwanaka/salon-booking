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

/** Official Ranu Salon mark (gold on black). */
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
      sizes={`${height}px`}
    />
  );

  if (href === null) return <span className="inline-flex shrink-0 items-center">{img}</span>;
  return (
    <Link
      href={href}
      className="inline-flex shrink-0 items-center outline-offset-4 focus-visible:outline focus-visible:outline-copper"
      aria-label="Ranu Salon home"
    >
      {img}
    </Link>
  );
}
