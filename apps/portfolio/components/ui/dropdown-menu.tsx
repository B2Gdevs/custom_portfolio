"use client"

import * as React from "react"
import { Menu } from "@base-ui/react/menu"

import { cn } from "@/lib/utils"

function DropdownMenu(props: Menu.Root.Props) {
  return <Menu.Root modal={false} {...props} />
}

function DropdownMenuTrigger({ className, ...props }: Menu.Trigger.Props) {
  return <Menu.Trigger className={cn(className)} data-slot="dropdown-menu-trigger" {...props} />
}

function DropdownMenuContent({
  className,
  side = "bottom",
  align = "center",
  sideOffset = 4,
  alignOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof Menu.Positioner> & {
  className?: string
}) {
  return (
    <Menu.Portal>
      <Menu.Positioner
        className="z-50 outline-none"
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        {...props}
      >
        <Menu.Popup
          className={cn(
            "min-w-32 overflow-hidden rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md",
            "origin-[var(--transform-origin)] transition-[transform,scale,opacity] duration-100",
            "data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
            "data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
            className
          )}
          data-slot="dropdown-menu-content"
        >
          {children}
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  )
}

function DropdownMenuItem({ className, ...props }: Menu.Item.Props) {
  return (
    <Menu.Item
      className={cn(
        "relative flex cursor-default select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none",
        "data-highlighted:bg-accent data-highlighted:text-accent-foreground",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      data-slot="dropdown-menu-item"
      {...props}
    />
  )
}

function DropdownMenuSeparator({ className, ...props }: Menu.Separator.Props) {
  return (
    <Menu.Separator
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      data-slot="dropdown-menu-separator"
      {...props}
    />
  )
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
}
