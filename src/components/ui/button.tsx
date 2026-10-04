import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-[background-color,color,box-shadow,filter,transform] duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:shadow-focus disabled:pointer-events-none disabled:opacity-45 disabled:shadow-none disabled:active:scale-100 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-brand text-primary-foreground shadow-brand hover:brightness-[1.08]",
        secondary:
          "border border-border bg-secondary text-secondary-foreground hover:bg-secondary/70",
        outline:
          "border border-border bg-transparent text-foreground hover:border-primary/40 hover:bg-accent hover:text-accent-foreground",
        ghost:
          "text-muted-foreground hover:bg-secondary hover:text-foreground",
        destructive:
          "bg-destructive text-destructive-foreground hover:brightness-[1.08]",
        subtle:
          "border border-primary/25 bg-primary/10 text-primary hover:bg-primary/20",
        link: "h-auto rounded-none p-0 text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        xs: "h-8 rounded-sm px-2.5 text-xs [&_svg]:size-3.5",
        sm: "h-9 rounded-md px-3 text-[13px]",
        lg: "h-12 rounded-lg px-6 text-base",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8 rounded-sm [&_svg]:size-3.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

// eslint-disable-next-line react-refresh/only-export-components
export { Button, buttonVariants }
