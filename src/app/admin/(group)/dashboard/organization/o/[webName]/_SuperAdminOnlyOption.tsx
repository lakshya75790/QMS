"use client";
import AddOrgButton from "@/feature/admin/dashboard/components/button/AddOrgButton";
import DeleteOrgButton from "@/feature/organization/components/buttons/DeleteOrgButton";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import React, { Suspense } from "react";

const SuperAdminOnlyOption = () => {
  const user = useCurrentUser();

  if (!user || !user.id || user?.role !== "SUPER_ADMIN") return null;

  return (
    <Suspense>
      <div className="mb-4 flex items-center justify-end gap-3">
        <AddOrgButton variant="secondary" />
        <DeleteOrgButton />
      </div>
    </Suspense>
  );
};

export default SuperAdminOnlyOption;
