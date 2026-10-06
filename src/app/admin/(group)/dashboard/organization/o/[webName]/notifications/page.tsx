import Title from "@/feature/organization/components/sections/Title";
import NotificationsClient from "@/app/notifications/_NotificationsClient";
import React from "react";

export const metadata = {
  title: "Notifications | Mediscan",
  description: "View and manage clinic real-time notifications",
};

const OrganizationNotificationsPage = () => {
  return (
    <>
      <Title />
      <NotificationsClient />
    </>
  );
};

export default OrganizationNotificationsPage;
