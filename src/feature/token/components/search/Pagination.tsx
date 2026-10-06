"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  limit: number;
  total?: number;
}

export function Pagination({ page, limit, total }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const totalPages = Math.ceil((total || 1) / limit);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-xs">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(page - 1)}
        disabled={page <= 1}
        className="h-9 px-3 rounded-xl border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
      >
        <ChevronLeft className="mr-1.5 h-4 w-4" />
        Previous
      </Button>

      {!!total && (
        <span className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
          Page <strong className="text-slate-900 dark:text-white">{page}</strong> of <strong className="text-slate-900 dark:text-white">{totalPages}</strong> ({total} total)
        </span>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(page + 1)}
        disabled={page >= totalPages}
        className="h-9 px-3 rounded-xl border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
      >
        Next
        <ChevronRight className="ml-1.5 h-4 w-4" />
      </Button>
    </div>
  );
}
