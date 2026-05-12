import type { Node, Edge } from "@xyflow/react"

export type ValueType = "string" | "int" | "float" | "bool"

export const VALUE_TYPES: ValueType[] = ["string", "int", "float", "bool"]

export type HandleDef = {
  id: string
  label: string
  value?: string
  type?: ValueType
  // inputs only: when true, the input is also exposed as an output of the node
  passthrough?: boolean
}

export type ConfigNodeData = {
  label: string
  inputs: HandleDef[]
  outputs: HandleDef[]
}

export type ConfigNode = Node<ConfigNodeData>

export type GraphState = {
  nodes: ConfigNode[]
  edges: Edge[]
}

export type Project = {
  title: string
  nodes: ConfigNode[]
  edges: Edge[]
}

export const DEFAULT_PROJECT_TITLE = "Untitled Project"

export type GenerateResult = {
  filename: string
  path: string
  status: "created" | "error"
}
