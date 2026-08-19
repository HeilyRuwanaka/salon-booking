"use client";

import { useCallback, useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { salon } from "@/lib/salon.config";
import { formatBookingWhen } from "@/lib/slots";
import type { ReportRange, ReportSummary } from "@/lib/reports";
import { toDateKey } from "@/lib/slots";

export function AdminReports() {
  const [range, setRange] = useState<ReportRange>("day");
  const [date, setDate] = useState(toDateKey(new Date()));
  const [report, setReport] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/reports?range=${range}&date=${date}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load report");
      setReport(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load report");
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, [range, date]);

  useEffect(() => {
    void load();
  }, [load]);

  function downloadPdf() {
    if (!report) return;
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const margin = 14;

    doc.setFontSize(18);
    doc.text(salon.name, margin, 18);
    doc.setFontSize(11);
    doc.text("Earnings & bookings report", margin, 26);
    doc.setFontSize(10);
    doc.setTextColor(80);
    doc.text(`Period: ${report.label} (${report.range})`, margin, 34);
    doc.text(`Generated: ${new Date().toLocaleString("en-LK")}`, margin, 40);
    doc.setTextColor(0);

    doc.setFontSize(12);
    doc.text(`Earnings (completed): LKR ${report.earningsLkr.toLocaleString("en-LK")}`, margin, 52);
    doc.setFontSize(10);
    doc.text(
      `Completed ${report.counts.completed} · Pending ${report.counts.pending} · Confirmed ${report.counts.confirmed} · Cancelled ${report.counts.cancelled} · No-show ${report.counts.no_show} · Total ${report.counts.total}`,
      margin,
      60,
      { maxWidth: 180 },
    );

    if (report.topServices.length > 0) {
      doc.setFontSize(11);
      doc.text("Top services (completed)", margin, 72);
      autoTable(doc, {
        startY: 76,
        head: [["Service", "Jobs", "Earnings (LKR)"]],
        body: report.topServices.map((s) => [
          s.name,
          String(s.count),
          s.earningsLkr.toLocaleString("en-LK"),
        ]),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [18, 24, 22] },
      });
    }

    const afterServices =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((doc as any).lastAutoTable?.finalY as number | undefined) ?? 80;

    doc.setFontSize(11);
    doc.text("Bookings in period", margin, afterServices + 10);
    autoTable(doc, {
      startY: afterServices + 14,
      head: [["When", "Customer", "Service", "Status", "LKR"]],
      body: report.rows.map((r) => [
        formatBookingWhen(r.when),
        r.customerName,
        r.serviceName,
        r.status,
        r.status === "completed" ? r.priceLkr.toLocaleString("en-LK") : "—",
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [47, 106, 86] },
      columnStyles: { 0: { cellWidth: 42 } },
    });

    doc.save(`ranu-report-${report.range}-${report.fromKey}.pdf`);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {(
          [
            ["day", "Daily"],
            ["week", "Weekly"],
            ["month", "Monthly"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setRange(key)}
            className={`rounded-xl py-2 text-sm font-semibold ${
              range === key ? "bg-copper text-white" : "bg-white border border-line"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <label className="block text-sm">
        Anchor date
        <input
          type="date"
          className="field mt-1"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </label>

      {error && (
        <p className="rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
      )}

      {loading && <p className="text-sm text-mute">Loading report…</p>}

      {report && !loading && (
        <>
          <div className="rounded-2xl border border-line bg-white p-4">
            <p className="text-sm text-mute">{report.label}</p>
            <p className="mt-2 font-display text-3xl">
              LKR {report.earningsLkr.toLocaleString("en-LK")}
            </p>
            <p className="mt-1 text-sm text-mute">Completed bookings only</p>
            <p className="mt-4 text-sm">
              Done {report.counts.completed} · Pending {report.counts.pending} · Confirmed{" "}
              {report.counts.confirmed}
            </p>
            <p className="text-sm text-mute">
              Cancelled {report.counts.cancelled} · No-show {report.counts.no_show} · Total{" "}
              {report.counts.total}
            </p>
          </div>

          {report.topServices.length > 0 && (
            <div className="rounded-2xl border border-line bg-white p-4">
              <p className="font-semibold">Top services</p>
              <ul className="mt-3 divide-y divide-line">
                {report.topServices.map((s) => (
                  <li key={s.serviceId} className="flex justify-between py-2 text-sm">
                    <span>
                      {s.name}{" "}
                      <span className="text-mute">×{s.count}</span>
                    </span>
                    <span className="font-semibold">
                      LKR {s.earningsLkr.toLocaleString("en-LK")}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button type="button" className="btn btn-primary w-full" onClick={downloadPdf}>
            Download PDF report
          </button>

          <div className="rounded-2xl border border-line bg-white p-4">
            <p className="font-semibold">Bookings in period</p>
            <ul className="mt-3 space-y-3">
              {report.rows.length === 0 && (
                <li className="text-sm text-mute">No bookings in this range.</li>
              )}
              {report.rows.map((r) => (
                <li key={r.id} className="border-t border-line pt-3 text-sm first:border-0 first:pt-0">
                  <p className="font-semibold">{r.customerName}</p>
                  <p className="text-mute">{formatBookingWhen(r.when)}</p>
                  <p>
                    {r.serviceName} · {r.status}
                    {r.status === "completed"
                      ? ` · LKR ${r.priceLkr.toLocaleString("en-LK")}`
                      : ""}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
