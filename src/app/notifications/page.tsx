import React from "react";
import NotificationsClient from "./_NotificationsClient";

export const metadata = {
  title: "Notifications | Mediscan",
  description: "View and manage all real-time in-app notifications in Mediscan",
};

const NotificationsPage = () => {
  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950/40 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <NotificationsClient showBackButton={true} />
      </div>
    </div>
  );
};

export default NotificationsPage;
