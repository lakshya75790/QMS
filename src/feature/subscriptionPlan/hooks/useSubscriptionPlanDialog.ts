import { create } from "zustand";
import { SelectSubscriptionPlanT } from "@/lib/db/schema";
import { SubscriptionPlanItem } from "./useGetSubscriptionPlans";

export type SubscriptionPlanDialogState =
  | {
      type: "create";
      plan?: never;
    }
  | {
      type: "edit";
      plan: SubscriptionPlanItem | SelectSubscriptionPlanT;
    };

interface UseSubscriptionPlanDialogT {
  isOpen: boolean;
  state?: SubscriptionPlanDialogState;
  onOpen: (state: SubscriptionPlanDialogState) => void;
  onClose: () => void;
}

export const useSubscriptionPlanDialog = create<UseSubscriptionPlanDialogT>((set) => ({
  isOpen: false,
  state: undefined,
  onOpen: (state) => set({ isOpen: true, state }),
  onClose: () => set({ isOpen: false, state: undefined }),
}));
