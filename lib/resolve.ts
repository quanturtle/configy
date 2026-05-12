import type { Edge } from "@xyflow/react"
import type { ConfigNode } from "./types"

export type ResolvedNode = {
  inputs: Record<string, string>
  outputs: Record<string, string>
}

type ResolveContext = {
  byId: Map<string, ConfigNode>
  edges: Edge[]
  cache: Map<string, ResolvedNode>
  inProgress: Set<string>
}

const EMPTY: ResolvedNode = { inputs: {}, outputs: {} }

function resolveInputValue(
  ctx: ResolveContext,
  nodeId: string,
  inputId: string,
  fallback: string
): string {
  const edge = ctx.edges.find(
    (e) => e.target === nodeId && e.targetHandle === `input-${inputId}`
  )
  if (!edge || !edge.sourceHandle?.startsWith("output-")) return fallback

  const sourceNode = ctx.byId.get(edge.source)
  if (!sourceNode) return fallback

  const sourceHandleId = edge.sourceHandle.slice("output-".length)
  const sourceOutput =
    sourceNode.data.outputs.find((o) => o.id === sourceHandleId) ??
    sourceNode.data.inputs.find((i) => i.id === sourceHandleId && i.passthrough)
  if (!sourceOutput) return fallback

  const resolvedSource = resolveNode(ctx, edge.source)
  return resolvedSource.outputs[sourceOutput.label] || fallback
}

function resolveNode(ctx: ResolveContext, nodeId: string): ResolvedNode {
  const cached = ctx.cache.get(nodeId)
  if (cached) return cached

  // cycle guard — break the loop without caching a partial result
  if (ctx.inProgress.has(nodeId)) return EMPTY
  const node = ctx.byId.get(nodeId)
  if (!node) return EMPTY

  ctx.inProgress.add(nodeId)

  // resolve inputs: connected source output value, else the input's own default
  const inputs: Record<string, string> = {}
  for (const input of node.data.inputs) {
    inputs[input.label] = resolveInputValue(ctx, nodeId, input.id, input.value ?? "")
  }

  // resolve outputs: explicit value, else pass through a same-named input
  const outputs: Record<string, string> = {}
  for (const output of node.data.outputs) {
    outputs[output.label] = output.value || inputs[output.label] || ""
  }
  // passthrough inputs are also exposed as outputs
  for (const input of node.data.inputs) {
    if (input.passthrough) outputs[input.label] = inputs[input.label] ?? ""
  }

  ctx.inProgress.delete(nodeId)
  const result: ResolvedNode = { inputs, outputs }
  ctx.cache.set(nodeId, result)
  return result
}

export function resolveValues(
  nodes: ConfigNode[],
  edges: Edge[]
): Map<string, ResolvedNode> {
  const ctx: ResolveContext = {
    byId: new Map(nodes.map((n) => [n.id, n])),
    edges,
    cache: new Map(),
    inProgress: new Set(),
  }
  for (const node of nodes) resolveNode(ctx, node.id)
  return ctx.cache
}
