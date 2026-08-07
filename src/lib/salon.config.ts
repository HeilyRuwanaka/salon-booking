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
    "Whether you need a quick tidy-up or a fuller style refresh, reserve a slot online and we will confirm from our side. Open every day from afternoon into the night — so late appointments are easier.",
    "Update this text anytime with the owner’s own words. Swap stock photos for real shop and cut photos when ready.",
  ] as const,
  ownerName: "Ranu", // replace with full owner name when confirmed
  phone: "+94767771719",
  phoneDisplay: "+94 76 777 1719",
  /** WhatsApp link uses country code without + */
  whatsapp: "94767771719",
  email: "",
  /** Replace with full street address when ready */
  address: "Sri Lanka",
  addressNote: "Full street address and Google Maps pin will be added when the owner confirms the location.",
  mapUrl: "", // paste Google Maps share link later
  hoursLabel: "Every day · 1:00 PM – 12:00 AM",
  hoursDetail: "Open every day from 1:00 PM until midnight.",
  /** Open every day: 1:00 PM → midnight */
  openHour: 13,
  openMinute: 0,
  closeHour: 24, // midnight (end of day)
  timezone: "Asia/Colombo",
  /** Live site — used for QR poster */
  siteUrl: "https://salon-booking-seven-rho.vercel.app",
  bookPath: "/book",
  /** Stock images — swap for real cut / shop photos later */
  heroImage:
    "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=1600&q=80",
  aboutImage:
    "https://images.unsplash.com/photo-1599351431202-1e0f034d39a1?auto=format&fit=crop&w=1200&q=80",
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

/** Free QR image for the book link (printable poster /qr page) */
export function bookQrImageUrl(size = 320) {
  const data = encodeURIComponent(bookUrl());
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${data}`;
}
