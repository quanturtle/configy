import { NextResponse } from "next/server"
import { readFile, writeFile } from "fs/promises"
import { join } from "path"
import { DEFAULT_PROJECT_TITLE, type Project } from "@/lib/types"

const GRAPH_PATH = join(process.cwd(), "configy.json")

const EMPTY_PROJECT: Project = {
  title: DEFAULT_PROJECT_TITLE,
  nodes: [],
  edges: [],
}

export async function GET(): Promise<NextResponse> {
  try {
    const content = await readFile(GRAPH_PATH, "utf-8")
    const parsed = JSON.parse(content)
    const project: Project = {
      title: parsed.title ?? DEFAULT_PROJECT_TITLE,
      nodes: parsed.nodes ?? [],
      edges: parsed.edges ?? [],
    }
    return NextResponse.json(project)
  } catch {
    return NextResponse.json(EMPTY_PROJECT)
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  const body: Project = await request.json()
  const project: Project = {
    title: body.title ?? DEFAULT_PROJECT_TITLE,
    nodes: body.nodes ?? [],
    edges: body.edges ?? [],
  }
  await writeFile(GRAPH_PATH, JSON.stringify(project, null, 2), "utf-8")
  return NextResponse.json({ ok: true })
}
