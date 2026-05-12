import type { ConfigNodeData, HandleDef, ValueType } from "./types"
import type { ResolvedNode } from "./resolve"

type Entry = { label: string; value: string; type: ValueType }

function entries(data: ConfigNodeData, values: ResolvedNode): Entry[] {
  const out: Entry[] = []
  for (const output of data.outputs) {
    out.push(entryOf(output, values.outputs[output.label] ?? ""))
  }
  // passthrough inputs are appended to the outputs
  for (const input of data.inputs) {
    if (input.passthrough) out.push(entryOf(input, values.outputs[input.label] ?? ""))
  }
  for (const input of data.inputs) {
    if (!input.passthrough) out.push(entryOf(input, values.inputs[input.label] ?? ""))
  }
  return out
}

function entryOf(handle: HandleDef, value: string): Entry {
  return { label: handle.label, value, type: handle.type ?? "string" }
}

function coerce(value: string, type: ValueType): string | number | boolean {
  if (value === "") return type === "bool" ? false : type === "string" ? "" : 0
  if (type === "int") return Number.parseInt(value, 10) || 0
  if (type === "float") return Number.parseFloat(value) || 0
  if (type === "bool") return value === "true" || value === "1"
  return value
}

function generateEnv(data: ConfigNodeData, values: ResolvedNode): string {
  return entries(data, values).map((e) => `${e.label}=${e.value}`).join("\n") + "\n"
}

function generateJson(data: ConfigNodeData, values: ResolvedNode): string {
  const obj: Record<string, string | number | boolean> = {}
  for (const e of entries(data, values)) obj[e.label] = coerce(e.value, e.type)
  return JSON.stringify(obj, null, 2) + "\n"
}

function generateTs(data: ConfigNodeData, values: ResolvedNode): string {
  const lines = ["export const config = {"]
  for (const e of entries(data, values)) {
    lines.push(`  ${e.label}: ${JSON.stringify(coerce(e.value, e.type))},`)
  }
  lines.push("}", "")
  return lines.join("\n")
}

function generateYaml(data: ConfigNodeData, values: ResolvedNode): string {
  return entries(data, values).map((e) => `${e.label}: ${e.value}`).join("\n") + "\n"
}

function generateFallback(data: ConfigNodeData, values: ResolvedNode): string {
  return entries(data, values).map((e) => `${e.label}=${e.value}`).join("\n") + "\n"
}

export function generateFileContent(data: ConfigNodeData, values: ResolvedNode): string {
  const name = data.label
  const ext = name.includes(".") ? name.split(".").pop()?.toLowerCase() ?? "" : ""

  if (name === ".env" || name.startsWith(".env.")) return generateEnv(data, values)
  if (ext === "json") return generateJson(data, values)
  if (["ts", "tsx", "js", "mjs", "cjs"].includes(ext)) return generateTs(data, values)
  if (ext === "yaml" || ext === "yml") return generateYaml(data, values)
  return generateFallback(data, values)
}
