"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-lg border-2 px-3 py-1 text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-all duration-300 overflow-hidden hover:scale-105",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gradient-to-r from-primary to-secondary text-white [a&]:hover:from-primary/90 [a&]:hover:to-secondary/90 shadow-md hover:shadow-lg",
        secondary:
          "border-transparent bg-gradient-to-r from-secondary to-accent text-white [a&]:hover:from-secondary/90 [a&]:hover:to-accent/90 shadow-md hover:shadow-lg",
        destructive:
          "border-transparent bg-gradient-to-r from-destructive to-destructive/80 text-white [a&]:hover:from-destructive/90 [a&]:hover:to-destructive/70 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 shadow-md hover:shadow-lg",
        outline:
          "border-primary/50 text-primary [a&]:hover:bg-primary/10 [a&]:hover:border-primary [a&]:hover:text-primary font-semibold",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
