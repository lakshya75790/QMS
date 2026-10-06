"use client";
import {
  AlertDialog as AlertDialogPrimitive,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useAlertDialogStore } from "@/hooks/useAlertDialog";

export function AlertDialog() {
  const {
    isOpen,
    title,
    description,
    confirmLabel,
    cancelLabel,
    confirmVariant = "default",
    isLoading,
    onConfirm,
    onCancel,
    closeDialog,
  } = useAlertDialogStore();

  const handleCancel = () => {
    if (isLoading) return;
    onCancel();
    closeDialog();
  };

  return (
    <AlertDialogPrimitive
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isLoading) {
          closeDialog();
        }
      }}
    >
      <AlertDialogContent className="rounded-2xl sm:max-w-md border-slate-200 dark:border-slate-800 shadow-2xl">
        <AlertDialogHeader className="space-y-2">
          <AlertDialogTitle className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-slate-600 dark:text-slate-400">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4 flex-row justify-end gap-2.5 sm:gap-3">
          <AlertDialogCancel asChild>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="rounded-xl border-slate-300 dark:border-slate-700 font-semibold"
            >
              {cancelLabel || "Cancel"}
            </Button>
          </AlertDialogCancel>
          <Button
            type="button"
            variant={confirmVariant === "destructive" ? "destructive" : "default"}
            spinner
            onClick={onConfirm}
            disabled={isLoading}
            className={`rounded-xl font-bold shadow-sm transition-all ${
              confirmVariant === "destructive"
                ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20"
                : "bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/20"
            }`}
          >
            {isLoading ? `${confirmLabel || "Processing"}...` : (confirmLabel || "Confirm")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialogPrimitive>
  );
}
