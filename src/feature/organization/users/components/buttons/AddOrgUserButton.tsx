"use client";
import React from "react";
import { useAddEditOrgUserDialog } from "../../hooks/useAddEditOrgUserDialog";
import { Button } from "@/components/ui/button";
import useWebName from "@/hooks/useWebName";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Plus } from "lucide-react";

const AddOrgUserButton = () => {
  const onOpen = useAddEditOrgUserDialog((s) => s.onOpen);
  const { webName } = useWebName();
  const user = useCurrentUser();

  if (user?.role !== "ADMIN" && user?.role !== "SUPER_ADMIN") {
    return null;
  }

  return (
    <Button
      onClick={() => onOpen({ type: "create", orgUserInfo: { webName } })}
      className="gap-1.5 rounded-xl bg-teal-600 font-semibold text-white hover:bg-teal-700 shadow-sm"
    >
      <Plus className="h-4 w-4" />
      <span>Add User</span>
    </Button>
  );
};

export default AddOrgUserButton;
