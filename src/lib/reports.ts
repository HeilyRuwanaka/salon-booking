import { salon } from "./salon.config";
import { toDateKey } from "./slots";
import type { Booking, BookingStatus, Service } from "./types";

export type ReportRange = "day" | "week" | "month";

function addDaysKey(dateKey: string, delta: number): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d + delta));
  return `${utc.getUTCFullYear()}-${String(utc.getUTCMonth() + 1).padStart(2, "0")}-${String(utc.getUTCDate()).padStart(2, "0")}`;
}

function weekdayMon0(anchor: Date): number {
  const wd = new Intl.DateTimeFormat("en-US", {
    timeZone: salon.timezone,
    weekday: "short",
  }).format(anchor);
  const map: Record<string, number> = {
    Mon: 0,
    Tue: 1,
    Wed: 2,
    Thu: 3,
    Fri: 4,
    Sat: 5,
    Sun: 6,
  };
  return map[wd] ?? 0;
}

/** Inclusive Colombo date range for day / week (Mon–Sun) / month */
export function rangeBounds(
  range: ReportRange,
  anchor: Date = new Date(),
): { from: Date; to: Date; label: string; fromKey: string; toKey: string } {
  const key = toDateKey(anchor);
  const [y, m] = key.split("-").map(Number);

  if (range === "day") {
    return {
      from: new Date(`${key}T00:00:00+05:30`),
      to: new Date(`${key}T23:59:59.999+05:30`),
      label: key,
      fromKey: key,
      toKey: key,
    };
  }

  if (range === "month") {
    const fromKey = `${y}-${String(m).padStart(2, "0")}-01`;
    const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const toKey = `${y}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    return {
      from: new Date(`${fromKey}T00:00:00+05:30`),
      to: new Date(`${toKey}T23:59:59.999+05:30`),
      label: `${y}-${String(m).padStart(2, "0")}`,
      fromKey,
      toKey,
    };
  }

  const mon0 = weekdayMon0(anchor);
  const fromKey = addDaysKey(key, -mon0);
  const toKey = addDaysKey(fromKey, 6);
  return {
    from: new Date(`${fromKey}T00:00:00+05:30`),
    to: new Date(`${toKey}T23:59:59.999+05:30`),
    label: `${fromKey} → ${toKey}`,
    fromKey,
    toKey,
  };
}

export function bookingInRange(b: Booking, from: Date, to: Date) {
  const t = new Date(b.startsAt).getTime();
  return t >= from.getTime() && t <= to.getTime();
}

export type ChartPoint = {
  key: string;
  label: string;
  earningsLkr: number;
};

export type ReportSummary = {
  range: ReportRange;
  label: string;
  fromKey: string;
  toKey: string;
  earningsLkr: number;
  counts: Record<BookingStatus | "total", number>;
  topServices: { serviceId: string; name: string; count: number; earningsLkr: number }[];
  chart: ChartPoint[];
  rows: {
    id: string;
    when: string;
    customerName: string;
    customerPhone: string;
    serviceName: string;
    priceLkr: number;
    status: BookingStatus;
  }[];
};

function colomboHour(iso: string): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: salon.timezone,
    hour: "numeric",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));
  return Number(parts.find((p) => p.type === "hour")?.value ?? "0");
}

function buildChart(
  completed: Booking[],
  svcMap: Map<string, Service>,
  range: ReportRange,
  fromKey: string,
  toKey: string,
): ChartPoint[] {
  const earn = (b: Booking) => svcMap.get(b.serviceId)?.priceLkr ?? 0;

  if (range === "day") {
    const byHour = new Map<number, number>();
    for (let h = salon.openHour; h < salon.closeHour; h++) byHour.set(h, 0);
    for (const b of completed) {
      const h = colomboHour(b.startsAt);
      if (!byHour.has(h)) continue;
      byHour.set(h, (byHour.get(h) || 0) + earn(b));
    }
    return [...byHour.entries()].map(([h, earningsLkr]) => ({
      key: String(h),
      label: `${h}`,
      earningsLkr,
    }));
  }

  if (range === "week") {
    const days: ChartPoint[] = [];
    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    for (let i = 0; i < 7; i++) {
      const key = addDaysKey(fromKey, i);
      days.push({ key, label: labels[i], earningsLkr: 0 });
    }
    const index = new Map(days.map((d, i) => [d.key, i]));
    for (const b of completed) {
      const key = toDateKey(new Date(b.startsAt));
      const i = index.get(key);
      if (i === undefined) continue;
      days[i].earningsLkr += earn(b);
    }
    return days;
  }

  // month — one bar per calendar day
  const days: ChartPoint[] = [];
  let cursor = fromKey;
  while (cursor <= toKey) {
    days.push({
      key: cursor,
      label: String(Number(cursor.slice(8))),
      earningsLkr: 0,
    });
    cursor = addDaysKey(cursor, 1);
  }
  const index = new Map(days.map((d, i) => [d.key, i]));
  for (const b of completed) {
    const key = toDateKey(new Date(b.startsAt));
    const i = index.get(key);
    if (i === undefined) continue;
    days[i].earningsLkr += earn(b);
  }
  return days;
}


export function buildReport(
  bookings: Booking[],
  services: Service[],
  range: ReportRange,
  anchor: Date = new Date(),
): ReportSummary {
  const { from, to, label, fromKey, toKey } = rangeBounds(range, anchor);
  const svcMap = new Map(services.map((s) => [s.id, s]));
  const inRange = bookings.filter((b) => bookingInRange(b, from, to));

  const counts: ReportSummary["counts"] = {
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    no_show: 0,
    total: inRange.length,
  };

  for (const b of inRange) {
    counts[b.status] = (counts[b.status] || 0) + 1;
  }

  const completed = inRange.filter((b) => b.status === "completed");
  let earningsLkr = 0;
  const byService = new Map<string, { count: number; earningsLkr: number }>();

  for (const b of completed) {
    const price = svcMap.get(b.serviceId)?.priceLkr ?? 0;
    earningsLkr += price;
    const cur = byService.get(b.serviceId) || { count: 0, earningsLkr: 0 };
    cur.count += 1;
    cur.earningsLkr += price;
    byService.set(b.serviceId, cur);
  }

  const topServices = [...byService.entries()]
    .map(([serviceId, v]) => ({
      serviceId,
      name: svcMap.get(serviceId)?.name || serviceId,
      count: v.count,
      earningsLkr: v.earningsLkr,
    }))
    .sort((a, b) => b.earningsLkr - a.earningsLkr);

  const rows = inRange
    .slice()
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
    .map((b) => ({
      id: b.id,
      when: b.startsAt,
      customerName: b.customerName,
      customerPhone: b.customerPhone,
      serviceName: svcMap.get(b.serviceId)?.name || "Service",
      priceLkr: svcMap.get(b.serviceId)?.priceLkr ?? 0,
      status: b.status,
    }));

  return {
    range,
    label,
    fromKey,
    toKey,
    earningsLkr,
    counts,
    topServices,
    chart: buildChart(completed, svcMap, range, fromKey, toKey),
    rows,
  };
}
