"use client"

import { useCallback, useRef, useState } from "react"
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Panel,
  useReactFlow,
  type Node,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import {
  Zap,
  Plus,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Lock,
  Unlock,
  Download,
  Upload,
  Sparkles,
} from "lucide-react"
import { ConfigNode } from "@/components/ConfigNode"
import { NodeEditor } from "@/components/NodeEditor"
import { GenerateModal } from "@/components/GenerateModal"
import { CommandMenu, useCommandMenu } from "@/components/CommandMenu"
import { useConfigStore } from "@/lib/store"
import { cn } from "@/lib/utils"

const nodeTypes = { configNode: ConfigNode }

function FlowControls({
  locked,
  onLockToggle,
}: {
  locked: boolean
  onLockToggle: () => void
}) {
  const { zoomIn, zoomOut, fitView } = useReactFlow()

  return (
    <Panel position="bottom-left" className="m-3">
      <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-card">
        {[
          { icon: ZoomIn, onClick: () => zoomIn({ duration: 200 }), active: false },
          { icon: ZoomOut, onClick: () => zoomOut({ duration: 200 }), active: false },
          { icon: Maximize2, onClick: () => fitView({ duration: 200, padding: 0.2 }), active: false },
          { icon: locked ? Lock : Unlock, onClick: onLockToggle, active: locked },
        ].map(({ icon: Icon, onClick, active }, i) => (
          <button
            key={i}
            onClick={onClick}
            className={cn(
              "flex h-7 w-7 items-center justify-center border-b border-border last:border-0",
              "text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
              active && "bg-accent/50 text-foreground"
            )}
          >
            <Icon size={13} />
          </button>
        ))}
      </div>
    </Panel>
  )
}

function Canvas() {
  const nodes = useConfigStore((s) => s.nodes)
  const edges = useConfigStore((s) => s.edges)
  const onNodesChange = useConfigStore((s) => s.onNodesChange)
  const onEdgesChange = useConfigStore((s) => s.onEdgesChange)
  const onConnect = useConfigStore((s) => s.onConnect)
  const selectNode = useConfigStore((s) => s.selectNode)
  const loadSample = useConfigStore((s) => s.loadSample)
  const generate = useConfigStore((s) => s.generate)
  const isGenerating = useConfigStore((s) => s.isGenerating)
  const selectedNodeId = useConfigStore((s) => s.selectedNodeId)
  const title = useConfigStore((s) => s.title)
  const setTitle = useConfigStore((s) => s.setTitle)
  const exportProject = useConfigStore((s) => s.exportProject)
  const importProject = useConfigStore((s) => s.importProject)

  const { open, setOpen } = useCommandMenu()
  const [locked, setLocked] = useState(false)
  const toggleLock = useCallback(() => setLocked((l) => !l), [])
  const { setCenter, getNode, getZoom } = useReactFlow()
  const importInputRef = useRef<HTMLInputElement>(null)

  const onImportFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) importProject(file)
      e.target.value = ""
    },
    [importProject]
  )

  const onPaneClick = useCallback(() => {
    selectNode(null)
  }, [selectNode])

  const focusNode = useCallback(
    (id: string) => {
      const editorWasOpen = !!selectedNodeId
      selectNode(id)
      // wait for the editor panel to finish opening so the canvas has its final width
      const delay = editorWasOpen ? 0 : 320
      setTimeout(() => {
        const node = getNode(id) as Node | undefined
        if (!node) return
        const w = node.measured?.width ?? 240
        const h = node.measured?.height ?? 120
        setCenter(node.position.x + w / 2, node.position.y + h / 2, {
          zoom: Math.max(getZoom(), 0.9),
          duration: 400,
        })
      }, delay)
    },
    [selectedNodeId, selectNode, getNode, getZoom, setCenter]
  )

  return (
    <div className="flex h-full flex-col">
      {/* top bar */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-card px-4">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-foreground">
            Configy
          </span>
          <span className="text-border">/</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled Project"
            className={cn(
              "w-56 rounded-md bg-transparent px-1.5 py-1 font-mono text-[11px] tracking-[0.08em] text-foreground",
              "placeholder:text-muted-foreground/50 outline-none focus:bg-muted/40"
            )}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={importInputRef}
            type="file"
            accept="application/json,.json"
            onChange={onImportFile}
            className="hidden"
          />
          <button
            onClick={loadSample}
            title="Load the sample project"
            className={cn(
              "flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5",
              "font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground",
              "transition-colors hover:border-foreground/30 hover:text-foreground"
            )}
          >
            <Sparkles size={11} />
            Sample
          </button>
          <button
            onClick={() => importInputRef.current?.click()}
            title="Import project"
            className={cn(
              "flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5",
              "font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground",
              "transition-colors hover:border-foreground/30 hover:text-foreground"
            )}
          >
            <Upload size={11} />
            Import
          </button>
          <button
            onClick={exportProject}
            title="Export project"
            className={cn(
              "flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5",
              "font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground",
              "transition-colors hover:border-foreground/30 hover:text-foreground"
            )}
          >
            <Download size={11} />
            Export
          </button>

          {/* add config command button */}
          <button
            onClick={() => setOpen(true)}
            className={cn(
              "flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5",
              "font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground",
              "transition-colors hover:border-foreground/30 hover:text-foreground"
            )}
          >
            <Plus size={11} />
            Add Config
            <kbd className="ml-0.5 rounded border border-border px-1 py-0.5 font-mono text-[8px] text-muted-foreground/60">
              ⌘K
            </kbd>
          </button>

          {/* generate button */}
          <button
            onClick={generate}
            disabled={isGenerating || nodes.length === 0}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5",
              "bg-primary font-mono text-[10px] uppercase tracking-[0.12em] text-primary-foreground",
              "transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
            )}
          >
            <Zap size={11} />
            {isGenerating ? "Generating…" : "Generate"}
          </button>
        </div>
      </header>

      {/* main area */}
      <div className="flex flex-1 overflow-hidden">
        {/* sidebar */}
        <aside className="flex w-44 shrink-0 flex-col border-r border-border bg-card">
          <div className="border-b border-border p-3">
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
              Configs
            </p>
          </div>

          <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2">
            {nodes.map((node) => (
              <button
                key={node.id}
                onClick={() => focusNode(node.id)}
                className={cn(
                  "flex w-full items-center rounded-md px-2 py-1.5 text-left",
                  "font-mono text-[10px] tracking-[0.08em] transition-colors",
                  selectedNodeId === node.id
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
              >
                <span className="truncate">{node.data.label || "untitled"}</span>
              </button>
            ))}
          </div>

          <div className="border-t border-border p-2">
            <button
              onClick={() => setOpen(true)}
              className={cn(
                "flex w-full items-center gap-1.5 rounded-md px-2 py-1.5",
                "font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground",
                "hover:bg-accent hover:text-foreground transition-colors"
              )}
            >
              <Plus size={10} />
              Add Config
            </button>
          </div>
        </aside>

        {/* react flow canvas */}
        <div className="relative flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onPaneClick={onPaneClick}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            deleteKeyCode="Delete"
            nodesDraggable={!locked}
            nodesConnectable={!locked}
            elementsSelectable={!locked}
            className="bg-background"
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={24}
              size={1}
              color="oklch(0.97 0 0 / 10%)"
            />
            <FlowControls locked={locked} onLockToggle={toggleLock} />
          </ReactFlow>
        </div>

        {/* node editor panel */}
        <NodeEditor />
      </div>

      <GenerateModal />
      <CommandMenu open={open} onClose={() => setOpen(false)} />
    </div>
  )
}

export default function Page() {
  return (
    <ReactFlowProvider>
      <div className="h-screen">
        <Canvas />
      </div>
    </ReactFlowProvider>
  )
}
