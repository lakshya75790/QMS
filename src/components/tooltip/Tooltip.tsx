import React from "react";
import {
  Tooltip as TooltipWrapper,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Children } from "@/types";

interface TooltipProps extends Children {
  content: string;
  side?: "top" | "bottom" | "left" | "right";
  sideOffset?: number;
}

const Tooltip = ({
  children,
  content,
  side = "top",
  sideOffset = 6,
}: TooltipProps) => {
  return (
    <TooltipProvider delayDuration={100}>
      <TooltipWrapper>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={side} sideOffset={sideOffset}>
          {content}
        </TooltipContent>
      </TooltipWrapper>
    </TooltipProvider>
  );
};

export default Tooltip;
