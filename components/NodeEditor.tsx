"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { ChevronDown, Plus, Trash2, X } from "lucide-react"
import { useConfigStore } from "@/lib/store"
import { generateFileContent } from "@/lib/generate"
import { resolveValues, type ResolvedNode } from "@/lib/resolve"
import { cn } from "@/lib/utils"
import { VALUE_TYPES, type HandleDef, type ValueType } from "@/lib/types"

function randomId(): string {
  return Math.random().toString(36).slice(2, 9)
}

const EMPTY_RESOLVED: ResolvedNode = { inputs: {}, outputs: {} }

const FIELD_CLASS = cn(
  "rounded-md border border-border bg-muted/40 px-2 py-1",
  "font-mono text-[11px] text-foreground placeholder:text-muted-foreground/50",
  "outline-none focus:border-ring focus:ring-1 focus:ring-ring/50"
)

function HandleList({
  label,
  handles,
  onChange,
  valuePlaceholder,
  resolvedValueFor,
  showPassthrough = false,
}: {
  label: string
  handles: HandleDef[]
  onChange: (handles: HandleDef[]) => void
  valuePlaceholder: string
  resolvedValueFor?: (h: HandleDef) => string
  showPassthrough?: boolean
}) {
  const add = () =>
    onChange([...handles, { id: randomId(), label: "", type: "string" }])
  const remove = (id: string) => onChange(handles.filter((h) => h.id !== id))
  const patch = (id: string, fields: Partial<HandleDef>) =>
    onChange(handles.map((h) => (h.id === id ? { ...h, ...fields } : h)))

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </span>
        <button
          onClick={add}
          className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
        >
          <Plus size={10} />
          Add
        </button>
      </div>

      <div className="flex flex-col gap-1.5">
        {handles.map((h) => {
          const resolved = resolvedValueFor?.(h)
          const overridden = resolved !== undefined && resolved !== "" && resolved !== (h.value ?? "")
          return (
            <div key={h.id} className="flex items-center gap-1.5">
              <input
                value={h.label}
                onChange={(e) => patch(h.id, { label: e.target.value })}
                placeholder="key name"
                className={cn(FIELD_CLASS, "min-w-0 flex-1")}
              />
              <div className="relative shrink-0">
                <select
                  value={h.type ?? "string"}
                  onChange={(e) => patch(h.id, { type: e.target.value as ValueType })}
                  className={cn(FIELD_CLASS, "w-[84px] cursor-pointer appearance-none pr-6")}
                >
                  {VALUE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={11}
                  className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
              </div>
              <input
                value={h.value ?? ""}
                onChange={(e) => patch(h.id, { value: e.target.value })}
                placeholder={overridden ? resolved : valuePlaceholder}
                className={cn(
                  FIELD_CLASS,
                  "min-w-0 flex-1",
                  overridden && "placeholder:text-foreground/60"
                )}
              />
              <div className="flex w-[48px] shrink-0 items-center justify-end gap-1.5">
                {showPassthrough ? (
                  <button
                    onClick={() => patch(h.id, { passthrough: !h.passthrough })}
                    title="passthrough — also expose this input as an output"
                    className={cn(
                      "rounded-md border px-1.5 py-1 font-mono text-[14px] leading-none transition-colors",
                      h.passthrough
                        ? "border-primary/50 bg-primary/15 text-foreground"
                        : "border-border text-muted-foreground/50 hover:text-foreground"
                    )}
                  >
                    ↦
                  </button>
                ) : (
                  <span className="w-[23px]" aria-hidden />
                )}
                <button
                  onClick={() => remove(h.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          )
        })}
        {handles.length === 0 && (
          <p className="text-[10px] text-muted-foreground/50 italic">none</p>
        )}
      </div>
    </div>
  )
}

function PreviewPane({ nodeId }: { nodeId: string }) {
  const nodes = useConfigStore((s) => s.nodes)
  const edges = useConfigStore((s) => s.edges)

  const node = nodes.find((n) => n.id === nodeId)
  if (!node) return null

  const resolved = resolveValues(nodes, edges).get(nodeId) ?? EMPTY_RESOLVED
  const hasContent = node.data.inputs.length > 0 || node.data.outputs.length > 0

  if (!hasContent) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <p className="text-center text-[11px] text-muted-foreground/50 italic">
          Add inputs or outputs to see a preview
        </p>
      </div>
    )
  }

  const content = generateFileContent(node.data, resolved)

  return (
    <div className="flex-1 overflow-auto p-4">
      <pre className="whitespace-pre font-mono text-[11px] leading-relaxed text-foreground/80">
        {content}
      </pre>
    </div>
  )
}

type Tab = "preview" | "edit"

function EditorPanel({ nodeId }: { nodeId: string }) {
  const nodes = useConfigStore((s) => s.nodes)
  const edges = useConfigStore((s) => s.edges)
  const updateNode = useConfigStore((s) => s.updateNode)
  const selectNode = useConfigStore((s) => s.selectNode)

  const node = nodes.find((n) => n.id === nodeId)
  const resolved = node
    ? resolveValues(nodes, edges).get(node.id) ?? EMPTY_RESOLVED
    : EMPTY_RESOLVED

  const [tab, setTab] = useState<Tab>("preview")
  const [label, setLabel] = useState(() => node?.data.label ?? "")
  const [path, setPath] = useState(() => node?.data.path ?? "")
  const [typeName, setTypeName] = useState(() => node?.data.typeName ?? "")
  const [inputs, setInputs] = useState<HandleDef[]>(() => node?.data.inputs ?? [])
  const [outputs, setOutputs] = useState<HandleDef[]>(() => node?.data.outputs ?? [])

  if (!node) return null

  const save = () => {
    updateNode(node.id, {
      label,
      path: path.trim() || undefined,
      typeName: typeName.trim() || undefined,
      inputs,
      outputs,
    })
    setTab("preview")
  }

  return (
    <motion.aside
      initial={{ x: 448 }}
      animate={{ x: 0 }}
      exit={{ x: 448 }}
      transition={{ ease: [0.2, 0.7, 0.2, 1], duration: 0.3 }}
      className="flex w-[28rem] shrink-0 flex-col border-l border-border bg-card"
    >
      {/* header */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-border px-4">
        <span className="font-mono text-[11px] tracking-[0.12em] text-foreground truncate">
          {node.data.label || "untitled"}
        </span>
        <button
          onClick={() => selectNode(null)}
          className="ml-2 shrink-0 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* tab bar */}
      <div className="flex shrink-0 border-b border-border">
        {(["preview", "edit"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "relative flex-1 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors",
              tab === t
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t}
            {tab === t && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute inset-x-0 bottom-0 h-px bg-foreground"
              />
            )}
          </button>
        ))}
      </div>

      {/* tab content */}
      {tab === "preview" ? (
        <PreviewPane nodeId={node.id} />
      ) : (
        <>
          <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-4">
            {/* filename */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Filename
              </label>
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder=".env"
                className={cn(
                  "rounded-md border border-border bg-muted/40 px-2.5 py-1.5",
                  "font-mono text-[12px] text-foreground placeholder:text-muted-foreground/50",
                  "outline-none focus:border-ring focus:ring-1 focus:ring-ring/50"
                )}
              />
            </div>

            {/* location */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Location
              </label>
              <input
                value={path}
                onChange={(e) => setPath(e.target.value)}
                placeholder="~/ (derived from filename)"
                className={cn(
                  "rounded-md border border-border bg-muted/40 px-2.5 py-1.5",
                  "font-mono text-[12px] text-foreground placeholder:text-muted-foreground/50",
                  "outline-none focus:border-ring focus:ring-1 focus:ring-ring/50"
                )}
              />
            </div>

            {/* type */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Type
              </label>
              <input
                value={typeName}
                onChange={(e) => setTypeName(e.target.value)}
                placeholder="(derived from filename)"
                className={cn(
                  "rounded-md border border-border bg-muted/40 px-2.5 py-1.5",
                  "font-mono text-[12px] text-foreground placeholder:text-muted-foreground/50",
                  "outline-none focus:border-ring focus:ring-1 focus:ring-ring/50"
                )}
              />
            </div>

            <HandleList
              label="Inputs"
              handles={inputs}
              onChange={setInputs}
              valuePlaceholder="default value"
              resolvedValueFor={(h) => resolved.inputs[h.label] ?? ""}
              showPassthrough
            />
            <HandleList
              label="Outputs"
              handles={outputs}
              onChange={setOutputs}
              valuePlaceholder="value"
            />
          </div>

          <div className="flex shrink-0 gap-2 border-t border-border p-4">
            <button
              onClick={save}
              className={cn(
                "flex-1 rounded-md bg-primary px-3 py-1.5 font-mono text-[11px]",
                "uppercase tracking-[0.12em] text-primary-foreground",
                "transition-opacity hover:opacity-80"
              )}
            >
              Save
            </button>
            <button
              onClick={() => setTab("preview")}
              className={cn(
                "rounded-md border border-border px-3 py-1.5 font-mono text-[11px]",
                "uppercase tracking-[0.12em] text-muted-foreground",
                "transition-colors hover:border-foreground/30 hover:text-foreground"
              )}
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </motion.aside>
  )
}

export function NodeEditor() {
  const selectedNodeId = useConfigStore((s) => s.selectedNodeId)

  return (
    <AnimatePresence>
      {selectedNodeId && <EditorPanel key={selectedNodeId} nodeId={selectedNodeId} />}
    </AnimatePresence>
  )
}
