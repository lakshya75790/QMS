"use client";
import { Button } from "@/components/ui/button";
import React from "react";
import useAddEditTransactionDialog from "../../hooks/useAddEditTransactionDialog";
import { Plus } from "lucide-react";

const AddNewOrgTransactionButton = ({ webName }: { webName: string }) => {
  const onOpen = useAddEditTransactionDialog((s) => s.onOpen);
  return (
    <Button
      onClick={() => onOpen({ type: "create", webName })}
      className="gap-1.5 rounded-xl bg-teal-600 font-semibold text-white hover:bg-teal-700 shadow-sm"
    >
      <Plus className="h-4 w-4" />
      <span>Add Transaction</span>
    </Button>
  );
};

export default AddNewOrgTransactionButton;
