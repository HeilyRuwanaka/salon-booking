"use client";

export function PrintButton({ label = "Print poster" }: { label?: string }) {
  return (
    <button type="button" className="btn btn-primary" onClick={() => window.print()}>
      {label}
    </button>
  );
}
