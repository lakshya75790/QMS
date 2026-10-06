import React from "react";

export default function TableSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-2 sm:p-4 motion-safe:animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-xl bg-accent"></div>
          <div className="space-y-2">
            <div className="h-6 w-36 rounded-lg bg-accent"></div>
            <div className="h-4 w-48 rounded bg-accent"></div>
          </div>
        </div>
        <div className="h-9 w-40 rounded-xl bg-accent"></div>
      </div>

      {/* Hero Card Skeleton */}
      <div className="h-44 w-full rounded-2xl border-2 border-accent bg-card p-6 sm:p-8 space-y-4">
        <div className="h-5 w-40 rounded-full bg-accent"></div>
        <div className="h-12 w-28 rounded-lg bg-accent"></div>
        <div className="h-6 w-48 rounded-lg bg-accent"></div>
      </div>

      {/* Grid Skeleton */}
      <div className="space-y-4">
        <div className="h-6 w-40 rounded-lg bg-accent"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-xl border border-border bg-card p-4 flex justify-between items-center"
            >
              <div className="space-y-2">
                <div className="h-4 w-28 rounded bg-accent"></div>
                <div className="h-3 w-16 rounded bg-accent"></div>
              </div>
              <div className="h-8 w-20 rounded-lg bg-accent"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
