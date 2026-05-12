"use client"

import { create } from "zustand"
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type NodeChange,
  type EdgeChange,
  type Connection,
  type Edge,
} from "@xyflow/react"
import {
  DEFAULT_PROJECT_TITLE,
  type ConfigNode,
  type ConfigNodeData,
  type GenerateResult,
  type Project,
} from "./types"
import { SAMPLE_PROJECT } from "./sampleProject"

function randomId(): string {
  return Math.random().toString(36).slice(2, 9)
}

function downloadJson(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

type ConfigStore = {
  title: string
  nodes: ConfigNode[]
  edges: Edge[]
  selectedNodeId: string | null
  isGenerating: boolean
  generateResults: GenerateResult[] | null
  loadGraph: () => Promise<void>
  loadSample: () => void
  saveGraph: () => Promise<void>
  setTitle: (title: string) => void
  exportProject: () => void
  importProject: (file: File) => Promise<void>
  addNode: (data: ConfigNodeData) => void
  updateNode: (id: string, data: Partial<ConfigNodeData>) => void
  deleteNode: (id: string) => void
  onNodesChange: (changes: NodeChange<ConfigNode>[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  onConnect: (connection: Connection) => void
  selectNode: (id: string | null) => void
  generate: () => Promise<void>
  closeModal: () => void
}

export const useConfigStore = create<ConfigStore>((set, get) => ({
  title: DEFAULT_PROJECT_TITLE,
  nodes: [],
  edges: [],
  selectedNodeId: null,
  isGenerating: false,
  generateResults: null,

  loadGraph: async () => {
    const res = await fetch("/api/graph")
    const data: Project = await res.json()
    set({
      title: data.title ?? DEFAULT_PROJECT_TITLE,
      nodes: data.nodes ?? [],
      edges: data.edges ?? [],
    })
  },

  loadSample: () => {
    set({
      title: SAMPLE_PROJECT.title,
      nodes: SAMPLE_PROJECT.nodes.map((n) => ({ ...n, data: { ...n.data } })),
      edges: SAMPLE_PROJECT.edges.map((e) => ({ ...e })),
      selectedNodeId: null,
    })
    get().saveGraph()
  },

  saveGraph: async () => {
    const { title, nodes, edges } = get()
    const project: Project = { title, nodes, edges }
    await fetch("/api/graph", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(project),
    })
  },

  setTitle: (title) => {
    set({ title })
    get().saveGraph()
  },

  exportProject: () => {
    const { title, nodes, edges } = get()
    const project: Project = { title, nodes, edges }
    const safeName = (title || DEFAULT_PROJECT_TITLE)
      .trim()
      .replace(/[^a-z0-9-_]+/gi, "-")
      .toLowerCase()
    downloadJson(`${safeName || "project"}.configy.json`, project)
  },

  importProject: async (file) => {
    const text = await file.text()
    const parsed = JSON.parse(text) as Partial<Project>
    set({
      title: parsed.title ?? DEFAULT_PROJECT_TITLE,
      nodes: parsed.nodes ?? [],
      edges: parsed.edges ?? [],
      selectedNodeId: null,
    })
    get().saveGraph()
  },

  addNode: (data) => {
    const nodeId = randomId()
    const node: ConfigNode = {
      id: nodeId,
      type: "configNode",
      position: {
        x: 150 + Math.random() * 400,
        y: 80 + Math.random() * 300,
      },
      data,
    }
    set((s) => ({ nodes: [...s.nodes, node] }))
    get().saveGraph()
  },

  updateNode: (id, data) => {
    set((s) => ({
      nodes: s.nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...data } } : n
      ),
    }))
    get().saveGraph()
  },

  deleteNode: (id) => {
    set((s) => ({
      nodes: s.nodes.filter((n) => n.id !== id),
      edges: s.edges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeId: s.selectedNodeId === id ? null : s.selectedNodeId,
    }))
    get().saveGraph()
  },

  onNodesChange: (changes) => {
    const removedIds = changes
      .filter((c) => c.type === "remove")
      .map((c) => c.id)

    set((s) => ({
      nodes: applyNodeChanges(changes, s.nodes),
      edges:
        removedIds.length > 0
          ? s.edges.filter(
              (e) =>
                !removedIds.includes(e.source) &&
                !removedIds.includes(e.target)
            )
          : s.edges,
      selectedNodeId:
        removedIds.includes(s.selectedNodeId ?? "")
          ? null
          : s.selectedNodeId,
    }))

    const shouldSave = changes.some(
      (c) =>
        (c.type === "position" && !c.dragging) ||
        (c.type !== "position" && c.type !== "select")
    )
    if (shouldSave) get().saveGraph()
  },

  onEdgesChange: (changes) => {
    set((s) => ({ edges: applyEdgeChanges(changes, s.edges) }))
    const shouldSave = changes.some((c) => c.type !== "select")
    if (shouldSave) get().saveGraph()
  },

  onConnect: (connection) => {
    set((s) => ({ edges: addEdge(connection, s.edges) }))
    get().saveGraph()
  },

  selectNode: (id) => {
    set({ selectedNodeId: id })
  },

  generate: async () => {
    set({ isGenerating: true, generateResults: null })
    const { nodes, edges } = get()
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodes, edges }),
      })
      const results: GenerateResult[] = await res.json()
      set({ generateResults: results })
    } finally {
      set({ isGenerating: false })
    }
  },

  closeModal: () => {
    set({ generateResults: null })
  },
}))
