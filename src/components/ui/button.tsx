import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-extrabold uppercase tracking-wider transition-[background-color,filter] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground border-2 border-b-4 border-[hsl(var(--primary-dark))] hover:brightness-110 active:translate-y-0.5 active:border-b-2",
        destructive: "bg-destructive text-destructive-foreground border-2 border-b-4 border-[hsl(var(--destructive-dark))] hover:brightness-110 active:translate-y-0.5 active:border-b-2",
        outline: "border-2 border-b-4 border-border bg-card text-secondary hover:bg-accent active:translate-y-0.5 active:border-b-2",
        secondary: "bg-secondary text-secondary-foreground border-2 border-b-4 border-[hsl(var(--blue-edge))] hover:brightness-110 active:translate-y-0.5 active:border-b-2",
        ghost: "text-secondary hover:bg-accent",
        link: "text-secondary underline-offset-4 hover:underline normal-case tracking-normal",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 rounded-xl px-3 text-xs",
        lg: "h-12 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
