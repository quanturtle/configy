"use client"

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  Handle,
  Position,
  useUpdateNodeInternals,
  type NodeProps,
} from "@xyflow/react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useConfigStore } from "@/lib/store"
import { resolveValues } from "@/lib/resolve"
import { DEFAULT_PROJECT_TITLE, type ConfigNodeData } from "@/lib/types"

// must match header and body CSS exactly so handles align with labels
const HEADER_H = 48 // h-12
const BODY_PAD = 8  // py-2
const ROW_H = 38

function handleTop(index: number): number {
  return HEADER_H + BODY_PAD + index * ROW_H + ROW_H / 2
}

function nodeType(label: string, explicitType?: string): string {
  if (explicitType && explicitType.trim()) return explicitType.trim()
  const name = label.replace(/^.*\//, "")
  const dot = name.lastIndexOf(".")
  if (dot > 0) return name.slice(dot + 1).toLowerCase()
  if (dot === 0) return name.slice(1).toLowerCase()
  return name.toLowerCase()
}

function projectSlug(title: string): string {
  return title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
}

function fileLocation(label: string, projectTitle: string, explicitPath?: string): string {
  // an explicit location set in the editor wins
  if (explicitPath && explicitPath.trim()) return explicitPath.trim()

  // an explicit path in the filename wins — don't override what the user set
  const slash = label.lastIndexOf("/")
  if (slash !== -1) return label.slice(0, slash) || "/"

  // otherwise default to the project home
  const slug = projectSlug(projectTitle)
  if (!slug || projectTitle === DEFAULT_PROJECT_TITLE) return "~/"
  return `~/${slug}`
}

function valueType(value: string): string {
  if (value === "") return "string"
  if (/^-?\d+$/.test(value)) return "int"
  if (/^-?\d*\.\d+$/.test(value)) return "float"
  if (value === "true" || value === "false") return "bool"
  return "string"
}


function ConfigNodeBase({ id, data }: NodeProps) {
  const nodeData = data as ConfigNodeData
  const deleteNode = useConfigStore((s) => s.deleteNode)
  const selectNode = useConfigStore((s) => s.selectNode)
  const updateNode = useConfigStore((s) => s.updateNode)
  const selectedNodeId = useConfigStore((s) => s.selectedNodeId)
  const projectTitle = useConfigStore((s) => s.title)
  const nodes = useConfigStore((s) => s.nodes)
  const edges = useConfigStore((s) => s.edges)
  const selected = selectedNodeId === id
  const resolved = useMemo(
    () => resolveValues(nodes, edges).get(id),
    [nodes, edges, id]
  )
  const updateNodeInternals = useUpdateNodeInternals()

  // the right side of the node = real outputs followed by passthrough inputs
  const rightItems = useMemo(
    () => [
      ...nodeData.outputs.map((h) => ({ handle: h, passthrough: false })),
      ...nodeData.inputs.filter((i) => i.passthrough).map((h) => ({ handle: h, passthrough: true })),
    ],
    [nodeData.outputs, nodeData.inputs]
  )

  useEffect(() => {
    updateNodeInternals(id)
  }, [id, nodeData.inputs.length, rightItems.length, updateNodeInternals])

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const onDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      deleteNode(id)
    },
    [id, deleteNode]
  )

  const startEdit = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      setDraft(nodeData.label)
      setEditing(true)
      requestAnimationFrame(() => inputRef.current?.select())
    },
    [nodeData.label]
  )

  const commitEdit = useCallback(() => {
    const next = draft.trim()
    if (next && next !== nodeData.label) updateNode(id, { label: next })
    setEditing(false)
  }, [draft, id, nodeData.label, updateNode])

  return (
    <div
      className={cn(
        "group relative w-fit min-w-[240px] rounded-lg bg-card ring-1 ring-foreground/10 transition-shadow",
        selected && "ring-2 ring-primary"
      )}
      onClick={() => selectNode(id)}
    >
      {/* input (target) handles */}
      {nodeData.inputs.map((input, i) => (
        <Handle
          key={`in-${input.id}`}
          type="target"
          position={Position.Left}
          id={`input-${input.id}`}
          style={{ top: handleTop(i) }}
          className="!h-2 !w-2 !rounded-full !border-2 !border-card !bg-muted-foreground"
        />
      ))}

      {/* output (source) handles — real outputs + passthrough inputs */}
      {rightItems.map((item, i) => (
        <Handle
          key={`out-${item.handle.id}`}
          type="source"
          position={Position.Right}
          id={`output-${item.handle.id}`}
          style={{ top: handleTop(i) }}
          className="!h-2 !w-2 !rounded-full !border-2 !border-card !bg-primary"
        />
      ))}

      {/* header */}
      <div className="flex h-12 items-center gap-2 border-b border-border px-3">
        <div className="flex flex-1 flex-col">
          {editing ? (
            <input
              ref={inputRef}
              value={draft}
              autoFocus
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitEdit()
                if (e.key === "Escape") setEditing(false)
              }}
              onClick={(e) => e.stopPropagation()}
              className="nodrag w-full bg-transparent font-mono text-[11px] tracking-[0.12em] text-foreground outline-none"
            />
          ) : (
            <span
              onDoubleClick={startEdit}
              className="whitespace-nowrap font-mono text-[11px] tracking-[0.12em] text-foreground cursor-text"
            >
              {nodeData.label || "untitled"}
            </span>
          )}
          <span className="whitespace-nowrap font-mono text-[9px] tracking-[0.08em] text-muted-foreground">
            {fileLocation(nodeData.label || "untitled", projectTitle, nodeData.path)}
          </span>
        </div>

        {/* type next to the icon */}
        <span className="shrink-0 whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
          {nodeType(nodeData.label || "untitled", nodeData.typeName)}
        </span>

        {/* icon placeholder — will become a logo */}
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted/60 ring-1 ring-foreground/10">
          <span className="font-mono text-[9px] uppercase text-muted-foreground">
            {(nodeData.label || "?").replace(/^.*\//, "").replace(/^\./, "").charAt(0) || "?"}
          </span>
        </div>

        <button
          onClick={onDelete}
          className="absolute right-1.5 top-1.5 shrink-0 rounded bg-card opacity-0 transition-opacity group-hover:opacity-100 text-muted-foreground hover:text-destructive"
        >
          <X size={11} />
        </button>
      </div>

      {/* body */}
      <div className="flex gap-8 py-2">
        <div className="flex flex-1 flex-col">
          {nodeData.inputs.map((input) => {
            const value = resolved?.inputs[input.label] ?? ""
            return (
              <div
                key={input.id}
                className="flex flex-col justify-center pl-3"
                style={{ height: ROW_H }}
              >
                <span className="flex items-baseline gap-1.5 whitespace-nowrap">
                  <span className="font-mono text-[10px] tracking-[0.08em] text-foreground">
                    {input.label}
                  </span>
                  {(input.type ?? (value ? valueType(value) : undefined)) && (
                    <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-muted-foreground">
                      {input.type ?? valueType(value)}
                    </span>
                  )}
                  {input.passthrough && (
                    <span className="font-mono text-[13px] leading-none text-primary">
                      ↦
                    </span>
                  )}
                </span>
                {value && (
                  <span className="whitespace-nowrap font-mono text-[8px] tracking-[0.06em] text-muted-foreground">
                    {value}
                  </span>
                )}
              </div>
            )
          })}
        </div>

        <div className="flex flex-1 flex-col">
          {rightItems.map(({ handle, passthrough }) => {
            const value = resolved?.outputs[handle.label] ?? ""
            return (
              <div
                key={handle.id}
                className="flex flex-col items-end justify-center pr-3"
                style={{ height: ROW_H }}
              >
                <span className="flex items-baseline gap-1.5 whitespace-nowrap">
                  {passthrough && (
                    <span className="font-mono text-[13px] leading-none text-primary">
                      ↦
                    </span>
                  )}
                  {(handle.type ?? (value ? valueType(value) : undefined)) && (
                    <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-muted-foreground">
                      {handle.type ?? valueType(value)}
                    </span>
                  )}
                  <span className="font-mono text-[10px] tracking-[0.08em] text-foreground">
                    {handle.label}
                  </span>
                </span>
                {value && (
                  <span className="whitespace-nowrap font-mono text-[8px] tracking-[0.06em] text-muted-foreground">
                    {value}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export const ConfigNode = memo(ConfigNodeBase)
