/**
 * Ranu Salon — easy-to-edit business details.
 * Replace address, map, photos, and reviews when the owner shares final info.
 */
export const salon = {
  name: "Ranu Salon",
  tagline: "Book your next appointment online — simple, fast, confirmed.",
  description:
    "Ranu Salon offers friendly, professional hair care with easy online booking. Walk in or reserve your time from your phone.",
  /** Short story for About + homepage */
  aboutLead: "Care that fits your day",
  aboutParagraphs: [
    "Welcome to Ranu Salon. We keep things simple: quality cuts, clear timing, and a booking flow you can finish on your phone in a minute.",
    "Whether you need a quick tidy-up or a fuller style refresh, reserve a slot online and we will confirm from our side. Open every day from 11:00 AM to 11:00 PM.",
    "Update this text anytime with the owner’s own words. Swap stock photos for real shop and cut photos when ready.",
  ] as const,
  ownerName: "Ranu", // replace with full owner name when confirmed
  phone: "+94767771719",
  phoneDisplay: "+94 76 777 1719",
  /** WhatsApp link uses country code without + */
  whatsapp: "94767771719",
  email: "",
  /** Street address — replace with full line when owner confirms */
  address: "Sri Lanka (map pin set)",
  addressNote: "Tap Open map for the exact salon location.",
  mapUrl: "https://maps.app.goo.gl/3GZUynmhE7sseKNXA",
  /** Approx coordinates from Google Maps share (for reference) */
  mapLat: 6.820859,
  mapLng: 80.017449,
  hoursLabel: "Every day · 11:00 AM – 11:00 PM",
  hoursDetail: "Open every day from 11:00 AM to 11:00 PM.",
  /** Open every day: 11:00 AM → 11:00 PM */
  openHour: 11,
  openMinute: 0,
  closeHour: 23,
  timezone: "Asia/Colombo",
  /** Live site — used for QR poster */
  siteUrl: "https://salon-booking-seven-rho.vercel.app",
  bookPath: "/book",
  /** Local photos in /public/images — swap for real shop photos later */
  heroImage: "/images/hero.jpg",
  aboutImage: "/images/about.jpg",
  /**
   * Placeholder reviews — replace with real customer quotes.
   * Keep 2–3 short lines for the homepage.
   */
  reviews: [
    {
      quote:
        "Quick booking on my phone and a clean cut. Easy to confirm the time.",
      name: "Customer",
      detail: "Haircut",
    },
    {
      quote:
        "Late evening slot worked for me after work. WhatsApp reply was fast.",
      name: "Customer",
      detail: "Beard Trim",
    },
    {
      quote:
        "Clear prices and no guessing about availability. Will book again.",
      name: "Customer",
      detail: "Haircut + Beard",
    },
  ] as const,
} as const;

export function bookUrl() {
  return `${salon.siteUrl}${salon.bookPath}`;
}

export function whatsappUrl(message?: string) {
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${salon.whatsapp}${text}`;
}

export function telUrl() {
  return `tel:${salon.phone}`;
}

/** Embeddable Google Map for Contact page (full-width section) */
export function mapEmbedUrl() {
  const q = encodeURIComponent(`${salon.mapLat},${salon.mapLng}`);
  return `https://maps.google.com/maps?q=${q}&z=16&output=embed`;
}


/** Free QR image for the book link (printable poster /qr page) */
export function bookQrImageUrl(size = 320) {
  const data = encodeURIComponent(bookUrl());
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${data}`;
}
