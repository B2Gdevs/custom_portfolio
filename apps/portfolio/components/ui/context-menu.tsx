"use client"

import * as React from "react"
import { ContextMenu } from "@base-ui/react/context-menu"

import { cn } from "@/lib/utils"

function ContextMenuRoot(props: ContextMenu.Root.Props) {
  return <ContextMenu.Root {...props} />
}

function ContextMenuTrigger({ className, ...props }: ContextMenu.Trigger.Props) {
  return (
    <ContextMenu.Trigger
      className={cn(className)}
      data-slot="context-menu-trigger"
      {...props}
    />
  )
}

function ContextMenuContent({
  className,
  side = "bottom",
  align = "start",
  sideOffset = 4,
  alignOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof ContextMenu.Positioner> & {
  className?: string
}) {
  return (
    <ContextMenu.Portal>
      <ContextMenu.Positioner
        className="z-50 outline-none"
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        {...props}
      >
        <ContextMenu.Popup
          className={cn(
            "min-w-40 overflow-hidden rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md",
            "origin-[var(--transform-origin)] transition-[transform,scale,opacity] duration-100",
            "data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
            "data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
            className
          )}
          data-slot="context-menu-content"
        >
          {children}
        </ContextMenu.Popup>
      </ContextMenu.Positioner>
    </ContextMenu.Portal>
  )
}

function ContextMenuItem({ className, ...props }: ContextMenu.Item.Props) {
  return (
    <ContextMenu.Item
      className={cn(
        "relative flex cursor-default select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none",
        "data-highlighted:bg-accent data-highlighted:text-accent-foreground",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      data-slot="context-menu-item"
      {...props}
    />
  )
}

function ContextMenuLinkItem({ className, ...props }: ContextMenu.LinkItem.Props) {
  return (
    <ContextMenu.LinkItem
      className={cn(
        "relative flex cursor-default select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none",
        "data-highlighted:bg-accent data-highlighted:text-accent-foreground",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      data-slot="context-menu-link-item"
      closeOnClick
      {...props}
    />
  )
}

function ContextMenuSeparator({ className, ...props }: ContextMenu.Separator.Props) {
  return (
    <ContextMenu.Separator
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      data-slot="context-menu-separator"
      {...props}
    />
  )
}

export {
  ContextMenuRoot,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLinkItem,
  ContextMenuSeparator,
}
