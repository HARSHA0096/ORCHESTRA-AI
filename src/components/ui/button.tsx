import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium cursor-pointer transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "text-primary-foreground bg-[linear-gradient(135deg,oklch(0.74_0.22_290),oklch(0.78_0.18_220))] shadow-[0_8px_24px_-8px_oklch(0.7_0.24_295/0.55),inset_0_1px_0_oklch(1_0_0/0.18)] hover:shadow-[0_14px_36px_-10px_oklch(0.7_0.24_295/0.65),inset_0_1px_0_oklch(1_0_0/0.22)] hover:-translate-y-px",
        destructive:
          "text-destructive-foreground bg-[linear-gradient(135deg,oklch(0.65_0.24_25),oklch(0.7_0.22_15))] shadow-[0_8px_24px_-8px_oklch(0.65_0.24_25/0.55),inset_0_1px_0_oklch(1_0_0/0.18)] hover:-translate-y-px",
        outline:
          "border border-white/10 bg-white/[0.04] backdrop-blur-md text-foreground hover:bg-white/[0.08] hover:border-white/20",
        secondary:
          "bg-white/[0.06] text-secondary-foreground border border-white/10 backdrop-blur-md hover:bg-white/[0.1]",
        ghost:
          "text-foreground/80 hover:text-foreground hover:bg-white/[0.06]",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-11 rounded-xl px-7 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
