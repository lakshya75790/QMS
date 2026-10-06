"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useAlertDialog } from "@/hooks/useAlertDialog";
import useWebName from "@/hooks/useWebName";
import { client } from "@/lib/rpc";
import { getReadableErrorMessage } from "@/lib/utils/stringUtils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { Trash2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

// API setup
const api = client.api.main.org.o[":orgName"]["$delete"];

type ResponseType = InferResponseType<typeof api, 200>;
type RequestType = InferRequestType<typeof api>;

interface DeleteOrgButtonProps {
  webName?: string;
  displayName?: string;
  variant?: "default" | "destructive" | "outline" | "ghost" | "icon";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

const DeleteOrgButton = ({
  webName: propWebName,
  displayName,
  variant = "destructive",
  size = "default",
  className,
}: DeleteOrgButtonProps) => {
  const { webName: routeWebName } = useWebName();
  const targetWebName = propWebName || routeWebName;
  const targetDisplayName = displayName || targetWebName;

  const queryClient = useQueryClient();
  const { replace } = useRouter();
  const pathname = usePathname();

  const { showAlertDialog, setAlertDialogLoading, closeAlertDialog } =
    useAlertDialog();

  const { mutate, isPending } = useMutation<ResponseType, unknown, RequestType>(
    {
      mutationFn: async () => {
        if (!targetWebName) {
          throw new Error("Organization identifier is missing.");
        }
        setAlertDialogLoading(true);
        const response = await api({
          param: { orgName: targetWebName },
        });

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ error: "Failed to delete organization" }));
          throw errorData;
        }
        const data = await response.json();
        return data;
      },
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ["organizations"] });
        toast.success(
          data && "message" in data
            ? (data as { message: string }).message
            : "Organization deleted successfully",
        );
        setAlertDialogLoading(false);
        closeAlertDialog();

        // If on the organization's specific page, redirect back to organization list
        if (pathname?.includes(`/organization/o/`)) {
          replace("/admin/dashboard/organization");
        }
      },
      onError: async (error: unknown) => {
        console.error("Delete organization error:", error);
        let message = "Unable to delete organization. Please try again.";

        if (
          typeof error === "object" &&
          error !== null &&
          "error" in error &&
          typeof (error as { error?: unknown }).error === "string"
        ) {
          message = (error as { error: string }).error;
        } else if (
          typeof error === "object" &&
          error !== null &&
          "message" in error &&
          typeof (error as { message?: unknown }).message === "string"
        ) {
          message = (error as { message: string }).message;
        } else {
          const readable = await getReadableErrorMessage(error);
          if (readable) message = readable;
        }

        toast.error(message);
        setAlertDialogLoading(false);
      },
    },
  );

  const handleDelete = async () => {
    if (!targetWebName) return;

    const confirmed = await showAlertDialog({
      title: "Delete Organization?",
      description: (
        <span>
          Are you sure you want to delete{" "}
          <strong className="font-bold text-slate-900 dark:text-white capitalize">
            &ldquo;{decodeURIComponent(targetDisplayName || targetWebName)}&rdquo;
          </strong>
          ? This action will permanently remove the organization and its associated data according to the system&apos;s deletion rules.
        </span>
      ),
      confirmLabel: "Delete Organization",
      cancelLabel: "Cancel",
      confirmVariant: "destructive",
    });

    if (confirmed) {
      mutate({ param: { orgName: targetWebName } });
    }
  };

  if (variant === "icon") {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={isPending}
        onClick={handleDelete}
        title="Delete Organization"
        aria-label="Delete Organization"
        className={`h-8 w-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors ${
          className || ""
        }`}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="destructive"
      size={size}
      disabled={isPending}
      onClick={handleDelete}
      className={`rounded-xl font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-600/20 hover:shadow-md transition-all flex items-center gap-2 ${
        className || ""
      }`}
    >
      <Trash2 className="h-4 w-4" />
      <span>Delete Organization</span>
    </Button>
  );
};

export default DeleteOrgButton;
