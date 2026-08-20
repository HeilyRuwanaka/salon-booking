/**
 * Ranu Salon — business details shown on the public site.
 */
export const salon = {
  name: "Ranu Salon",
  tagline: "Book online. Walk in looking sharp.",
  description:
    "Ranu Salon in Homagama — haircuts, beard trims, and more. Book online anytime.",
  aboutLead: "Simple cuts. Clear times.",
  aboutParagraphs: [
    "Ranu Salon is a neighbourhood barbershop in Homagama. We keep the menu clear, the times honest, and booking easy from your phone.",
    "Open every day from 11:00 AM to 11:00 PM. Book online, message us on WhatsApp, or call if you prefer.",
  ] as const,
  ownerName: "Ranu",
  phone: "+94767771719",
  phoneDisplay: "+94 76 777 1719",
  whatsapp: "94767771719",
  email: "",
  address: "130/A1, Pitipana South, Arachigoda, Homagama",
  addressNote: "Open in Maps for directions.",
  mapUrl: "https://maps.app.goo.gl/3GZUynmhE7sseKNXA",
  mapLat: 6.820859,
  mapLng: 80.017449,
  hoursLabel: "Every day · 11:00 AM – 11:00 PM",
  hoursDetail: "Open every day from 11:00 AM to 11:00 PM.",
  openHour: 11,
  openMinute: 0,
  closeHour: 23,
  timezone: "Asia/Colombo",
  siteUrl: "https://salon-booking-seven-rho.vercel.app",
  bookPath: "/book",
  heroImage: "/images/hero.jpg",
  aboutImage: "/images/about.jpg",
  logoImage: "/images/logo.png",
  logoMarkImage: "/images/logo-mark.png",
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

export function mapEmbedUrl() {
  // OpenStreetMap embed — reliable in iframes (no API key; Google’s old embed URL 404s)
  const { mapLat: lat, mapLng: lng } = salon;
  const d = 0.008;
  const bbox = encodeURIComponent(
    `${lng - d},${lat - d},${lng + d},${lat + d}`,
  );
  const marker = encodeURIComponent(`${lat},${lng}`);
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${marker}`;
}

export function bookQrImageUrl(size = 320) {
  const data = encodeURIComponent(bookUrl());
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${data}`;
}
