"use client"

import { useState, useEffect } from "react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { FileText, Plus } from "lucide-react"
import { useConfigStore } from "@/lib/store"
import { TEMPLATES } from "@/lib/templates"

export function useCommandMenu() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen((v) => !v)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  return { open, setOpen }
}

export function CommandMenu({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const addNode = useConfigStore((s) => s.addNode)
  const [query, setQuery] = useState("")

  useEffect(() => {
    if (!open) setQuery("")
  }, [open])

  const trimmed = query.trim()

  return (
    <CommandDialog
      open={open}
      onOpenChange={(v) => !v && onClose()}
      title="Add Config Node"
      description="Search config templates or type a name to create a new empty node"
    >
      <CommandInput
        placeholder="Search config types…"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>No templates found.</CommandEmpty>

        {trimmed && (
          <>
            <CommandGroup heading="Create">
              <CommandItem
                value={`create new empty node ${trimmed}`}
                onSelect={() => {
                  addNode({ label: trimmed, inputs: [], outputs: [] })
                  onClose()
                }}
              >
                <Plus />
                Create &ldquo;{trimmed}&rdquo;
                <CommandShortcut>empty</CommandShortcut>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        <CommandGroup heading="Templates">
          {TEMPLATES.map((t) => {
            const { inputs, outputs } = t.makeData()
            return (
              <CommandItem
                key={t.name}
                value={t.name}
                keywords={[t.description, ...t.keywords]}
                onSelect={() => {
                  addNode(t.makeData())
                  onClose()
                }}
              >
                <FileText />
                <div className="flex flex-col">
                  <span>{t.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {t.description}
                  </span>
                </div>
                <CommandShortcut className="flex gap-1">
                  {inputs.length > 0 && <span>{inputs.length}↓</span>}
                  {outputs.length > 0 && <span>{outputs.length}↑</span>}
                </CommandShortcut>
              </CommandItem>
            )
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
