/**
 * Ranu Salon — easy-to-edit business details.
 * Change these anytime without rewriting the whole app.
 * Address / map / real photos can be filled in later.
 */
export const salon = {
  name: "Ranu Salon",
  tagline: "Book your next appointment online — simple, fast, confirmed.",
  description:
    "Ranu Salon offers friendly, professional hair care with easy online booking. Walk in or reserve your time from your phone.",
  phone: "+94767771719",
  phoneDisplay: "+94 76 777 1719",
  /** WhatsApp link uses country code without + */
  whatsapp: "94767771719",
  email: "",
  address: "Sri Lanka", // replace with full address later
  mapUrl: "", // paste Google Maps link later
  /** Open every day: 1:00 PM → midnight */
  openHour: 13,
  openMinute: 0,
  closeHour: 24, // midnight (end of day)
  timezone: "Asia/Colombo",
  /** Stock image — swap for real cut photos later */
  heroImage:
    "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=1600&q=80",
  aboutImage:
    "https://images.unsplash.com/photo-1599351431202-1e0f034d39a1?auto=format&fit=crop&w=1200&q=80",
} as const;

export function whatsappUrl(message?: string) {
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${salon.whatsapp}${text}`;
}

export function telUrl() {
  return `tel:${salon.phone}`;
}
