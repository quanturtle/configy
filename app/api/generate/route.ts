import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import type { Edge } from "@xyflow/react"
import type { ConfigNode, GenerateResult } from "@/lib/types"
import { generateFileContent } from "@/lib/generate"
import { resolveValues } from "@/lib/resolve"

export async function POST(request: Request): Promise<NextResponse> {
  const { nodes, edges }: { nodes: ConfigNode[]; edges: Edge[] } =
    await request.json()

  const outputDir = join(process.cwd(), "generated")
  await mkdir(outputDir, { recursive: true })

  const values = resolveValues(nodes, edges)
  const results: GenerateResult[] = []

  for (const node of nodes) {
    const content = generateFileContent(node.data, values.get(node.id) ?? { inputs: {}, outputs: {} })
    // sanitize: strip ~/ prefix, replace remaining slashes with underscores
    const safeName = node.data.label.replace(/^~\//, "").replace(/\//g, "_")
    const filePath = join(outputDir, safeName)

    try {
      await writeFile(filePath, content, "utf-8")
      results.push({ filename: safeName, path: filePath, status: "created" })
    } catch {
      results.push({ filename: safeName, path: filePath, status: "error" })
    }
  }

  return NextResponse.json(results)
}
