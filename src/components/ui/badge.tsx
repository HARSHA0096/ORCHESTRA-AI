import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium backdrop-blur-md transition-colors focus:outline-none focus:ring-2 focus:ring-ring/50",
  {
    variants: {
      variant: {
        default:
          "border-[oklch(0.72_0.21_290/0.35)] bg-[oklch(0.72_0.21_290/0.18)] text-[oklch(0.92_0.06_290)] shadow-[inset_0_1px_0_oklch(1_0_0/0.08)]",
        secondary:
          "border-white/10 bg-white/[0.06] text-secondary-foreground",
        destructive:
          "border-[oklch(0.7_0.25_25/0.4)] bg-[oklch(0.7_0.25_25/0.18)] text-[oklch(0.92_0.08_25)]",
        outline: "text-foreground border-white/15 bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
