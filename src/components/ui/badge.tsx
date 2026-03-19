import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-white shadow-sm",
        secondary: "border-transparent bg-[#F0F9FF] text-[#0EA5E9] font-medium",
        destructive: "border-transparent bg-[#DC2626] text-white",
        white: "bg-white text-[#0F172A] border border-[#E2E8F0] shadow-sm",
        paid: "border-transparent bg-[#DCFCE7] text-[#16A34A] font-medium",
        rejected: "border-transparent bg-[#FEE2E2] text-[#DC2626] font-medium",
        pending: "border-transparent bg-[#FEF3C7] text-[#D97706] font-medium",
        approved: "border-transparent bg-[#DBEAFE] text-[#1D4ED8] font-medium",
        outline: "text-[#334155] border-[#E2E8F0] bg-white",
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
