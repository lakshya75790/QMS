import React from "react";
import HistoryClient from "./_HistoryClient";

const HistoryPage = () => {
  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950/40 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <HistoryClient />
      </div>
    </div>
  );
};

export default HistoryPage;
