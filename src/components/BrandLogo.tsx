"use client";

import Image from "next/image";
import Link from "next/link";

/** Official logo pixel size (public/images/logo.png) */
const LOGO_W = 1024;
const LOGO_H = 819;

type Props = {
  /** Visual height in px */
  height?: number;
  href?: string | null;
  className?: string;
  priority?: boolean;
};

/** Official Ranu Salon mark (gold on #010101). */
export function BrandLogo({
  height = 48,
  href = "/",
  className = "",
  priority = false,
}: Props) {
  const width = Math.round((height * LOGO_W) / LOGO_H);
  const img = (
    <Image
      src="/images/logo.png"
      alt="Ranu Salon"
      width={width}
      height={height}
      className={`w-auto object-contain object-left ${className}`.trim()}
      style={{ height, width: "auto" }}
      priority={priority}
      sizes={`${width}px`}
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
