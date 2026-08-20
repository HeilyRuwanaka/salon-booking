import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PrintButton } from "@/components/PrintButton";
import { bookQrImageUrl, bookUrl, salon } from "@/lib/salon.config";

export const metadata: Metadata = {
  title: "Shop QR code",
  description: "Printable QR code that opens the Ranu Salon booking page.",
};

/**
 * Printable poster page for the salon door.
 * Open /qr → print → stick next to the entrance.
 */
export default function QrPosterPage() {
  const url = bookUrl();
  const qrSrc = bookQrImageUrl(360);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center px-4 py-12 text-center sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-copper-deep print:hidden">
        Shop poster
      </p>
      <Image
        src="/images/logo.png"
        alt={salon.name}
        width={280}
        height={224}
        className="mt-4 h-auto w-40 object-contain sm:w-48"
        priority
      />
      <p className="mt-4 text-mute">Scan to book your appointment</p>

      <div className="mt-10 bg-white p-6 shadow-sm ring-1 ring-line">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrSrc}
          alt={`QR code linking to ${url}`}
          width={360}
          height={360}
          className="mx-auto h-auto w-full max-w-[360px]"
        />
      </div>

      <p className="mt-6 break-all text-sm text-mute">{url}</p>
      <p className="mt-2 text-sm text-mute">{salon.hoursLabel}</p>

      <div className="mt-10 flex flex-wrap justify-center gap-3 print:hidden">
        <PrintButton />
        <Link href="/book" className="btn btn-ghost">
          Open book page
        </Link>
      </div>

      <p className="mt-8 max-w-md text-sm text-mute print:hidden">
        Tip: use Print or “Save as PDF”, then put the poster by the shop door.
        No paid domain needed — this QR uses your free Vercel link.
      </p>
    </div>
  );
}
