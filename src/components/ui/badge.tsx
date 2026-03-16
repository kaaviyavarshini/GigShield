import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-white shadow-sm",
        secondary: "border-transparent bg-[#F0F9FF] text-[#0EA5E9] font-bold",
        destructive: "border-transparent bg-destructive text-white shadow-sm",
        white: "bg-white text-[#0C1A2E] border border-[#BAE6FD] shadow-sm",
        paid: "border-transparent bg-[#DCFCE7] text-[#16A34A] font-bold shadow-sm",
        rejected: "border-transparent bg-[#FEE2E2] text-[#DC2626] font-bold shadow-sm",
        pending: "border-transparent bg-[#FEF9C3] text-[#CA8A04] font-bold shadow-sm",
        approved: "border-transparent bg-[#DBEAFE] text-[#1D4ED8] font-bold shadow-sm",
        outline: "text-[#0C1A2E] border-[#BAE6FD] bg-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
